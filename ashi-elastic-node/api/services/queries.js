const blankQuery = require('./queries')
const axios = require('axios')
var { ElasticResponse } = require('../utils/response')
const referenceService = require('../services/reference.services')
const globalSettings = require('../../global-settings.json')

module.exports = {
    getLeftSideQuery,
    getItemQuery,
    getItemSearchPrimary,
    getItemSearchSecondary,
    getBestSellerQuery,
    getSearchQueryPopup,
    getTrendingProducts,
    getTrendingProductsSecondary,
    getSpecificationAttributeNestedQuery,
    getLeftSideFilterForPrimarySearch,
    getLeftSideFilterForSecondarySearch,
    getCategoryQueryPrimary,
    getCategoryQuerySecondary,
    getLeadingJewlery,
    getSPOItemMaster,
    getItemDetailsQuery,
    getLeftSideQueryForParentCategoryId,
    getBlankTrendingForLeftSide,
    getBlankCategoryForLeftSide,
    getBlankTrendingForLeftSide,
    getBlankCategoryForLeftSide,
    getRelatedItemsQuery
};


//-- The parent category id is used in the function based on the document provided by Ashi
function getLeftSideQuery(parentCategoryId, retailerID = '') {
    let returnQuery = {
        "query": {
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
                                                "retailer_data.retailer_id": retailerID
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    {
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
                ]
            }
        },
        "size": 0,
        "aggs": getLeftSideAggregatesForProductList(parentCategoryId, retailerID)
    };


    let leftSideStockQuery = getStockAvailabilityQuery();
    returnQuery.aggs["stock_count"] = leftSideStockQuery
    // leftSideStockQuery.forEach(element => {
    //     Object.entries(element).forEach(([key, value]) => {
    //         returnQuery.aggs[key] = value
    //     })

    // })
    return returnQuery;
}

function getItemQuery() {
    return {
        "query": {
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
                                                "retailer_data.retailer_id": "CARTJA"
                                            }
                                        },
                                        {
                                            "bool": {
                                                "should": [

                                                ]
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
                    },
                    {
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
                ]
            }
        },
        "size": 0,
        "from": 0,
        "track_total_hits": true,
        "_source": [
            "product_data.ITEM_NAME",
            "product_data.ITEM_ID",
            "product_data.IMAGE_URL_1",
            "product_data.IMAGE_URL_2",
            "product_data.IMAGE_URL_3",
            "product_data.IMAGE_URL_4",
            "product_data.ITEM_CD",
            "product_data.SHORT_WEB_DESC",
            "product_data.IS_NEW_ITEM",
            "product_data.IS_TOP_SELLER_ITEM",
            "product_data.IS_OVER_STOCK_ITEM",
            "product_data.Stock_Message"
        ]
    };
}

function getSearchQueryPopup() {
    return {
        "query": {
            "bool": {
                "must": [
                    {
                        "multi_match": {
                            "query": "1/10 Ctw",
                            "fields": [
                                "product_data.ITEM_NAME^3",
                                "product_data.SHORT_WEB_DESC^2",
                                "product_data.Search_Keywords"
                            ],
                            "type": "phrase"
                        }
                    },
                    {
                        "nested": {
                            "path": "retailer_data",
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "match": {
                                                "retailer_data.retailer_id": "CARTJA"
                                            }
                                        }
                                    ]
                                }
                            },
                            "inner_hits": {
                                "_source": [
                                    "retailer_data.Price",
                                    "retailer_data.Price_Retail"
                                ]
                            }
                        }
                    }
                ],
                "should": [

                    {
                        "nested": {
                            "path": "SpecificationAttribute_Mapping",
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "match": {
                                                "SpecificationAttribute_Mapping.Category_Type": "Diamond Rings"
                                            }
                                        },
                                        {
                                            "terms": {
                                                "SpecificationAttribute_Mapping.Product_Style": [
                                                    "Fancy"
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            "boost": 3
                        }
                    }
                ]
            }
        },
        "size": 10,
        "from": 0,
        "_source": [
            "product_data.ITEM_ID",
            "product_data.ITEM_NAME",
            "product_data.IMAGE_URL_1",
            "product_data.SHORT_WEB_DESC"
        ]
    }
}

