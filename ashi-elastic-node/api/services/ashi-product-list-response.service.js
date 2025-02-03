const blankQuery = require('./queries')
const axios = require('axios')
var { ElasticResponse } = require('../utils/response')
const referenceService = require('./reference.services')
const globalSettings = require('../../global-settings.json')
const ashiResponseQueries = require('./ashi-response-queries.service')

module.exports = {
    getProductResponseInAshiFormat,
    getProductSummaryResponseInAshiFormat,
    getAttribData
}

function getProductResponseInAshiFormat(ashiRequest, elasticData) {
    let productListResponse = ashiResponseQueries.getBlankProductListResponse();
    productListResponse = prepareProductListResponse(productListResponse, ashiRequest, elasticData);
    return productListResponse;
}

function prepareProductListResponse(blankProductList, ashiRequest, elasticData) {
    blankProductList["totalcount"] = elasticData.hits.total.value;
    blankProductList["pageindex"] = 0
    blankProductList["pagesize"] = 0
    blankProductList["subpagesize"] = 0
    blankProductList["subpageindex"] = 0
    blankProductList["itemlist"] = null
    blankProductList["itemat"] = 0
    blankProductList["isshowcount"] = true;
    blankProductList["products"] = getProducts(elasticData);
    blankProductList["request"] = { "pageindex": ashiRequest.pageindex, "pagesize": ashiRequest.pagesize };


    blankProductList["summary"] = {
        "header": [],
        "attrib": []
    }
    return blankProductList;
}

async function getProductSummaryResponseInAshiFormat(inputData, ashiRequest) {
    let summary = {

    }
    summary["header"] = getHeaderForItems(inputData, ashiRequest);
    summary["attrib"] = await getAttribValues(inputData, ashiRequest);
    return summary
}



async function getAttribValues(inputData, ashiRequest) {
    let returnData = [];
    globalSettings.default.side_filters.filter_mapping_sort.forEach(globalsettingElement => {
        let attribData = getAttribData(inputData.dataArray.aggregations, globalsettingElement, ashiRequest);
        if (attribData.options.length > 0) {
            //returnData.push(attribData);
            if (globalsettingElement.name == "category_count" || globalsettingElement.name == "product_type_count") {
                //--do nothing for product list. Will see for search

            }
            else {
                returnData.push(attribData);
            }

        }

    })


    return returnData;
}

function getAttribData(inputData, globalsettingElement, ashiRequest) {
    let returnData = {
        "attribid": globalsettingElement.id,
        "attribname": globalsettingElement.display_name,
        "order": 5,
        "options": fillAttribOptions(inputData, globalsettingElement.name, ashiRequest, globalsettingElement)
    }

    return returnData;
}

