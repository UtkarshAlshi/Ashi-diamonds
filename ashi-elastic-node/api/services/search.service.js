const query = require('./query.json')
const blankQuery = require('./queries') 
const axios = require('axios')
const axiosService = require('./axios.service')
const referenceService = require('../services/reference.services')
var { ElasticResponse } = require('../utils/response')
const elasticService = require('../services/elastic.service')
const globalSettings = require('../../global-settings.json') 
const utilService = require('../utils/util.service')
const constants = require('../utils/constants')
const { response } = require('express')
module.exports = {
    getSearchPopupData,
    getBestSellerData,
    getItemSearchData, 
    getTrendingData, 
    getCategoryData,
    getLeftSideFilterDataForSearch, //This is for the left side filter on search result page
    getSPOItemMaster,
    getLeadingJewelry
};



axios.interceptors.request.use(config => {
    // Add the Authorization header to every request
    const username = process.env.ELASTIC_USERNAME;
    const password = process.env.ELASTIC_USERNAME;
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    config.headers['Authorization'] = `Basic ${auth}`;
    config.headers['Content-Type'] = 'application/json';
    config.headers['Cache-Control'] = 'no-cache';

    return config;
}, error => {
    // Do something with request error
    return Promise.reject(error);
});

async function getLeftSideAdditionalClauses(query, data){

    let additionalClauseQuery = query ;
    let specAttributeFilter = []
    
    const fieldNames = await getSpecificationAttributeNamesForSearch() ;
    //if (data.CATEGORIES && data.CATEGORIES.length > 0) {
        //additionalClauseQuery.query.bool.filter[1].nested.query.bool.must.push({ "terms": { "category.CATEGORY_ID": data.CATEGORIES } });

        // let categoryFilter = {
        //     "nested": {
        //         "path": "category",
        //         "query": {
        //             "bool": {
        //                 "must": [
        //                             {
        //                                 "terms": {
        //                                     "category.CATEGORY_ID": data.CATEGORIES 
        //                                 }
        //                             }
        //                 ]
        //             }
        //         }
        //     }
        // }
        // additionalClauseQuery.query.bool.must.push(categoryFilter); 
    //}

    fieldNames.forEach(element => {
        if (data[element]){
            let filter = {
                "nested": {
                    "path": "SpecificationAttribute_Mapping",
                    "query": {
                    "bool": {
                        "must": [
                        {
                            "terms": {
                            ["SpecificationAttribute_Mapping."+ element]: data[element] 
                            }
                        }
                        ]
                    }
                    }
                }
            }
            additionalClauseQuery.aggs.attribute_aggs.filter.bool.must.push(filter) ;
            //specAttributeFilter.push(filter) ;
        }
        //const specAttribute = elasticService.getItemSpecificationAttributeQuery(element, data);
        //specAttribute !== null && shouldQueries.push(specAttribute);
        //specAttribute !== null && additionalClauseQuery.query.bool.must.push(specAttribute) ;

    })



    //newQuery.query.bool.filter[0].nested.query.bool.must[0].term['retailer_data.retailer_id'] = data.RETAILER_ID;
    let retailerPriceRange = getPriceRangeForSearch(data) 
    let stockStatusData = getRetailerDataWithStock(data.stockStatus, data.RETAILER_ID, retailerPriceRange )  ; 

    stockStatusData.stock_status_array.forEach((element) =>{
            additionalClauseQuery.query.bool.must.push(element) ;
        }
    )
    additionalClauseQuery.query.bool.must[0].nested = stockStatusData.retailer_data;
    
    
    

    //-- added price range filter based on discussion with Ajay on 07-Aug-2024
    ;

    // retailerPriceRange.forEach((priceObject) => {
    //     additionalClauseQuery.query.bool.must[0].nested.query.bool["should"] = [] ;
    //     additionalClauseQuery.query.bool.must[0].nested.query.bool.should.push(priceObject) ;
    //     additionalClauseQuery.query.bool.must[0].nested.query.bool["minimum_should_match"] = 1
    // })
    
    return additionalClauseQuery ;

}