function getBestSellerQuery() {
    return {

        "query": {
            "bool": {
                "filter": [
                    {
                        "term": {
                            "product_data.IS_TOP_SELLER_ITEM": 1
                        }
                    },
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
                            },
                            "inner_hits": {
                                "_source": [
                                    "retailer_data.Price",
                                    "retailer_data.Price_Retail"
                                ]
                            }
                        }
                    },

                ]
            },

        },
        "sort": [
            {
                "product_data.BestSeller_DisplayOrder": {
                    "order": "asc"
                }
            }
        ],
        "size": 10,
        "_source": [
            "product_data.ITEM_ID",
            "product_data.ITEM_NAME",
            "product_data.IMAGE_URL_1",
            "product_data.ITEM_CD",
            "product_data.SHORT_WEB_DESC",
            "product_data.BestSeller_DisplayOrder",
            "product_data.IS_TOP_SELLER_ITEM"

        ]
    };

}

function getItemSearchPrimary(searchQuery) {
    let lowerCaseQuery = searchQuery.toLowerCase();
    let upperCaseQuery = searchQuery.toUpperCase();
    return {
        "_source": [
            "product_data.ITEM_ID",
            "product_data.ITEM_CD",
            "product_data.ITEM_NAME",
            "product_data.SHORT_WEB_DESC",
            "product_data.Search_Keywords",
            "product_data.IMAGE_URL_1",
            "product_data.BestSeller_DisplayOrder",
            "product_data.Stock_Message",
            "product_data.IS_OVER_STOCK_ITEM"
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "nested": {}
                    },
                    {
                        "bool": {
                            "should": [
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_CD^6",
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.Search_Keywords^3"
                                        ],
                                        "type": "phrase",
                                        "boost": 5,
                                        "analyzer": "custom_analyzer"
                                    }
                                },
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_CD^6",
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.Search_Keywords^2"
                                        ],
                                        "type": "cross_fields",
                                        "operator": "and",
                                        "boost": 3,
                                        "analyzer": "custom_analyzer"
                                    }
                                },
                                {
                                    "prefix": {
                                        "product_data.ITEM_CD": {
                                            "value": searchQuery,
                                            "boost": 10,
                                            "case_insensitive": true
                                        }
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "SpecificationAttribute_Mapping",
                                        "query": {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": lowerCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "boost": 2
                                                        }
                                                    },
                                                    {
                                                        "multi_match": {
                                                            "query": upperCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "boost": 2
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "category",
                                        "query": {
                                            "multi_match": {
                                                "query": searchQuery,
                                                "fields": [
                                                    "category.CATEGORY_NAME^2"
                                                ],
                                                "analyzer": "custom_analyzer",
                                                "boost": 1
                                            }
                                        }
                                    }
                                }
                            ],
                            "minimum_should_match": 1
                        }
                    }
                ],
                "must_not": [
                    {
                        "wildcard": {
                            "product_data.ITEM_CD.keyword": "LJ*"
                        }
                    }
                ]
            }
        },
        "sort": [
            {
                "_script": {
                    "type": "number",
                    "script": {
                        "source": "doc['product_data.SHORT_WEB_DESC.keyword'].value.contains('POS') ? 0 : 1",
                        "lang": "painless"
                    },
                    "order": "desc"
                }
            },
            {
                "_script": {
                    "type": "number",
                    "script": {
                        "source": "doc['product_data.ITEM_CD.keyword'].value.startsWith('LJ') ? 1 : 0",
                        "lang": "painless"
                    },
                    "order": "asc"
                }
            },
            {
                "_score": {
                    "order": "desc"
                }
            }
        ],
        "size": 0,
        "from": 0,
        "track_total_hits": true
    };

}