function fillAttribOptions(data, attribName, ashiRequest, globalsettingElement) {
    // Check if the keyName exists in the input data

    if (
        (data.attribute_aggs &&
            data.attribute_aggs.filtered_docs &&
            data.attribute_aggs.filtered_docs[attribName] &&
            data.attribute_aggs.filtered_docs[attribName].buckets) ||(data.category_info && data.category_info.filtered_docs
        )
    ) {
        // Extract the buckets array for the given keyName
        let buckets = [];

        buckets = data.attribute_aggs.filtered_docs[attribName].buckets;
        let selectedOptions = ashiRequest.filteredspecs ? ashiRequest.filteredspecs : [];

        // push all itemsids in a number array
        let selectedOptionsIds = [];
        selectedOptions.forEach((item) => {
            let options =   item.option.map((option) => option.id) ;
            selectedOptionsIds = selectedOptionsIds.concat(options);
        });

        if (attribName === "category_count" && data.category_count) {
            buckets = data.category_count.buckets;
            return buckets.map(bucket => ({
                optionvalue: bucket.key["category_count"],
                count: bucket.doc_count,
                order: bucket.key.seq_num,
                isSelected: 0
            }));
        }
        else {
            if (data.attribute_aggs.filtered_docs[attribName]) {

                if (attribName == "price_range_count") {

                    let buckets = data.retailer_price.filtered_docs.price_range_count.buckets
                    // return buckets.map(bucket => ({
                    //     optionvalue: findPriceRange(bucket.key, ashiRequest.CategoryId),
                    //     count: bucket.doc_count,
                    //     order: bucket.key.seq_num
                    // }));

                    return buckets.map(bucket => {
                        const priceObj = findPriceRange(bucket.key, ashiRequest.CategoryId); // Get the JSON object
                        return {
                            optionvalue: priceObj.price, // Use the "price" key from the object
                            count: bucket.doc_count,
                            order: bucket.key.seq_num,
                            optionid: priceObj.optionid,
                            isSelected: selectedOptionsIds.includes(findPricingOptionId(ashiRequest.CategoryId, bucket.from, bucket.to)) ? 1 : 0
                        };
                    });
                    
                }
                
              


                let returnData = buckets.map(bucket => {
                    let returnObject = {
                        optionvalue: bucket.key[attribName],
                        count: bucket.doc_count,
                        order: bucket.key.seq_num,
                        optionid: bucket.key.optionid,
                        isSelected: selectedOptionsIds.includes(bucket.key.optionid) ? 1 : 0
                    }
                    return returnObject;
                });
                return returnData;
            }
        }
    }

    if (attribName == "price_range_count") {

        let buckets = data.retailer_price.filtered_docs.price_range_count.buckets
        return buckets.map(bucket => ({
            optionvalue: findPriceRange(bucket.key),
            count: bucket.doc_count,
            order: bucket.key.seq_num
        }));

    }


    if (data.attribute_aggs.filtered_docs[attribName]) {
        buckets = data.attribute_aggs.filtered_docs[attribName].buckets;

        return buckets.map(bucket => ({
            optionvalue: bucket.key[attribName],
            count: bucket.doc_count,
            order: bucket.key.seq_num
        }));
    }

    // Return an empty array if the keyName is not found or no buckets exist
    return [];
}

function findPriceRange(displayValue, categoryId) {
    let priceRanges;

    if (categoryId == 69) {
        priceRanges = globalSettings.default.side_filters.price_range.silver_category_id_69;
    }
    else {
        priceRanges = globalSettings.default.side_filters.price_range.all_pages_not_silver;
        
    }
    // Normalize the input range
    const [inputFrom, inputTo] = displayValue.split("-").map(Number);

    // Iterate through the array to find the matching range
    for (const range of priceRanges) {
        const rangeFrom = range.price_range_value.from;
        const rangeTo = range.price_range_value.to;

        // Compare the numeric values of the ranges
        if (inputFrom === rangeFrom && inputTo === rangeTo) {
            return {price: range.price_range_display, optionid: range.option_id};
        }

        if (inputFrom === rangeFrom && Number.isNaN(inputTo)) {
            return {price: range.price_range_display, optionid: range.option_id};
        }
    }

    // Return null or an appropriate message if no match is found
    return null;
}

// function findPriceRange(displayValue) {


//     // Iterate through the array to find the matching display value
//     for (const range of priceRanges) {
//       const rangeString = `${range.price_range_value.from}-${range.price_range_value.to}`;
//       if (rangeString === displayValue) {
//         return  range.price_range_display ;
//       }
//     }
//     // Return null or an appropriate message if no match is found
//     return null;
//   }

function getHeaderForItems(inputData, ashiRequest) {
    let returnData = [{

        "title": "Product Type",
        "order": 0,
        "categorycounts": getCategoryCounts(inputData, ashiRequest)

    },
    {
        "title": "Parent Category Detail",
        "order": 0,
        "categorycounts": fillCategoryCounts(inputData, ashiRequest)
    }
    ]
    return returnData;
}


