const blankQuery = require('./queries')
const axios = require('axios')
var { ElasticResponse } = require('../utils/response')
const referenceService = require('./reference.services')
const globalSettings = require('../../global-settings.json')

module.exports = {
    getBlankProductListResponse,
    getBlankFilterQuery,
    getBlankAttribs,
    getSpecificationAggregateQueryForExcludedAttributes,
    getCompositeQuery
}


function getBlankProductListResponse() {
    return {
        "totalcount": 0,
        "pageindex": 0,
        "pagesize": 0,
        "subpagesize": 0,
        "subpageindex": 0,
        "itemlist": null,
        "itemat": 0,
        "isshowcount": true,
        "products": [],
        "summary": {
            "header": [],
            "attrib": []
        }
    }
}


function getBlankAttribs() {
    return {
        "attribid": 0,
        "attribname": "",
        "order": 0,
        "options": []
    }
}


function getBlankFilterQuery() {
    return {
        "query_type": "_search",
        "query_code": "left_side_filter_query",
    }

}


function getSpecificationAggregateQueryForExcludedAttributes(requestBody) {
    let returnQuery = {
        
            "bool": {
                "filter": [
                    {
                        "nested": {
                            "path": "retailer_data",
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "term": {
                                                "retailer_data.retailer_id": requestBody.storeid
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        
    };




    let categoryQuery = {
        "nested": {
            "path": "category",
            "query": {
                "bool": {
                    "must": [
                    ]
                }
            }
        }
    }

    if (requestBody.CategoryId) {
        categoryQuery.nested.query.bool.must.push({
            "term": {
                "category.PARENT_CATEGORY_ID": requestBody.CategoryId
            }
        })
    }

    if (requestBody.categoryids && requestBody.categoryids.length > 0) {
        categoryQuery.nested.query.bool.must.push({
            "terms": {
                "category.CATEGORY_ID": requestBody.categoryids.map(item => item.id)
            }
        })
    }

    returnQuery.bool.filter.push(categoryQuery);
    return returnQuery;
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

    }




    return returnData;
}

function getCompositeQuery(attributeKey) {

    
    if (attributeKey) {
        // convert the excludedAttribute to smallcase and then add _count
        let attributeKeyCount = attributeKey.toLowerCase().replace(/\s+/g, '_') + "_count";
        let query = {
            
                "attribute_aggs": {
                    "filter": {
                        "bool": {
                            "must": [
                                {
                                    "nested": {
                                        "path": "retailer_data",
                                        "query": {
                                            "bool": {
                                                "must": [
                                                    {
                                                        "term": {
                                                            "retailer_data.retailer_id": "CARTJA"
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "aggs": {
                        "filtered_docs": {
                            "nested": {
                                "path": "SpecificationAttribute_Mapping"
                            },
                            "aggs": {
                                [attributeKeyCount]: {
                                    "composite": {
                                        "size": 100,
                                        "sources": [

                                            {
                                                "seq_num": {
                                                    "terms": {
                                                        "field": "SpecificationAttribute_Mapping.DisplayOrder"
                                                    }
                                                }
                                            },
                                            {
                                                [attributeKeyCount]: {
                                                    "terms": {
                                                        "field": "SpecificationAttribute_Mapping." + attributeKey
                                                    }
                                                }
                                            },
                    
                                            {
                                                "optionid": {
                                                    "terms": {
                                                        "field": "SpecificationAttribute_Mapping.optionid",
                                                        "missing_bucket": true
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
        }
        return query;
    }



    return null;
}   