function getItemSearchSecondary(searchQuery) {
    let lowerCaseQuery = searchQuery.toLowerCase();
    let upperCaseQuery = searchQuery.toUpperCase();
    return {
        "_source": [
            "product_data.ITEM_ID",
            "product_data.ITEM_CD",
            "product_data.SHORT_WEB_DESC",
            "product_data.Search_Keywords",
            "product_data.IMAGE_URL_1",
            "product_data.BestSeller_DisplayOrder",
            "script_fields.default_category_display_name"

        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "nested": {
                            "path": "retailer_data",
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "match": {
                                                "retailer_data.retailer_id": "CARTJA"
                                            }
                                        }
                                    ]
                                }
                            },
                            "inner_hits": {
                                "_source": [
                                    "retailer_data.Price",
                                    "retailer_data.Price_Retail"
                                ]
                            }
                        }
                    },
                    {
                        "bool": {
                            "should": [
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_CD^6",
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.Search_Keywords^1"
                                        ],
                                        "type": "best_fields",
                                        "operator": "and",
                                        "analyzer": "custom_analyzer",
                                        "fuzziness": "auto",
                                        "prefix_length": 1,
                                        "boost": 1
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "SpecificationAttribute_Mapping",
                                        "query": {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": lowerCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "fuzziness": "auto",
                                                            "prefix_length": 1,
                                                            "boost": 1
                                                        }
                                                    },
                                                    {
                                                        "multi_match": {
                                                            "query": upperCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "fuzziness": "auto",
                                                            "prefix_length": 1,
                                                            "boost": 1
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ],
                "must_not": [
                    {
                        "wildcard": {
                            "product_data.ITEM_CD.keyword": "LJ*"
                        }
                    }
                ]
            }
        },
        "sort": [
            {
                "_script": {
                    "type": "number",
                    "script": {
                        "source": "doc['product_data.SHORT_WEB_DESC.keyword'].value.contains('POS') ? 0 : 1",
                        "lang": "painless"
                    },
                    "order": "desc"
                }
            },
            {
                "_script": {
                    "type": "number",
                    "script": {
                        "source": "doc['product_data.ITEM_CD.keyword'].value.startsWith('LJ') ? 1 : 0",
                        "lang": "painless"
                    },
                    "order": "asc"
                }
            },
            {
                "_score": {
                    "order": "desc"
                }
            },
            {
                "product_data.BestSeller_DisplayOrder": {
                    "order": "asc"
                }
            }
        ],
        "size": 0,
        "from": 0,
        "track_total_hits": true
    };
}

function getTrendingProducts(searchQuery) {
    return {
        "query": {
            "bool": {
                "should": [
                    {
                        "match": {
                            "Search_Keyword": {
                                "query": searchQuery,
                                "operator": "and",
                                "analyzer": "custom_analyzer"
                            }
                        }
                    }
                ],
                "must_not": [
                    {
                        "script": {
                            "script": {
                                "source": "doc['Search_Keyword.keyword'].value.toLowerCase() == params.query.toLowerCase()",
                                "params": {
                                    "query": searchQuery
                                }
                            }
                        }
                    }
                ]
            }
        },
        "size": 5,
        "sort": [
            {
                "Search_Count": {
                    "order": "desc"
                }
            }
        ]
    };

}

function getTrendingProductsSecondary(searchQuery) {
    return {
        "query": {
            "bool": {
                "should": [
                    {
                        "query_string": {
                            "query": `*${searchQuery}*`,
                            "default_field": "Search_Keyword",
                            "analyzer": "custom_analyzer"
                        }
                    }
                ]
            }
        },
        "size": 5,
        "sort": [
            {
                "Search_Count": {
                    "order": "desc"
                }
            }
        ]
    };
}

function getSpecificationAttributeNestedQuery() {
    return {
        "nested": {
            "path": "SpecificationAttribute_Mapping",
            "query": {
                "bool": {
                    "must": [
                    ]
                }
            }
        }
    };
}

function getLeftFilterForSpecificationAttributeForProductList() {

    let filterMappings = globalSettings.default.side_filters.filter_mapping;
    let aggregateJson = {};
    filterMappings.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
            let mainKeyCount = key.replace(/\s+/g, '_').toLowerCase() + "_count";
            aggregateJson[mainKeyCount] = {
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
                            [mainKeyCount]: {
                                "terms": {  
                                    "field": value
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

        });
    });

    return aggregateJson;

}