function fillCategoryCounts(inputData, ashiRequest) {
    let categoryCountObject = {
        "categoryid": ashiRequest.CategoryId,
        "categoryname": "",
        "oldcategoryid": "0",
        "parentcategoryid": 0,
        "isSelected": 0,
        "count": 0,
        "order": 10,
        "subcategory": []
    };

    let categoryCounts = getCategoryCounts(inputData, ashiRequest);
    categoryCountObject.subcategory = categoryCounts;
    return categoryCountObject;
}

function getCategoryCounts(inputData, ashiRequest) {
    data = inputData.dataArray.aggregations.categories.filtered_categories;
    buckets = data.category_count.buckets;
    let returnData = buckets.map(bucket => ({
        categoryname: bucket.key,
        count: bucket.doc_count,
        order: bucket.seq_num.value,
        categoryid: bucket.category_id.buckets[0].key,
        oldcategoryid: 0,
        parentcategoryid: 0,
        isSelected: checkCategoryExistence(bucket, ashiRequest.categoryids),
        subcategory: []

    }));

    return returnData;
}

function checkCategoryExistence(bucket, categoryids) {
    // Iterate over categoryids and check if any id exists in bucket.category_id.buckets
    const exists = categoryids.some(cat => {
        return bucket.category_id.buckets.some(b => {
            return b.key === cat.id.toString()  
        })  
    });
    return exists ? 1 : 0; // Return 1 if found, otherwise 0
}

function getProducts(elasticData) {
    let products = [];
    elasticData.hits.hits.forEach(element => {
        let productElement = {};
        productElement["productid"] = element._source.product_data.ITEM_ID,
            productElement["shortdesc"] = element._source.product_data.SHORT_WEB_DESC,
            productElement["itemcd"] = element._source.product_data.ITEM_CD,
            productElement["isnewitem"] = element._source.product_data.IS_NEW_ITEM;
        productElement["istopselleritem"] = element._source.product_data.IS_TOP_SELLER_ITEM;
        productElement["isoverstockitem"] = element._source.product_data.IS_OVER_STOCK_ITEM;

        productElement["price"] = element.inner_hits.retailer_data.hits.hits[0]._source.Price;
        productElement["sprice"] = (element.inner_hits.retailer_data.hits.hits[0]._source.Price_Retail >= element.inner_hits.retailer_data.hits.hits[0]._source.Price ? 0 : element.inner_hits.retailer_data.hits.hits[0]._source.Price_Retail);
        productElement["attribgroups"] = [];

        productElement["pictures"] = getPicturesData(element._source.product_data)
        products.push(productElement);
    });

    return products;


}


function getPicturesData(productData) {
    const pictures = [];

    // Iterate over all keys in the productData object
    for (const key in productData) {
        if (productData.hasOwnProperty(key) && key.startsWith("IMAGE_URL_")) {
            const url = productData[key];

            //--in below code the data except pictureurl is hardcoded because page was not working
            if (url) { // Check if the URL is valid (not null or undefined)
                pictures.push({
                    pictureurl: url.replace("https://i.jewelexchange.net", ""),
                    picid: 1111,
                    picorder: 1,
                    viewname: "SGTVEW_VIEW_URL",
                    displaytype: "image/jepg",
                    pictypeid: "D",
                    imagetype: "ICNRES"
                });
            }
        }
    }

    return pictures;
}


function findPricingOptionId(categoryId, fromValue, toValue) {

    let returnValue = null ;
    if (categoryId == 69){
        returnValue =    globalSettings.default.side_filters.price_range.silver_category_id_69.find(item => {
            const fromMatch = item.price_range_value.from === fromValue;
            const toMatch = typeof item.price_range_value.to !== "undefined" ? item.price_range_value.to === toValue : true;
            return fromMatch && toMatch;
        });
    }
    else{
        returnValue = globalSettings.default.side_filters.price_range.all_pages_not_silver.find(item => {
            const fromMatch = item.price_range_value.from === fromValue;
            const toMatch = typeof item.price_range_value.to !== "undefined" ? item.price_range_value.to === toValue : true;
            return fromMatch && toMatch;
        });
    }

    return returnValue ? returnValue.option_id : null;  
  
    
  }