function getRetailerDataWithStock(stockStatus, retailerId, retailerPriceRange){

    let stockStatusArray = [
        {
            "bool" : {
                "should"   : [] 
            }
        }

    ] ;

    let retailerData = {
                        "path": "retailer_data",
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        "term": {
                                            "retailer_data.retailer_id": retailerId
                                        }
                                    },
                                    {
                                        "bool":{
                                            "should": []
                                        }
                                        
                                    }
                                    
                                ]
                                
                                
                            }
                        },
                        "inner_hits": {
                            "_source": [
                                "retailer_data.Price",
                                "retailer_data.Price_Retail",
                                "retailer_data.Open_Order_Qty",
                                "retailer_data.Open_Memo_Qty",
                                "retailer_data.Invoice_Qty"
                            ]
                        }
                    }

    retailerPriceRange.forEach((priceObject) => {
        retailerData.query.bool.must[1].bool.should.push(priceObject)
    })
    

    let should = [] ;

    if (stockStatus && stockStatus.In_Stock){
        stockStatusArray[0].bool.should.push ( { "term": { "product_data.In_Stock": "True" } } )
    }
    if (stockStatus && stockStatus.In_Production){
        stockStatusArray[0].bool.should.push ( { "term": { "product_data.In_Production": "True" } } )
    }

    if (stockStatus && stockStatus.Open_Memo){
        should.push ( {"exists": {"field": "retailer_data.Open_Memo_Qty"}} )
    }
    if (stockStatus && stockStatus.Purchase){
        should.push ( {"exists": {"field": "retailer_data.Invoice_Qty"}} )
    }
    if (stockStatus && stockStatus.Open_Order){
        should.push ( {"exists": {"field": "retailer_data.Open_Order_Qty"}} )
    }

    if (should.length  > 0 ){
        retailerData.query.bool.must[1].bool["should"] = should ; 
        //retailerData.query.bool["minimum_should_match"] =  1 ;
    }
    return { "stock_status_array": stockStatusArray ,  "retailer_data": retailerData };

}
async function getLeftSideFilterDataForSearch(query_type, data) {
    //let menuQuery = blankQuery.getLeft//query[constants.LEFT_SIDE_FILTER_QUERY];
    let searchTerm = utilService.getSafeString(data.search_term) ;
    let newQuery = blankQuery.getLeftSideFilterForPrimarySearch(searchTerm, data.RETAILER_ID) ;
    newQuery = await getLeftSideAdditionalClauses(newQuery, data) ;
    
    try {
        let response = await axiosService.postData(process.env.INDEX_NAME, constants.QUERY_TYPE_SEARCH, newQuery)
        if (response.dataArray.hits.total.value == 0 ){
        
        
            menuQuery = blankQuery.getLeftSideFilterForSecondarySearch(data.search_term, data.RETAILER_ID) ;   
            menuQuery = await getLeftSideAdditionalClauses(menuQuery, data) ;     
            response = await axiosService.postData(process.env.INDEX_NAME, constants.QUERY_TYPE_SEARCH, menuQuery)
        }
        //--just adjusting the structure to match with product list, so adding category count at "aggregation" level.
        response.dataArray.aggregations["category_count"] = response.dataArray.aggregations.attribute_aggs.filtered_docs.category_count ; 

        return response ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}


async function getSearchPopupData(query_type, data) {

    let pageSize = 8 ;
    
    if (data.search_term){
        data.search_term = data.search_term.trim() ; 
    }

    
    let spoQuery = blankQuery.getSPOItemMaster(data.search_term)
    console.log("-------------------------SEARCH QUERY START SPO----------------------------------------") ;
    console.log(JSON.stringify(spoQuery));
    console.log("-------------------------SEARCH QUERY END SPO----------------------------------------") ;
    let allHits =  [];
    try {
        let response = await axiosService.postData(process.env.SPO_ITEM_MASTER_INDEX_NAME, query_type, spoQuery) ;
        allHits = response.dataArray ;
        spoLength = ( allHits && allHits.hits.hits && allHits.hits.hits.length ?  allHits.hits.hits.length : 0) 
        remainingLength = 0 ;
        //--If SPO query is producing 8 results, we dont need to search further
        if (spoLength >= pageSize){
            data.size = 1 ;
            let itemHitsForCount = await getItemSearchData(query_type, data) ; //-- This is only to get the total count to be displayed on "View All" on front end
            allHits.hits.total.value = itemHitsForCount.dataArray.hits.total.value ; 
            return new ElasticResponse(constants.SUCCESS_CODE, "", allHits, {})    
        }
        remainingLength = pageSize - spoLength ;
        data.size = remainingLength

        let itemHits = await getItemSearchData(query_type, data) ;
        
        itemHits.dataArray.hits.hits.forEach(hit => {
            allHits.hits.hits.push(hit) ;
        })
        allHits.hits.total.value = itemHits.dataArray.hits.total.value ; 
        return new ElasticResponse(constants.SUCCESS_CODE, "", allHits, {})
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
    
}


async function getBestSellerData(query_type, data) {
    let bestSellerQuery = blankQuery.getBestSellerQuery() ; 
    preparedStatement = await getBestSellerQuery(bestSellerQuery, data);
    console.log(JSON.stringify(preparedStatement)) ;
    try {
        let response = await axios.post(`${process.env.ELASTIC_URL}/${process.env.INDEX_NAME}/${query_type}`, preparedStatement)
        return new ElasticResponse(constants.SUCCESS_CODE, "", response.data, {})
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}

async function getItemSearchData(query_type, data) {
    //-- The below changes are done because when we takt the value from query.json, the subsequent calls will not initiate it with fresh query.
    let menuQuery = blankQuery.getItemSearchPrimary(data.search_term) ;//query[constants.SEARCH_RESULT_QUERY];
    preparedStatement = await getItemSearchQuery(menuQuery, data);
    console.log("-------------------------ITEM SEARCH QUERY PRIMARY START----------------------------------------") ;
    console.log(JSON.stringify(preparedStatement));
    console.log("-------------------------ITEM SEARCH QUERY PRIMARY END----------------------------------------") ;
    try {
        let response = await axiosService.postData(process.env.INDEX_NAME, query_type, preparedStatement) ;
        if (!response.dataArray.hits || response.dataArray.hits.hits.length <= 0) {
            menuQuery = blankQuery.getItemSearchSecondary(data.search_term) ; 
            preparedStatement = await getItemSearchQuery(menuQuery, data);
            console.log("-------------------------ITEM SEARCH QUERY SECONDARY START----------------------------------------") ;
            console.log(JSON.stringify(preparedStatement));
            console.log("-------------------------ITEM SEARCH QUERY SECONDARY END----------------------------------------") ;
        
            response = await axiosService.postData(process.env.INDEX_NAME, query_type, preparedStatement) ;

        }
        return response ; 
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}


async function getBlankTrendingResponse(query_type, data){
    let blankTrendingQuery = blankQuery.getBlankTrendingForLeftSide() ;
    let blankTrendingResponse= await axiosService.postData(process.env.TRENDING_INDEX_NAME, query_type, blankTrendingQuery) ;
    globalSettings.search_grid.trending_keywords?.forEach(keyword => {
        blankTrendingResponse.dataArray.hits.hits.push(
            {"_source": {
                    "Search_Keyword": keyword,
                    "Search_Count": 100
                }
            }
        )
    })

    return blankTrendingResponse;
}
async function getTrendingData(query_type, data){
    if (!data.search_term || data.search_term == ""){
        console.log("Blank Trending");
        return await getBlankTrendingResponse(query_type, data) ; 
    }
    let preparedStatement = blankQuery.getTrendingProducts(data.search_term)
    console.log("-------------------------SEARCH QUERY TRENDING PRODUCT PRIMARY START----------------------------------------") ;
    console.log(JSON.stringify(preparedStatement));
    console.log("-------------------------SEARCH QUERY TRENDING PRODUCT PRIMARY END----------------------------------------") ;
    console.log(JSON.stringify(preparedStatement)) ;
    try {
        let response = await axiosService.postData(process.env.TRENDING_INDEX_NAME, query_type, preparedStatement) ;
        if (!response.dataArray.hits || response.dataArray.hits.hits.length <= 0){
            preparedStatement = blankQuery.getTrendingProductsSecondary(data.search_term)
            console.log("-------------------------SEARCH QUERY TRENDING PRODUCT SECONDARY START----------------------------------------") ;
            console.log(JSON.stringify(preparedStatement));
            console.log("-------------------------SEARCH QUERY TRENDING PRODUCT SECONDARY END----------------------------------------") ;
        
            response = await axiosService.postData(process.env.TRENDING_INDEX_NAME, query_type, preparedStatement) ;
        }


        //--IF there are no values in trending after doing all above, we should bring the default search from global-settings
        if (!response.dataArray.hits.hits || response.dataArray.hits.hits.length <= 0){
            return  getBlankTrendingResponse(query_type, data) ;
        }

        return response ; 
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}


async function getBestSellerQuery(bestSellerQuery, data){
    newQuery = bestSellerQuery;
    newQuery.query.bool.filter[1].nested.query.bool.must[0].term['retailer_data.retailer_id'] = data.RETAILER_ID;
    newQuery.size = (data.size ? data.size : 0)
    //newQuery.from = data.page_number ;
    if (data.page_number > 1){
        newQuery.from = ( (data.page_number - 1) * newQuery.size ) + 1
    }
    else {
        newQuery.from  = 0 ; 
    }

    return newQuery;
}



//-- This is the query that gets fired when user enters some search term on "Search Input" field and hit enter
async function getItemSearchQuery(itemQuery, data){

    let stockStatusQuery =
    {
        "bool": {
            "should": []
        }
    }

    newQuery = itemQuery;
    //newQuery.query.bool.filter[0].nested.query.bool.must[0].term['retailer_data.retailer_id'] = data.RETAILER_ID;
    //newQuery.query.bool.must[0].nested.query.bool.must[0].match['retailer_data.retailer_id'] = data.RETAILER_ID;
    newQuery.size= data.size ; 
    //newQuery.from= ( data.page_number - 1 > 0 ? data.page_number - 1 : 0 ) ;; 
    if (data.page_number > 1){
        newQuery.from = ( (data.page_number - 1) * newQuery.size ) + 1
    }
    else {
        newQuery.from  = 0 ; 
    }

    // for (let key in data.stockStatus) {
    //     if (data.stockStatus.hasOwnProperty(key)) {
    //       if (data.stockStatus[key] == true){
    //         let statusKey = `product_data.${key}` ;
    //         stockStatusQuery.bool.should.push({
    //             "term": {
    //                 [statusKey]: "True"
    //             }
    //         })
    //       }
    //     }
    // }

    // newQuery.query.bool.must.push(stockStatusQuery) ;

    let stockStatusData = getRetailerDataWithStock(data.stockStatus, data.RETAILER_ID, [] )  ; 

    stockStatusData.stock_status_array.forEach((element) =>{
        newQuery.query.bool.must.push(element) ;
        }
    )
    newQuery.query.bool.must[0].nested = stockStatusData.retailer_data;

    const fieldNames = await elasticService.getSpecificationAttributeNames();
    const filterQueries = [];
    fieldNames.forEach(element => {
        const specAttribute = elasticService.getItemSpecificationAttributeQuery(element, data);
        if (specAttribute != null) {
            specAttribute !== null && filterQueries.push(specAttribute) ;
        }
        
    })


    if (filterQueries.length >0){
        newQuery.query.bool["filter"] = filterQueries  ;
    } 

    if (data.sort){
        let sortClause = elasticService.getSortingClause(data.sort.field, data.sort.order) ;
        newQuery.sort.push(sortClause[0])
    }
    else{
        let defaultSortField = globalSettings.pages['pos-product-list-page'].sort_by
        let defaultSortClause = elasticService.getSortingClause(defaultSortField, "asc") ;
        newQuery.sort.push(defaultSortClause[0])
        
    }


    return newQuery ; 

}



async function getLeftCategoriesForBlankSearch(query_type, data){
    let responseArray = { "dataArray" : { "hits" : {"hits" : []}}} ;
    let blankQueryCategories = blankQuery.getBlankCategoryForLeftSide() ;
        let blankQueryResponse = await axiosService.postData(process.env.INDEX_NAME, query_type, blankQueryCategories) ;
        blankQueryResponse.dataArray.aggregations.distinct_categories.by_category_id.buckets.forEach(function (categoryresult) {
            let categoryId = categoryresult.top_category_hits.hits.hits[0]._source.CATEGORY_ID ;
            let categoryName =  categoryresult.top_category_hits.hits.hits[0]._source.CATEGORY_DISPLAY_NAME ;
            let parentCategoryId =  categoryresult.top_category_hits.hits.hits[0]._source.PARENT_CATEGORY_ID ;
            if (!responseArray.dataArray.hits.hits.some(hit => hit.categoryId === categoryId)) {
                responseArray.dataArray.hits.hits.push({
                    "categoryName": categoryName,
                    "categoryId": categoryId,
                    "parentCategoryId": parentCategoryId
                })
                // uniqueCategories.set(categoryId, {
                //     "categoryName": categoryName,
                //     "categoryId": categoryId
                // });
            }
        });

        let sortedBlankCategories = responseArray.dataArray.hits.hits.sort(function (a, b) {
            return a.categoryName.localeCompare(b.categoryName);
        });


        return new ElasticResponse(constants.SUCCESS_CODE, "", sortedBlankCategories, {}) ;  
}

async function getCategoryData(query_type, data){
    let responseArray = { "dataArray" : { "hits" : {"hits" : []}}} ;
    if (!data.search_term || data.search_term == ""){
        return await getLeftCategoriesForBlankSearch(query_type, data) ;
        
    }
    let preparedStatement = blankQuery.getCategoryQueryPrimary(data.search_term) ;//query[constants.SEARCH_RESULT_QUERY];
     
   
    try {
        let response = await axiosService.postData(process.env.INDEX_NAME, query_type, preparedStatement) ;
        if (!response.dataArray.hits || response.dataArray.hits.hits.length <= 0) {
           
            preparedStatement = blankQuery.getCategoryQuerySecondary(data.search_term)
            response = await axiosService.postData(process.env.INDEX_NAME, query_type, preparedStatement) ;

        }
       
       
        var uniqueCategories = new Map();
        response.dataArray.hits.hits.forEach(function (categoryresult) {
            let categoryId = categoryresult.fields.default_category_info[0].CATEGORY_ID ;
            let categoryName = categoryresult.fields.default_category_info[0].CATEGORY_DISPLAY_NAME ;
            let parentCategoryId = categoryresult.fields.default_category_info[0].PARENT_CATEGORY_ID ;
            if (!responseArray.dataArray.hits.hits.some(hit => hit.categoryId === categoryId)) {
                responseArray.dataArray.hits.hits.push({
                    "categoryName": categoryName,
                    "categoryId": categoryId,
                    "parentCategoryId": parentCategoryId
                })
                // uniqueCategories.set(categoryId, {
                //     "categoryName": categoryName,
                //     "categoryId": categoryId
                // });
            }
        });


        var sortedCategories = responseArray.dataArray.hits.hits
        .filter(item => item.categoryId != null)
        .sort(function (a, b) {
            return a.categoryName.localeCompare(b.categoryName);
        });

        if (sortedCategories.length <= 0){
            return await getLeftCategoriesForBlankSearch(query_type, data) ; 
        }


        return new ElasticResponse(constants.SUCCESS_CODE, "", sortedCategories, {}) ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}





async function getSPOItemMaster(query_type, data){
    let preparedStatement = blankQuery.getSPOItemMaster(data.search_term) ;//query[constants.SEARCH_RESULT_QUERY];
     
    
    try {
        let response = await axiosService.postData(process.env.SPO_ITEM_MASTER_INDEX_NAME, query_type, preparedStatement) ;
        if (!response.dataArray.hits || response.dataArray.hits.hits.length <= 0) {
            
            preparedStatement = blankQuery.getCategoryQuerySecondary(data.search_term)
            response = await axiosService.postData(process.env.INDEX_NAME, query_type, preparedStatement) ;

        }
        return response ; 
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}


async function getLeadingJewelry(query_type, data){
    let preparedStatement = blankQuery.getLeadingJewlery(data.search_term) ;//query[constants.SEARCH_RESULT_QUERY];
     
    
    try {
        let response = await axiosService.postData(process.env.INDEX_NAME, query_type, preparedStatement) ;
        if (!response.dataArray.hits || response.dataArray.hits.hits.length <= 0) {
            
            preparedStatement = blankQuery.getCategoryQuerySecondary(data.search_term)
            response = await axiosService.postData(process.env.INDEX_NAME, query_type, preparedStatement) ;

        }
        return response ; 
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}

async function getSpecificationAttributeNamesForSearch() {
    let fieldData = referenceService.getReferenceDataForSearch();
    return fieldData
        .filter(item => typeof item.data_value === "string") // Filter only string `data_value`
        .map(item => item.data_value); // Extract `data_value`
    // fieldArray = [];
    // fieldData.forEach(element => {
    //     fieldArray.push(element.data_value)
    // })
    // return fieldArray;

}

function getPriceRangeForSearch(data){
    if (data.Price_Range && data.Price_Range.length > 0 ){
        let priceRangeData = [] ;
        if (data.PARENT_CATEGORY_ID && data.PARENT_CATEGORY_ID == constants.SILVER_CATEGORY_ID ) {
            priceRangeData = globalSettings.pages['search-product-list-page'].side_filters.price_range.silver_category_id_69;
        }
        else{
            priceRangeData = globalSettings.pages['search-product-list-page'].side_filters.price_range.all_pages_not_silver ;
        }

        let priceRanges =[] ;
        
        if (data.Price_Range_Type == "Custom") {
            priceRanges = data.Price_Range ; 
        }
        else{
            priceRanges = priceRangeData.filter(item => data.Price_Range.includes(item.price_range_display)).map(item => item.price_range_value);
        }
            
        let retailerPriceRange = [] ;//newQuery.query.bool.filter.filter(item => item.nested && item.nested.path === "retailer_data");
        priceRanges.forEach(element => {
            let priceObject = {
                "range": {
                    "retailer_data.Price": element
                }
            }
            //retailerPriceRange[0].nested.query.bool.must[1].bool.should.push(priceObject) ;
            retailerPriceRange.push(priceObject) ;
        });
        return retailerPriceRange ;
    }
    return [] ;
}