function getLeftFilterForSpecificationAttributeForSearch() {

    let filterMappings = globalSettings.pages["search-product-list-page"].side_filters.filter_mapping ;
    let aggregateJson = {};
    filterMappings.forEach(item => {
        
        
            aggregateJson[item.name] = {
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
                            [item.name]: {
                                "terms": {
                                    "field": "SpecificationAttribute_Mapping."+ item.display_name.replace(" ", "_") 
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

    });

    return aggregateJson;

}


function getLeftSidePriceRangeQuery(parentCategoryId) {
    //-- for silver
    let priceRangeQuery = {};
    if (parentCategoryId == 69) {
        priceRangeQuery = globalSettings.default.side_filters.price_range.silver_category_id_69.map(item => item.price_range_value);
    }
    else {
        priceRangeQuery = globalSettings.default.side_filters.price_range.all_pages_not_silver.map(item => item.price_range_value);
    }

    return priceRangeQuery
}

function getStockAvailabilityQuery() {
    let stockAvailabilityDefault = globalSettings.default.side_filters.Stock_Availability;
    let stockCountJson = {

        "filters": {
            "filters": {
            }
        },
        "aggs": {
            "counts": {
                "value_count": {
                    "field": "product_data.ITEM_ID"
                }
            }
        }

    }
    //let queryArray = [];
    stockAvailabilityDefault.forEach(element => {
        Object.entries(element).forEach(([key, value]) => {
            stockCountJson.filters.filters[key] = { "term": { [value]: "True" } }
        })
    })


    return stockCountJson;

}

function getCategoryQueryPrimary(searchQuery) {
    let lowerCaseQuery = searchQuery.toLowerCase();
    let upperCaseQuery = searchQuery.toUpperCase();
    return {
        "_source": [
            "script_fields.default_category_display_name"
        ],
        "script_fields": {
            "default_category_info": {
                "script": {
                    "lang": "painless",
                    "source": "def defaultCategoryInfo = [:]; if (params['_source'].containsKey('category') && params['_source']['category'] != null) { for (item in params['_source']['category']) { if (item['isDefaultCategory'] == 'True') {defaultCategoryInfo['PARENT_CATEGORY_ID'] = item['PARENT_CATEGORY_ID']; defaultCategoryInfo['CATEGORY_DISPLAY_NAME'] = item['CATEGORY_DISPLAY_NAME']; defaultCategoryInfo['CATEGORY_ID'] = item['CATEGORY_ID']; break; } } } return defaultCategoryInfo;"
                }
            }
        },
        "query": {
            "bool": {
                "must": [
                    {
                        "bool": {
                            "should": [
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_CD^6",
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.Search_Keywords^3"
                                        ],
                                        "type": "phrase",
                                        "boost": 5,
                                        "analyzer": "custom_analyzer"
                                    }
                                },
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_CD^6",
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.Search_Keywords^2"
                                        ],
                                        "type": "cross_fields",
                                        "operator": "and",
                                        "boost": 3,
                                        "analyzer": "custom_analyzer"
                                    }
                                },
                                {
                                    "prefix": {
                                        "product_data.ITEM_CD": {
                                            "value": searchQuery,
                                            "boost": 10,
                                            "case_insensitive": true
                                        }
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "SpecificationAttribute_Mapping",
                                        "query": {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": lowerCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "boost": 2
                                                        }
                                                    },
                                                    {
                                                        "multi_match": {
                                                            "query": upperCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "boost": 2
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "category",
                                        "query": {
                                            "multi_match": {
                                                "query": searchQuery,
                                                "fields": [
                                                    "category.CATEGORY_NAME^2"
                                                ],
                                                "analyzer": "custom_analyzer",
                                                "boost": 1
                                            }
                                        }
                                    }
                                }
                            ],
                            "minimum_should_match": 1
                        }
                    }
                ],
                "must_not": [
                    {
                        "wildcard": {
                            "product_data.ITEM_CD.keyword": "LJ*"
                        }
                    }
                ]
            }
        },
        "sort": [
            {
                "_script": {
                    "type": "number",
                    "script": {
                        "source": "doc['product_data.SHORT_WEB_DESC.keyword'].value.contains('POS') ? 0 : 1",
                        "lang": "painless"
                    },
                    "order": "desc"
                }
            },
            {
                "_script": {
                    "type": "number",
                    "script": {
                        "source": "doc['product_data.ITEM_CD.keyword'].value.startsWith('LJ') ? 1 : 0",
                        "lang": "painless"
                    },
                    "order": "asc"
                }
            },
            {
                "_score": {
                    "order": "desc"
                }
            },
            {
                "product_data.BestSeller_DisplayOrder": {
                    "order": "asc"
                }
            }
        ],
        "size": 500,
        "track_total_hits": true
    };
}

