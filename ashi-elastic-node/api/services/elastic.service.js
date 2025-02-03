const blankQuery = require('./queries')
const axios = require('axios')
var { ElasticResponse } = require('../utils/response')
const referenceService = require('../services/reference.services')
const globalSettings = require('../../global-settings.json')
const constants = require('../utils/constants')
module.exports = {
    getFilterDataForProductList,
    getItemData,
    getSpecificationAttributeNames,
    getItemSpecificationAttributeQuery,
    getSearchData,
    getStockStatusQuery,
    getSortingClause,
    getExcludedAttributesSummaryData,
    getRelatedItems
};

axios.interceptors.request.use(config => {
    // Add the Authorization header to every request
    const username = process.env.ELASTIC_USERNAME;
    const password = process.env.ELASTIC_PASSWORD;
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    config.headers['Authorization'] = `Basic ${auth}`;
    config.headers['Content-Type'] = 'application/json';
    config.headers['Cache-Control'] = 'no-cache';

    return config;
}, error => {
    // Do something with request error
    return Promise.reject(error);
});

async function getFilterDataForProductList(query_type, data) {
    let menuQuery = blankQuery.getLeftSideQuery(data.PARENT_CATEGORY_ID, data.RETAILER_ID); //blankQuery[constants.LEFT_SIDE_FILTER_QUERY];
    preparedStatement = await getLeftSideFilterQueryForProductList(menuQuery, data);
    console.log(JSON.stringify(preparedStatement))
    try {
        let response = await axios.post(`${process.env.ELASTIC_URL}/${process.env.INDEX_NAME}/${query_type}`, preparedStatement)

        //-- once response is generated, add category data to it. Since category data cannot have categoryId, it can be fetched based on ONLY parent category id
        let leftParentCategoryQuery = blankQuery.getLeftSideQueryForParentCategoryId(data.PARENT_CATEGORY_ID, data.RETAILER_ID);
        let leftData = await axios.post(`${process.env.ELASTIC_URL}/${process.env.INDEX_NAME}/${query_type}`, leftParentCategoryQuery);
        //response.data.aggregations["category_type_count"] = leftData.data.aggregations["category_count"] ;
        response.data.aggregations.attribute_aggs.filtered_docs["product_type_count"] = getProductType(leftData.data.aggregations["category_count"]);
        response.data.aggregations.attribute_aggs.filtered_docs["price_range_count"] = formatPriceRange(response.data.aggregations.retailer_price.filtered_docs["price_range_count"])



        return new ElasticResponse(constants.SUCCESS_CODE, "", response.data, {})
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}

async function getExcludedAttributesSummaryData(query_type, payloadWithExcludedAttributes) {

    try {
        let responseWithExcludedAttributes = await axios.post(`${process.env.ELASTIC_URL}/${process.env.INDEX_NAME}/${query_type}`, payloadWithExcludedAttributes);
        if (responseWithExcludedAttributes.data.aggregations) {
            return responseWithExcludedAttributes.data.aggregations.attribute_aggs.filtered_docs;
        }
        return []

    } catch (error) {
        console.log(error);
        return null;
    }


}

async function getLeftSideFilterQueryForProductList(query, data) {
    newQuery = query;
    const fieldNames = await getSpecificationAttributeNames();
    //newQuery.query.bool.filter[1].nested.query.bool.must = [];
    if (data.PARENT_CATEGORY_ID) {
        newQuery.query.bool.filter[1].nested.query.bool.must.push({ "term": { "category.PARENT_CATEGORY_ID": data.PARENT_CATEGORY_ID } });
        //newQuery.aggs.category_count.aggs.filtered_docs.filter.bool.should.push({ "term": { "category.PARENT_CATEGORY_ID": data.PARENT_CATEGORY_ID } });
    }


    if (data.CATEGORIES && data.CATEGORIES.length > 0) {
        //-- remove the id which is equal to parent category id from this array
        data.CATEGORIES = data.CATEGORIES.filter((item) => {
            if (item && item.hasOwnProperty("id")) {
                return item.id !== parseInt(data.PARENT_CATEGORY_ID);
            }

            return item !== parseInt(data.PARENT_CATEGORY_ID);
        });
        if (data.CATEGORIES && data.CATEGORIES.length > 0) {
            newQuery.query.bool.filter[1].nested.query.bool.must.push({ "terms": { "category.CATEGORY_ID": data.CATEGORIES } });
        }
    }

    const shouldQueries = [];
    fieldNames.forEach(element => {

        //if the element name is PRoduct_Type, convert it to Category_Type because in elasticsearch it is stored as Category_Type in specification attribute mapping and for product list
        // we must use Category_Type to fetch the data from elasticsearch
        /*
        if (element == "Product_Type") {
            element = "Category_Type" ;
            data.Category_Type = data.Product_Type ;
        }
        */

        const specAttribute = getItemSpecificationAttributeQuery(element, data);
        //specAttribute !== null && shouldQueries.push(specAttribute);
        specAttribute !== null && newQuery.query.bool.filter.push(specAttribute);

    })
    //newQuery.query.bool.filter[2].nested.query.bool.must = shouldQueries;
    newQuery.query.bool.filter[0].nested.query.bool.must[0].term['retailer_data.retailer_id'] = data.RETAILER_ID;

    if (data.stockStatus) {
        newQuery.query.bool.filter.push(getStockClause(data));
    }

    //-- added price range filter based on discussion with Ajay on 07-Aug-2024
    let retailerPriceRange = getPriceRange(data);

    if (retailerPriceRange && retailerPriceRange.length && retailerPriceRange.length > 0) {
        newQuery.query.bool.filter[0].nested.query.bool["should"] = [];
        retailerPriceRange.forEach((priceObject) => {
            newQuery.query.bool.filter[0].nested.query.bool.should.push(priceObject);
            newQuery.query.bool.filter[0].nested.query.bool["minimum_should_match"] = 1
        })
    }
    return newQuery;

}

function getProductType(categoryData) {
    let returnData = { "buckets": [] };
    categoryData.filtered_docs.category_type_count.buckets.forEach(category => {
        returnData.buckets.push(
            {
                "doc_count": category.doc_count,
                "key": {
                    "category_id": category.key.category_id,
                    "product_type_count": category.key.category_name,
                    "seq_num": category.key.seq_num,

                }
            }
        )
    })
    return returnData;
}


async function getItemData(query_type, data) {
    let menuQuery = {};
    menuQuery = blankQuery.getItemQuery();
    preparedStatement = await getItemQuery(menuQuery, data);
    console.log(JSON.stringify(preparedStatement))
    //preparedStatement = await getPreparedStatement(constants.ITEM_QUERY, data);
    try {
        let response = await axios.post(`${process.env.ELASTIC_URL}/${process.env.INDEX_NAME}/${query_type}`, preparedStatement)
        return new ElasticResponse(constants.SUCCESS_CODE, "", response.data, {})
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}

async function getSearchData(query_type, data) {
    let menuQuery = blankQuery[constants.SEARCH_RESULT_QUERY];
    preparedStatement = await getSearchQuery(menuQuery, data);
    //console.log(JSON.stringify(preparedStatement)) ;
    try {
        let response = await axios.post(`${process.env.ELASTIC_URL}/${process.env.INDEX_NAME}/${query_type}`, preparedStatement)
        return new ElasticResponse(constants.SUCCESS_CODE, "", response.data, {})
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}

//-- This query is for PRODUCT LIST page
async function getItemQuery(query, data) {
    let newQuery = query;
    newQuery.query.bool.filter[1].nested.query.bool.must = [];

    //-- if there is a search term in this query then add that
    // if (data.search_term) {
    //     let searchQuery = getSearchQuery(data.search_term);
    // }

    if (data.PARENT_CATEGORY_ID && data.PARENT_CATEGORY_ID > 0) {

        newQuery.query.bool.filter[1].nested.query.bool.must.push({
            "term": { "category.PARENT_CATEGORY_ID": data.PARENT_CATEGORY_ID }
        });

    }

    // if (data.PARENT_CATEGORY_ID && data.PARENT_CATEGORY_ID == constants.LATEST_TREND_CATEGORY_ID){
    //     newQuery.query.bool.filter.push({
    //         "term": { "product_data.IS_NEW_ITEM": 1 }
    //     });
    // }

    //data.CATEGORIES = data.CATEGORIES.filter(item => item !== parseInt(data.PARENT_CATEGORY_ID));
    if (data.CATEGORIES && data.CATEGORIES.length > 0) {
        let categories = data.CATEGORIES.filter((item) => {
            return item !== parseInt(data.PARENT_CATEGORY_ID);
        });

        if (categories && categories.length > 0) {
            newQuery.query.bool.filter[1].nested.query.bool.must.push({
                "terms": { "category.CATEGORY_ID": categories }
            });
        }
    }


    const fieldNames = await getSpecificationAttributeNames();
    const shouldQueries = [];
    let specificationAttributeExist = false;
    let nestedQuery = blankQuery.getSpecificationAttributeNestedQuery();
    fieldNames.forEach(element => {
        const specAttribute = getItemSpecificationAttributeQuery(element, data);
        if (specAttribute != null) {
            specAttribute !== null && newQuery.query.bool.filter.push(specAttribute);
        }

    })

    let retailerPriceRange = getPriceRange(data);

    //newQuery.query.bool.filter[0].nested.query.bool.must[0].term['retailer_data.retailer_id'] = data.RETAILER_ID;

    let stockStatus = getStockStatusQuery(data.stockStatus, data.RETAILER_ID, retailerPriceRange)
    if (stockStatus.stock_status_array[0].bool.should.length > 0) {
        newQuery.query.bool.must = stockStatus.stock_status_array;
    }

    //if (stockStatus.retailer_data.nested.query.bool.should.length > 0 ){
    newQuery.query.bool.filter[0].nested = stockStatus.retailer_data;
    //}


    if (data.Stock && data.Stock.length > 0) {
        newQuery.query.bool.filter.push(getStockClause(data));
    }

    newQuery.size = (!data.size || data.size == null ? globalSettings.default.product_per_page.per_page : data.size)
    if (data.page_number > 1) {
        //newQuery.from = ((data.page_number - 1) * newQuery.size)  + 1
        newQuery.from = ((data.page_number - 1) * newQuery.size)
    }
    else {
        newQuery.from = 0;
    }


    if (data.sort) {
        newQuery.sort = getSortingClause(data.sort.field, data.sort.order, data.PARENT_CATEGORY_ID);
    }
    else {
        let defaultSortField = globalSettings.pages['pos-product-list-page'].sort_by
        newQuery.sort = getSortingClause(defaultSortField, "asc");
    }


    return newQuery;

}

function getPriceRange(data) {
    if (data.Price_Range && data.Price_Range.length > 0) {
        let priceRangeData = [];
        if (data.PARENT_CATEGORY_ID && data.PARENT_CATEGORY_ID == constants.SILVER_CATEGORY_ID) {
            priceRangeData = globalSettings.default.side_filters.price_range.silver_category_id_69;
        }
        else {
            priceRangeData = globalSettings.default.side_filters.price_range.all_pages_not_silver;
        }

        let priceRanges = [];

        if (data.Price_Range_Type == "Custom") {
            priceRanges = data.Price_Range;
        }
        else {


            if (data.Price_Range && data.Price_Range.length > 0) {
                if (data.Price_Range[0].option_id) {
                    // Iterate through the Price_Range array
                    for (let j = 0; j < data.Price_Range.length; j++) {
                        let searchItem = data.Price_Range[j];
                        console.log("Searching for:", searchItem);

                        // Iterate through the PriceRangeData array
                        for (let i = 0; i < priceRangeData.length; i++) {
                            let currentItem = priceRangeData[i];
                            console.log("Checking item:", currentItem);

                            // Check if the current item's option_id matches the search item's option_id
                            if (currentItem.option_id === searchItem.option_id) {
                                console.log("Match found:", currentItem);

                                // Add to the filtered array
                                priceRanges.push(currentItem.price_range_value);
                            }
                        }
                    }
                }
                else {
                    priceRanges = priceRangeData.filter(item => data.Price_Range.includes(item.price_range_display)).map(item => {
                        item.price_range_value
                    });
                }

            }

        }

        let retailerPriceRange = [];//newQuery.query.bool.filter.filter(item => item.nested && item.nested.path === "retailer_data");
        priceRanges.forEach(element => {
            let priceObject = {
                "range": {
                    "retailer_data.Price": element
                }
            }
            //retailerPriceRange[0].nested.query.bool.must[1].bool.should.push(priceObject) ;
            retailerPriceRange.push(priceObject);
        });
        return retailerPriceRange;
    }
    return [];
}

async function getSearchQuery(query, data) {
    newQuery = query;
    newQuery.query.bool.must[0].multi_match.query = data.search_keywords;

    const fieldNames = await getSpecificationAttributeNames();
    const shouldQueries = [];
    fieldNames.forEach(element => {
        shouldQueries.push({ "term": { [`SpecificationAttribute_Mapping.${element}`]: data.search_keywords } })
    })

    newQuery.query.bool.filter[0].nested.query.bool.must[0].term['retailer_data.retailer_id'] = data.RETAILER_ID;
    //newQuery.query.bool.should[0].nested.query.bool.must = shouldQueries;
    newQuery.size = (data.size ? data.size : 0)
    //newQuery.from = data.page_number
    if (data.page_number > 1) {
        newQuery.from = ((data.page_number - 1) * newQuery.size) + 1
    }
    else {
        newQuery.from = 0;
    }

    return newQuery;
}

function getItemSpecificationAttributeQuery(field_name, data) {
    //-- this change is made to accomodate the structure which ASHI is building. Otherwise iwt was data[field_name]
    let fieldData = data[field_name]
    let returnData = null;
    if (fieldData && fieldData.length > 0) {
        let key = "SpecificationAttribute_Mapping." + field_name
        returnData = {
            "nested": {
                "path": "SpecificationAttribute_Mapping",
                "query": {
                    "bool": {
                        "should": [
                            {
                                "terms": {
                                    [key]: fieldData

                                }
                            }
                        ]
                    }
                }
            }
        }
        //return { "terms": { [`SpecificationAttribute_Mapping.${field_name}`]: fieldData } };
    }




    return returnData;
}

async function getSpecificationAttributeNames() {
    let fieldData = referenceService.getReferenceData();
    fieldArray = [];
    fieldData.forEach(element => {
        fieldArray.push(element.data_value)
    })
    return fieldArray;

}

//-- This is the query that gets fired when user enters some search term on "Search Input" field and hit enter
async function getSearchQueryTerm(searchTerm) {
    let searchQuery = {
        "query": {
            "bool": {
                "must": [
                    {
                        "multi_match": {
                            "query": searchTerm,
                            "fields": ["product_data.ITEM_NAME", "product_data.SHORT_WEB_DESC", "product_data.search_keywords^3", "SpecificationAttribute_Mapping.CustomValue^2"],
                            "type": "phrase"
                        }
                    }
                ]
            }
        }
    }
    return searchQuery

}


function getStockStatusQuery(stockStatus, retailerId, retailerPriceRange) {
    let stockStatusArray = [
        {
            "bool": {
                "should": []
            }
        }

    ];



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
                        "bool": {
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



    let should = [];

    if (stockStatus && stockStatus.In_Stock) {
        stockStatusArray[0].bool.should.push({ "term": { "product_data.In_Stock": "True" } })
    }
    if (stockStatus && stockStatus.In_Production) {
        stockStatusArray[0].bool.should.push({ "term": { "product_data.In_Production": "True" } })
    }

    if (stockStatus && stockStatus.Open_Memo) {
        should.push({ "exists": { "field": "retailer_data.Open_Memo_Qty" } })
    }
    if (stockStatus && stockStatus.Purchase) {
        should.push({ "exists": { "field": "retailer_data.Invoice_Qty" } })
    }
    if (stockStatus && stockStatus.Open_Order) {
        should.push({ "exists": { "field": "retailer_data.Open_Order_Qty" } })
    }

    if (should.length > 0) {
        retailerData.query.bool.must.push({ "bool": { should } });
        // retailerData.query.bool["minimum_should_match"] =  1 ;

    }
    // if (stockStatus && stockStatus.my_stock){
    //     retailerData.nested.query.bool.should.push ( {"exists": {"field": "retailer_data.My_Stock"}} )
    // }
    return { "stock_status_array": stockStatusArray, "retailer_data": retailerData };
}

function getSortingClause(sortField, orderBy, categoryId = null) {


    if (categoryId == constants.LATEST_TREND_CATEGORY_ID) {
        return [

            {
                "product_data.IS_NEW_ITEM": {
                    "order": "desc"
                }
            },
            {
                "product_data.BestSeller_DisplayOrder": {
                    "order": "asc"
                }
            },
            {
                "product_data.CREATE_DATE": {
                    "order": "desc"
                }
            }
        ]
    }

    if (sortField == "price") {
        return [
            {
                "retailer_data.Price": {
                    "order": orderBy,
                    "nested": {
                        "path": "retailer_data"
                    }
                }
            }
        ];
    }

    if (sortField == "diamond_weight") {
        return [
            {
                "SpecificationAttribute_Mapping.Total_Diamond_Wt_Appx": {
                    "order": orderBy,
                    "nested": {
                        "path": "SpecificationAttribute_Mapping"
                    }
                }
            }
        ]
    }

    if (sortField == "best-sellers") {
        return [
            {
                "product_data.BestSeller_DisplayOrder": {
                    "order": "asc"
                }
            }
        ]
    }


    if (sortField == "new_item") {
        return [
            {
                "product_data.CREATE_DATE": {
                    "order": "desc"
                }
            }
        ]
    }

}


function getStockClause(data) {
    let stockClause = { "bool": { "should": [] } }

    for (const key in data.stockStatus) {
        let statusKey = key;
        if (data.stockStatus[statusKey] === true) {
            let pushKey = "product_data." + statusKey;
            stockClause.bool.should.push({
                "match": {
                    [pushKey]: "True"
                }
            })
        }
    }

    return stockClause;
}


function formatPriceRange(resultSetPriceRanges) {
    let priceRanges = globalSettings.default.side_filters.price_range.all_pages_not_silver;

    let buckets = { "buckets": [] }
    resultSetPriceRanges.buckets.forEach(displayValue => {
        // Normalize the input range
        const [inputFrom, inputTo] = displayValue.key.split("-").map(Number);
        let index = 0;
        // Iterate through the array to find the matching range
        for (const range of priceRanges) {
            index++;
            const rangeFrom = range.price_range_value.from;
            const rangeTo = range.price_range_value.to;

            // Compare the numeric values of the ranges
            if (inputFrom === rangeFrom && inputTo === rangeTo) {
                buckets.buckets.push({ "option_id": range.option_id, "doc_count": displayValue.doc_count, "key": { "price_range_count": range.price_range_display, "seq_num": index } });
            }

            if (inputFrom === rangeFrom && Number.isNaN(inputTo)) {
                buckets.buckets.push({ "option_id": range.option_id, "doc_count": displayValue.doc_count, "key": { "price_range_count": range.price_range_display, "seq_num": index } });
            }
        }
    })



    // Return null or an appropriate message if no match is found
    return buckets;
}

async function getRelatedItems(itemsData, retailerId) {
    let itemsArray = JSON.parse(itemsData);
    let query = blankQuery.getRelatedItemsQuery();
    query.query.bool.must[0].nested.query.bool.must[0].term["retailer_data.retailer_id"] = retailerId;
    query.query.bool.must[1].terms["product_data.ITEM_ID"] = itemsArray;
    //query.query.terms["product_data.ITEM_ID"] = itemsArray;
    console.log(query);
    let response = await axios.post(`${process.env.ELASTIC_URL}/${process.env.INDEX_NAME}/_search`, query);
    return response.data;
}