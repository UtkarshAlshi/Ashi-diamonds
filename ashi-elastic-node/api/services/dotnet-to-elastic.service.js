const blankQuery = require('./queries')
const axios = require('axios')

var { ElasticResponse } = require('../utils/response')
const referenceService = require('../services/reference.services')
const fs = require('fs')
const globalSettings = require('../../global-settings.json')
const constants = require('../utils/constants')
const axiosService = require('../services/axios.service')
const elasticService = require('../services/elastic.service')
const searchService = require('../services/search.service')
const ashiProductListResponseService = require('../services/ashi-product-list-response.service');
const ashiSearchResponseService = require('../services/ashi-search-response.service');
const ashiQueryService = require('../services/ashi-response-queries.service')
const { request } = require('http')
module.exports = {
    getFullData
};


async function getFullData(ashiRequest) {
    try {
        let product_data = await getItems(ashiRequest);
        let summary_data = await getSummary(ashiRequest);
        
        product_data["summary"] = summary_data;
        //let summary_data = await ashiResponseService.getSummaryResponseInAshiFormat(summaryData) ;
        return new ElasticResponse(constants.SUCCESS_CODE, [], product_data);
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {});
    }

}
async function getItems(ashiRequest) {
    try {
        if (ashiRequest.keywords == "") {
            let productsPayload = await prepareProductListPayload(ashiRequest)
            let elasticResponse = await elasticService.getItemData(constants.QUERY_TYPE_SEARCH, productsPayload)
            //-- conver the elastic response to ASHI format
            let ashiResponse = ashiProductListResponseService.getProductResponseInAshiFormat(ashiRequest, elasticResponse.dataArray);
            //ashiResponse.summary.attrib.push(responseWithExcludedAttributes.data) ;
            return ashiResponse;
        }
        else {
            let searchPayload = await prepareSearchPayload(ashiRequest)
            let elasticResponse = await searchService.getItemSearchData(constants.QUERY_TYPE_SEARCH, searchPayload)
            //-- conver the elastic response to ASHI format
            let ashiResponse = ashiSearchResponseService.getSearchResponseInAshiFormat(ashiRequest, elasticResponse.dataArray);
            return ashiResponse;

        }
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}

async function getSummary(requestBody) {
    try {

        //-- category id will always come if the request is coming for product list. So categoryId =0 means the request is coming from Search and NOT from Product List
        if (requestBody.keywords == "" && requestBody.CategoryId != 0) {
            let firstSummaryPayload = prepareItemSummaryPayload(requestBody, false)
            let secondSummaryPayload = prepareItemSummaryPayload(requestBody, true)
            
            let elasticResponse = await elasticService.getFilterDataForProductList(constants.QUERY_TYPE_SEARCH, firstSummaryPayload)
            let excludedAttributesResponse = await elasticService.getFilterDataForProductList(constants.QUERY_TYPE_SEARCH, secondSummaryPayload) ;

            // if (requestBody.currentfilteredspecs && requestBody.currentfilteredspecs.length > 0) {
            //     let payloadWithExcludedAttributes = await prepareExcludedAttributesSummaryPayload(requestBody);
            //     let responseWithExcludedAttributes = await elasticService.getExcludedAttributesSummaryData(constants.QUERY_TYPE_SEARCH, payloadWithExcludedAttributes);
            //     if (responseWithExcludedAttributes && responseWithExcludedAttributes.length > 0) {
            //         elasticResponse = getFinalResponse(elasticResponse, responseWithExcludedAttributes);
            //     }
            // }


            //-- conver the elastic response to ASHI format
            let ashiResponse = await ashiProductListResponseService.getProductSummaryResponseInAshiFormat(elasticResponse, requestBody);


            if (excludedAttributesResponse && excludedAttributesResponse.dataArray) {
                elasticResponse = getFinalResponse(ashiResponse, excludedAttributesResponse, requestBody);
            }

            return elasticResponse;
        }
        else {

            let firstSummaryPayload = prepareSearchSummaryPayload(requestBody, false)
            let secondSummaryPayload = prepareSearchSummaryPayload(requestBody, true)
            
            let elasticResponse = await searchService.getLeftSideFilterDataForSearch(constants.QUERY_TYPE_SEARCH, firstSummaryPayload)
            let excludedAttributesResponse = await searchService.getLeftSideFilterDataForSearch(constants.QUERY_TYPE_SEARCH, secondSummaryPayload) ;




            //let summaryPayload = prepareSearchSummaryPayload(requestBody)
            
            //-- conver the elastic response to ASHI format
            let ashiResponse = await ashiSearchResponseService.getSearchSummaryResponseInAshiFormat(elasticResponse, requestBody);


            if (excludedAttributesResponse && excludedAttributesResponse.dataArray) {
                elasticResponse = getFinalResponse(ashiResponse, excludedAttributesResponse, requestBody);
            }

            return elasticResponse;
        }

    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}


function getFinalResponse(ashiResponse, responseWithExcludedAttributes, requestBody){
    let replaceableKey = "" ; 


    if (requestBody.currentfilteredspecs && requestBody.currentfilteredspecs.length > 0 && requestBody.currentfilteredspecs[0].attribid != 140) {
        replaceableKey = requestBody.currentfilteredspecs[0].attribid ;
    }
    else{
        //there is no current filtered specs so we need to return the same response as it is
        return ashiResponse ;
    }

    let globalSetting = globalSettings.default.side_filters.filter_mapping_sort.find((item) => item.id === replaceableKey)
    let criteriaKey = globalSetting.display_name.replace(' ', '_');
 
    const attribIndex =   ashiResponse.attrib.findIndex(item => item.attribid === replaceableKey);
    //ashiResponse.attrib[attribIndex] = responseWithExcludedAttributes.dataArray.aggregations.attribute_aggs.filtered_docs[globalSetting.name] ;
    let formedData = ashiProductListResponseService.getAttribData(responseWithExcludedAttributes.dataArray.aggregations, globalSetting, requestBody)
    ashiResponse.attrib[attribIndex] = formedData ; 

    
    //ashiResponse.attribs[attribIndex].selected = true ;
    //elasticResponse.attribs[replaceableKey] = responseWithExcludedAttributes.attribs[replaceableKey] ;
    return ashiResponse ;
}


async function prepareProductListPayload(requestBody) {
    let payload = {
        "query_type": "_search",
        "query_code": "item_query",
        "data": {},
    }

    payload["RETAILER_ID"] = requestBody.storeid;
    payload["PARENT_CATEGORY_ID"] = requestBody.CategoryId;
    payload["CATEGORIES"] = await getCategoryIds(requestBody.categoryids);
    payload["page_number"] = requestBody.pageindex;
    payload["size"] = requestBody.pagesize ; //getPageSize(requestBody);
    payload["sort"] = getOrderBy(requestBody.orderby)

    let attribCriteria = getAttributeCriteria(requestBody);

    for (const key in attribCriteria) {
        if (attribCriteria.hasOwnProperty(key)) {
            payload[key] = attribCriteria[key];
        }
    }

    if (requestBody.pricemin && requestBody.pricemax && requestBody.pricemax > 0){
        payload["Price_Range_Type"] = "Custom" ;
        payload["Price_Range"] = [{
            "from": requestBody.pricemin,
            "to": requestBody.pricemax
        }]
    }
    //payload["attribCriteria"] = attribCriteria ;

    return payload;

}


function getPageSize(requestBody) {
    if (requestBody.pagesize == 0) {
        return 8;
    }
    let subpageSize = (requestBody.subpageindex + 1) * requestBody.subpagesize;

    if (subpageSize > requestBody.pagesize) {
        return requestBody.pagesize;
    }
    return subpageSize;
}

async function prepareSearchPayload(requestBody) {
    let payload = prepareProductListPayload(requestBody);

    payload["search_term"] = requestBody.keywords;
    return payload;

}

async function prepareSearchPayload(requestBody) {
    let payload = {
        "query_type": "_search",
        "query_code": "item_query",
        "data": {},
    }

    payload["RETAILER_ID"] = requestBody.storeid;
    //payload["PARENT_CATEGORY_ID"] = requestBody.CategoryId;
    payload["CATEGORIES"] = await getCategoryIds(requestBody.categoryids);
    payload["page_number"] = requestBody.pageindex;
    payload["search_term"] = requestBody.keywords;
    payload["size"] = requestBody.pagesize;
    payload["sort"] = getOrderBy(requestBody.orderby)

    // let attribCriteria = getAttributeCriteria(requestBody) ;
    // for (const key in attribCriteria) {
    //     if (attribCriteria.hasOwnProperty(key)) {
    //         payload[key] = attribCriteria[key] ; 
    //     }
    // }

    //payload["attribCriteria"] = attribCriteria ;
    return payload;
}

function getAttributeCriteria(requestBody) {

    //-- first load the data in memory of attributes
    let attribMaster = loadJson('attributes.json');
    let criteria = {};
    requestBody.filteredspecs.forEach(element => {
        //let elementSpec = data.filter((item) => item.SpecificationAttributeId === element.attribid);


        //deal with it differntly when its for price range
        if (element.attribid == 140) {
            let criteriaKey = "Price_Range" ;
            let criteriaValue = [] ;
            let globalSettingPriceRange = (requestBody.CategoryId == 69 ? globalSettings.default.side_filters.price_range.silver_category_id_69 : globalSettings.default.side_filters.price_range.all_pages_not_silver);
            element.option.forEach(spec => {

                let attribObject = globalSettingPriceRange.find((item) => {
                    let isIdMatch = (item.option_id === spec.id);
                    return isIdMatch;
                });
                criteriaValue.push(attribObject);
            });
            criteria[criteriaKey] = criteriaValue;

        }
        else{
        
        let globalSetting = globalSettings.default.side_filters.filter_mapping_sort.find((item) => item.id === element.attribid)
        let criteriaKey = globalSetting.display_name.replaceAll(' ', '_');
        let criteriaValue = []
        element.option.forEach(spec => {
            let attribObject = attribMaster.find((item) => {
                
                let isIdMatch = (item.id === spec.id);
                let isAttribIdMatch = (item.SpecificationAttributeId === element.attribid);
                return isIdMatch && isAttribIdMatch;
            });
            if (attribObject){
                criteriaValue.push(attribObject.value);
            }
        });
        if (criteriaValue.length > 0){
            criteria[criteriaKey] = criteriaValue;
        }
    }
    });
    return criteria;
}

// Function to read JSON from a file and return it as a JavaScript object
function loadJson(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8'); // Read the file as a string
        return JSON.parse(data); // Parse the string into a JSON object
    } catch (error) {
        console.error('Error reading or parsing the file:', error);
        throw error;
    }
}

function prepareItemSummaryPayload(requestBody, removeCurrentFilteredSpecs = true) {


    let newPayload = {...requestBody} ; 

    //remove the currentfilterspecs from filtered specs for preparing left side payload
    if (removeCurrentFilteredSpecs){
        newPayload.filteredspecs = newPayload.filteredspecs.filter(item => item.attribid !== newPayload.currentfilteredspecs[0].attribid);
    }

    let payload = ashiQueryService.getBlankFilterQuery();
    payload["PARENT_CATEGORY_ID"] = newPayload.CategoryId;
    payload.CATEGORIES = newPayload.categoryids;
    payload.RETAILER_ID = newPayload.storeid;
    //payload.Price_Range = requestBody.categoryids;
    let attribCriteria = getAttributeCriteria(newPayload);

    for (const key in attribCriteria) {
        if (attribCriteria.hasOwnProperty(key)) {
            payload[key] = attribCriteria[key];
        }
    }

    return payload;

}

async function prepareExcludedAttributesSummaryPayload(requestBody) {

    //-- first load the data in memory of attributes
    let attribMaster = loadJson('attributes.json');
    let criteria = {};
    let compositeQuery = {};
    let filterQuery = ashiQueryService.getSpecificationAggregateQueryForExcludedAttributes(requestBody);
    requestBody.filteredspecs.forEach(element => {
        //let elementSpec = data.filter((item) => item.SpecificationAttributeId === element.attribid);
        

        if (element.attribid == requestBody.currentfilteredspecs[0].attribid) {
            let globalSetting = globalSettings.default.side_filters.filter_mapping_sort.find((item) => item.id === element.attribid)
            let criteriaKey = globalSetting.display_name.replace(' ', '_');
            compositeQuery = ashiQueryService.getCompositeQuery(criteriaKey);
        }
        else{
            let globalSetting = globalSettings.default.side_filters.filter_mapping_sort.find((item) => item.id === element.attribid)
            let criteriaKey = globalSetting.display_name.replace(' ', '_');
            let criteriaValue = []
            element.option.forEach(spec => {
            let attribObject = attribMaster.find((item) => {
                    let isIdMatch = (item.id === spec.id);
                    let isAttribIdMatch = (item.SpecificationAttributeId === element.attribid);
                    return isIdMatch && isAttribIdMatch;
                });

            filterQuery.bool.filter.push(
                {
                    "nested": {
                        "path": "SpecificationAttribute_Mapping",
                        "query": {
                            "bool": {
                                "should": [
                                    {
                                        "terms": {
                                            ["SpecificationAttribute_Mapping." + criteriaKey]: [
                                                attribObject.value
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            )
            
        });
            
        }
    });

    //if the currentfilteredspecs contains price range then remove the price range from the filterQuery
    if (requestBody.currentfilteredspecs.some(item => item.attribid === 140)) {
        filterQuery.bool.filter = filterQuery.bool.filter.filter(item => item.nested.path !== "SpecificationAttribute_Mapping");
    }

    let query = { "aggs": compositeQuery, "query": filterQuery, "size": 0}
    
    return query
}


function prepareSearchSummaryPayload(requestBody, removeCurrentFilteredSpecs = true) {
    let newPayload = {...requestBody} ; 

    //remove the currentfilterspecs from filtered specs for preparing left side payload
    if (removeCurrentFilteredSpecs){
        newPayload.filteredspecs = newPayload.filteredspecs.filter(item => item.attribid !== newPayload.currentfilteredspecs[0].attribid);
    }
    let payload = ashiQueryService.getBlankFilterQuery();
    payload["PARENT_CATEGORY_ID"] = requestBody.CategoryId;
    //payload.CATEGORIES = requestBody.categoryids;
    payload.RETAILER_ID = requestBody.storeid;
    payload.search_term = requestBody.keywords;
    //payload.Price_Range = requestBody.categoryids;
    let attribCriteria = getAttributeCriteria(requestBody);

    for (const key in attribCriteria) {
        if (attribCriteria.hasOwnProperty(key)) {
            payload[key] = attribCriteria[key];
        }
    }

    return payload;

}

function getOrderBy(orderById) {

    let returnClause = {}
    switch (orderById) {
        case 12:
            returnClause = { "field": "best-sellers", "order": "asc" };
            break;
        case 10:
            returnClause = { "field": "price", "order": "asc" };
            break;
        case 11:
            returnClause = { "field": "price", "order": "desc" };
            break;
        case 36:
            returnClause = { "field": "new_item", "order": "asc" };
            break;
        case 30:
            returnClause = { "field": "diamond_weight", "order": "asc" };
            break;
        case 31:
            returnClause = { "field": "diamond_weight", "order": "desc" };
            break;
        default:
            returnClause = { "field": "best-sellers", "order": "asc" };
            break;

    }

    return returnClause;
}

async function getCategoryIds(inputJson) {
    // Extract category IDs and map them to an array of IDs
    const formattedCategories = inputJson.map(category => category.id);


    return formattedCategories;
}