function getCategoryQuerySecondary(searchQuery) {
    let lowerCaseQuery = searchQuery.toLowerCase();
    let upperCaseQuery = searchQuery.toUpperCase();
    return {
        "_source": [
            "script_fields.default_category_display_name"

        ],
        "script_fields": {
            "default_category_info": {
                "script": {
                    "lang": "painless",
                    "source": "def defaultCategoryInfo = [:]; if (params['_source'].containsKey('category') && params['_source']['category'] != null) { for (item in params['_source']['category']) { if (item['isDefaultCategory'] == 'True') { defaultCategoryInfo['CATEGORY_DISPLAY_NAME'] = item['CATEGORY_DISPLAY_NAME']; defaultCategoryInfo['CATEGORY_ID'] = item['CATEGORY_ID']; break; } } } return defaultCategoryInfo;"
                }
            }
        },
        "query": {
            "bool": {
                "must": [
                    {
                        "bool": {
                            "should": [
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_CD^6",
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.Search_Keywords^1"
                                        ],
                                        "type": "best_fields",
                                        "operator": "and",
                                        "analyzer": "custom_analyzer",
                                        "fuzziness": "auto",
                                        "prefix_length": 1,
                                        "boost": 1
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "SpecificationAttribute_Mapping",
                                        "query": {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": lowerCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "fuzziness": "auto",
                                                            "prefix_length": 1,
                                                            "boost": 1
                                                        }
                                                    },
                                                    {
                                                        "multi_match": {
                                                            "query": upperCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "fuzziness": "auto",
                                                            "prefix_length": 1,
                                                            "boost": 1
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ],
                "must_not": [
                    {
                        "wildcard": {
                            "product_data.ITEM_CD.keyword": "LJ*"
                        }
                    }
                ]
            }
        },
        "sort": [
            {
                "_script": {
                    "type": "number",
                    "script": {
                        "source": "doc['product_data.SHORT_WEB_DESC.keyword'].value.contains('POS') ? 0 : 1",
                        "lang": "painless"
                    },
                    "order": "desc"
                }
            },
            {
                "_script": {
                    "type": "number",
                    "script": {
                        "source": "doc['product_data.ITEM_CD.keyword'].value.startsWith('LJ') ? 1 : 0",
                        "lang": "painless"
                    },
                    "order": "asc"
                }
            },
            {
                "_score": {
                    "order": "desc"
                }
            },
            {
                "product_data.BestSeller_DisplayOrder": {
                    "order": "asc"
                }
            }
        ],
        "size": 500,
        "track_total_hits": true
    };
}


function getLeadingJewlery(searchQuery) {
    return {
        "_source": [
            "product_data.ITEM_ID",
            "product_data.ITEM_CD",
            "product_data.SHORT_WEB_DESC",
            "product_data.Search_Keywords",
            "product_data.IMAGE_URL_1"
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {
                            "product_data.ITEM_CD.keyword": {
                                "value": searchQuery
                            }
                        }
                    }
                ]
            }
        },
        "sort": [
            {
                "_script": {
                    "type": "number",
                    "script": {
                        "source": "doc['product_data.SHORT_WEB_DESC.keyword'].value.contains('POS') ? 0 : 1",
                        "lang": "painless"
                    },
                    "order": "desc"
                }
            },
            {
                "_score": {
                    "order": "desc"
                }
            },
            {
                "product_data.BestSeller_DisplayOrder": {
                    "order": "desc"
                }
            }
        ],
        "size": 0,
        "from": 0,
        "track_total_hits": true
    };
}

function getSPOItemMaster(searchQuery) {
    return {
        "_source": [
            "product_data.ITEM_ID",
            "product_data.ITEM_CD",
            "product_data.SHORT_WEB_DESC",
            "product_data.SEARCH_KEYWORDS",
            "product_data.IMAGE_URL_1"
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "bool": {
                            "should": [
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.SEARCH_KEYWORDS^1",
                                            "product_data.ASHI_JEWELSOFT_DESC"
                                        ],
                                        "type": "phrase",
                                        "boost": 5
                                    }
                                },
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.SEARCH_KEYWORDS^1",
                                            "product_data.ASHI_JEWELSOFT_DESC"
                                        ],
                                        "type": "cross_fields",
                                        "operator": "and",
                                        "boost": 3
                                    }
                                },
                                {
                                    "prefix": {
                                        "ITEM_CD": {
                                            "value": searchQuery,
                                            "boost": 10,
                                            "case_insensitive": true
                                        }
                                    }
                                }
                            ],
                            "minimum_should_match": 1
                        }
                    }
                ]
            }
        },
        "sort": [
            {
                "_score": {
                    "order": "desc"
                }
            }
        ],
        "size": 8,
        "from": 0,
        "track_total_hits": true
    };
}


function getItemDetailsQuery(itemId, retailerId) {
    return {
        "query": {
            "bool": {
                "must": [
                    {
                        "match": {
                            "product_data.ITEM_ID": itemId
                        }
                    }
                ],
                "filter": [
                    {
                        "nested": {
                            "path": "retailer_data",
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "term": {
                                                "retailer_data.retailer_id": retailerId
                                            }
                                        }
                                    ]
                                }
                            },
                            "inner_hits": {
                                "_source": [
                                    "retailer_data.Price",
                                    "retailer_data.Price_Retail"
                                ]
                            }
                        }
                    }
                ]
            }
        },
        "_source": [
            "product_data.IMAGE_URL_1",
            "product_data.IMAGE_URL_2",
            "product_data.IMAGE_URL_3",
            "product_data.IMAGE_URL_4"
        ]
    }
}


function getLeftSideFilterForPrimarySearch(searchQuery, retailerID) {
    let lowerCaseQuery = searchQuery.toLowerCase();
    let upperCaseQuery = searchQuery.toUpperCase();
    return {

        "query": {
            "bool": {
                "must": [
                    {
                        "nested": {
                        }
                    },
                    {
                        "bool": {
                            "should": [
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_CD^6",
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.Search_Keywords^3"
                                        ],
                                        "type": "phrase",
                                        "boost": 5,
                                        "analyzer": "custom_analyzer"
                                    }
                                },
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_CD^6",
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.Search_Keywords^2"
                                        ],
                                        "type": "cross_fields",
                                        "operator": "and",
                                        "boost": 3,
                                        "analyzer": "custom_analyzer"
                                    }
                                },
                                {
                                    "prefix": {
                                        "product_data.ITEM_CD": {
                                            "value": searchQuery,
                                            "boost": 10,
                                            "case_insensitive": true
                                        }
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "SpecificationAttribute_Mapping",
                                        "query": {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": lowerCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "boost": 2
                                                        }
                                                    },
                                                    {
                                                        "multi_match": {
                                                            "query": upperCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "boost": 2
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "category",
                                        "query": {
                                            "multi_match": {
                                                "query": searchQuery,
                                                "fields": [
                                                    "category.CATEGORY_NAME^2"
                                                ],
                                                "analyzer": "custom_analyzer",
                                                "boost": 1
                                            }
                                        }
                                    }
                                }
                            ],
                            "minimum_should_match": 1
                        }
                    }
                ],
                "must_not": [
                    {
                        "wildcard": {
                            "product_data.ITEM_CD.keyword": "LJ*"
                        }
                    }
                ]
            }
        },
        "aggs": getLeftSideAggregatesForSearch(retailerID),
        "size": 0,
        "from": 0,
        "track_total_hits": true
    };

}




function getLeftSideFilterForSecondarySearch(searchQuery, retailerID) {
    let lowerCaseQuery = searchQuery.toLowerCase();
    let upperCaseQuery = searchQuery.toUpperCase();
    return {

        "query": {
            "bool": {
                "must": [

                    { "nested": {} },
                    {
                        "bool": {
                            "should": [
                                {
                                    "multi_match": {
                                        "query": searchQuery,
                                        "fields": [
                                            "product_data.ITEM_CD^6",
                                            "product_data.ITEM_NAME^5",
                                            "product_data.SHORT_WEB_DESC^4",
                                            "product_data.Search_Keywords^1"
                                        ],
                                        "type": "best_fields",
                                        "operator": "and",
                                        "analyzer": "custom_analyzer",
                                        "fuzziness": "auto",
                                        "prefix_length": 1,
                                        "boost": 1
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "SpecificationAttribute_Mapping",
                                        "query": {
                                            "bool": {
                                                "should": [
                                                    {
                                                        "multi_match": {
                                                            "query": lowerCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "fuzziness": "auto",
                                                            "prefix_length": 1,
                                                            "boost": 1
                                                        }
                                                    },
                                                    {
                                                        "multi_match": {
                                                            "query": upperCaseQuery,
                                                            "fields": [
                                                                "SpecificationAttribute_Mapping.Category_Type^3",
                                                                "SpecificationAttribute_Mapping.Product_Style^3",
                                                                "SpecificationAttribute_Mapping.Metal_Color^3",
                                                                "SpecificationAttribute_Mapping.Metal_Karat^3",
                                                                "SpecificationAttribute_Mapping.Chain_Type^3",
                                                                "SpecificationAttribute_Mapping.Collection^3",
                                                                "SpecificationAttribute_Mapping.Stone_Type^3",
                                                                "SpecificationAttribute_Mapping.Stone_Shape^3"
                                                            ],
                                                            "type": "best_fields",
                                                            "analyzer": "keyword",
                                                            "fuzziness": "auto",
                                                            "prefix_length": 1,
                                                            "boost": 1
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ],
                "must_not": [
                    {
                        "wildcard": {
                            "product_data.ITEM_CD.keyword": "LJ*"
                        }
                    }
                ]
            }
        },
        "aggs": getLeftSideAggregatesForSearch(retailerID),
        "size": 0,
        "from": 0,
        "track_total_hits": true
    };

}


function getLeftSideAggregatesForProductList(parentCategoryId, retailerID = '') {
    return {
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
                                                    "retailer_data.retailer_id": retailerID
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        {
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
                    ]
                }
            },

            "aggs": {
                "filtered_docs": {
                    "nested": {
                        "path": "SpecificationAttribute_Mapping"
                    },
                    "aggs": getLeftFilterForSpecificationAttributeForProductList()
                }
            }
        },
        "categories": {
            "nested": {
                "path": "category"
            },
            "aggs": {
                "filtered_categories": {
                    "filter": {
                        "bool": {
                            "must": [
                                {
                                    "term": { "category.PARENT_CATEGORY_ID": parentCategoryId }
                                }
                            ]
                        }
                    },
                    "aggs": {
                        "category_count": {
                            "terms": {
                                "field": "category.CATEGORY_NAME",
                                "size": 50,
                                "order": {
                                    "seq_num": "asc"  // Order by seq_num in ascending order
                                }
                            },
                            "aggs": {
                                "category_id": {
                                    "terms": {
                                        "field": "category.CATEGORY_ID",
                                        "size": 50 
                                    }
                                },
                                "seq_num": {
                                    "min": {
                                        "field": "category.SEQ_NUM" // Aggregate seq_num value
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "retailer_price": {
            "nested": {
                "path": "retailer_data"
            },
            "aggs": {
                "filtered_docs": {
                    "filter": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "retailer_data.retailer_id": "CARTJA"
                                    }
                                }
                            ]
                        }
                    },
                    "aggs": {
                        "price_range_count": {
                            "range": {
                                "field": "retailer_data.Price",
                                "ranges": getLeftSidePriceRangeQuery(parentCategoryId)

                            }
                        }
                    }
                }
            }
        }
    }
}

function getLeftSideAggregatesForSearch(retailerID = '') {
    return {
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
                                                    "retailer_data.retailer_id": retailerID
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
                    "aggs": getLeftFilterForSpecificationAttributeForSearch()
                }
            }
        },
        "retailer_price": {
            "nested": {
                "path": "retailer_data"
            },
            "aggs": {
                "filtered_docs": {
                    "filter": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "retailer_data.retailer_id": "CARTJA"
                                    }
                                }
                            ]
                        }
                    },
                    "aggs": {
                        "price_range_count": {
                            "range": {
                                "field": "retailer_data.Price",
                                "ranges": getLeftSidePriceRangeQuery(0)

                            }
                        }
                    }
                }
            }
        }
    }
}


function getLeftSideQueryForParentCategoryId(parentCategoryId, retailerId) {
    return {
        "query": {
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
                                                "retailer_data.retailer_id": retailerId
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
        "size": 0,
        "aggs": {
            "category_count": {
                "nested": {
                    "path": "category"
                },
                "aggs": {
                    "filtered_docs": {
                        "filter": {
                            "bool": {
                                "must": [
                                    {
                                        "term": {
                                            "category.PARENT_CATEGORY_ID": parentCategoryId
                                        }
                                    }
                                ]
                            }
                        },
                        "aggs": {
                            "category_type_count": {
                                "composite": {
                                    "size": 100,
                                    "sources": [
                                        {
                                            "seq_num": {
                                                "terms": {
                                                    "field": "category.SEQ_NUM"
                                                }
                                            }
                                        },
                                        {
                                            "category_name": {
                                                "terms": {
                                                    "field": "category.CATEGORY_NAME"
                                                }
                                            }
                                        },
                                        {
                                            "category_id": {
                                                "terms": {
                                                    "field": "category.CATEGORY_ID"
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
    }
}

function getBlankTrendingForLeftSide() {
    let blankQuery = {
        "query": {
            "match_none": {}
        }
    }
    return blankQuery;
}

function getBlankCategoryForLeftSide() {
    return {
        "size": 0,
        "aggs": {
            "distinct_categories": {
                "nested": {
                    "path": "category"
                },
                "aggs": {
                    "by_category_id": {
                        "terms": {
                            "field": "category.CATEGORY_ID",
                            "include": globalSettings.search_grid.trending_categories
                        },
                        "aggs": {
                            "top_category_hits": {
                                "top_hits": {
                                    "_source": [
                                        "category.CATEGORY_DISPLAY_NAME",
                                        "category.CATEGORY_ID",
                                        "category.PARENT_CATEGORY_ID"
                                    ],
                                    "size": 1
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function getRelatedItemsQuery() {
    let query = {
        "query": {
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
                                                "retailer_data.retailer_id": ""
                                            }
                                        }
                                    ]
                                }
                            },
                            
                            "inner_hits": {
                                "_source": [
                                    "retailer_data.Price",
                                    "retailer_data.Price_Retail"
                                ]
                            }
                        }
                    },
                    {
                        "terms": {
                            "product_data.ITEM_ID": [] 
                        }
                    }
                ]
            }
          
         
        },
        "_source": [
            "product_data.ITEM_ID", 
            "product_data.ITEM_CD",
            "product_data.SHORT_WEB_DESC",
            "product_data.ITEM_NAME",
            "product_data.IMAGE_URL_1",
            "product_data.IS_NEW_ITEM",
            "product_data.IS_BEST_SELLER_ITEM"

        ]
      }
      return query;
}
