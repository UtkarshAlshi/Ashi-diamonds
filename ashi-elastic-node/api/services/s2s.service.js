const query = require('./query.json')
const axios = require('axios')
const axiosService = require('./axios.service')
const utilService = require('../utils/util.service')
const elasticService = require('./elastic.service')
const queries = require('./queries')

var { ElasticResponse } = require('../utils/response')

const constants = require('../utils/constants')
module.exports = {
    getProductDetailsById,
    getOrderCartItemList,
    addItemToCart,
    getWishListItems,
    addItemToWishList,
    removeItemFromWishList,
    getSalesQuotation,
    addItemToSalesQuotation,
    getItemStyleHistory,
    getInventoryMessage,
    createSalesQuotation
};



// Create an Axios instance
const axiosInstance = axios.create();

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add headers to the request
    config.headers['Content-Type'] = 'application/json';
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTE0NjYxOTYsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NzI5OSIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NzI5OSJ9.RrhDPYkWTFPMnY8yP-FPWJExRF6D7Z0R_f98o2mWHNc';
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);


async function getProductDetailsById(itemId, retailerId){
    try {
        response = await axios.get(`${process.env.S2S_URL}/Product/getProductDetails?ItemId=${itemId}`)
        let validatedResponse = utilService.validateResponse(response) ;
        let itemDetailsQuery = queries.getItemDetailsQuery(itemId, retailerId) ;
        let elasticResponse = await axiosService.postData(process.env.INDEX_NAME, constants.QUERY_TYPE_SEARCH, itemDetailsQuery)

        console.log(JSON.stringify(elasticResponse)) ;

        if (elasticResponse.dataArray.hits.hits && elasticResponse.dataArray.hits.hits.length > 0){
            validatedResponse.dataArray[0]["IMAGE_URL_1"] = elasticResponse.dataArray.hits.hits[0]._source.product_data.IMAGE_URL_1 ;
            validatedResponse.dataArray[0]["IMAGE_URL_2"] = elasticResponse.dataArray.hits.hits[0]._source.product_data.IMAGE_URL_2 ;
            validatedResponse.dataArray[0]["IMAGE_URL_3"] = elasticResponse.dataArray.hits.hits[0]._source.product_data.IMAGE_URL_3 ;
            validatedResponse.dataArray[0]["IMAGE_URL_4"] = elasticResponse.dataArray.hits.hits[0]._source.product_data.IMAGE_URL_4 ;
            validatedResponse.dataArray[0]["price"] = elasticResponse.dataArray.hits.hits[0].inner_hits.retailer_data.hits.hits[0]._source.Price ;
        }

        validatedResponse.dataJson = await elasticService.getRelatedItems(validatedResponse.dataArray[0].similarStyles, retailerId) ;
        return validatedResponse ; 

    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}

async function getOrderCartItemList(username, jewelsoftid){
    try {
        response = await axios.get(`${process.env.S2S_URL}/OrderCart/getOCItemList?username=${username}&jewelsoftid=${jewelsoftid}`)
        return utilService.validateResponse(response) ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}


async function addItemToCart(itemDetails){
    try {
        response = await axios.post(`${process.env.S2S_URL}/OrderCart/addOCItems`, itemDetails)
        return utilService.validateResponse(response) ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }

}



async function getWishListItems(username, jewelsoftid){
    try {
        response = await axios.get(`${process.env.S2S_URL}/WishList/getWishlist?username=${username}&jewelsoftid=${jewelsoftid}`)
        return utilService.validateResponse(response) ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}


async function addItemToWishList(itemDetails){
    try {
        response = await axios.post(`${process.env.S2S_URL}/WishList/addWishlistItems`, itemDetails)
        return utilService.validateResponse(response) ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }

}


async function removeItemFromWishList(itemDetails){
    try {
        response = await axios.post(`${process.env.S2S_URL}/WishList/removewishlistitem`, itemDetails)
        return utilService.validateResponse(response) ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }

}


async function getSalesQuotation(userDetails){
    try {
        let url = `${process.env.S2S_URL}/SalesQuotation/getSQList?username=${userDetails.UserName}&jewelsoftid=${userDetails.jewelsoftId}`
        console.log(url);
        response = await axios.get(`${process.env.S2S_URL}/SalesQuotation/getSQList?username=${userDetails.UserName}&jewelsoftid=${userDetails.jewelsoftId}`)
        return utilService.validateResponse(response) ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }

}


async function addItemToSalesQuotation(itemDetails){
    try {
        let url = `${process.env.S2S_URL}/SalesQuotation/addSQItems`

        console.log (url) ;
        console.log(JSON.stringify(itemDetails)) ;
        response = await axios.post(url, itemDetails)
        return utilService.validateResponse(response) ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }

}

async function getItemStyleHistory(jewelSoftId, itemCd){
    
    try {
        let styleHistoryURL = `${process.env.S2S_URL}/Product/getStyleHistoryDetails?Itemcd=${itemCd}&jewelsoftIds=${jewelSoftId}` ; 
        console.log(styleHistoryURL)
        response = await axios.get(styleHistoryURL) 
        return utilService.validateResponse(response) ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }

}

async function getInventoryMessage(itemCd, qty){

    try {
        let styleHistoryURL = `${process.env.S2S_URL}/Product/getInventoryMessage?Itemcd=${itemCd}&Quantity=${qty}` ; 
        response = await axiosInstance.get(styleHistoryURL)
        return utilService.validateResponse(response , "inventoryMessage") ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }

}



async function createSalesQuotation(quotationDetails){

    try {
        let createQuotationURL= `${process.env.S2S_URL}/SalesQuotation/addSalesQuotation` ;
        let params = {
            "userName": quotationDetails.username,
            "jewelsoftIds": quotationDetails.jewelsoftid,
            "quotationName": quotationDetails.sqname
           }
        response = await axios.post(createQuotationURL, params) ;
        return utilService.validateResponse(response) ;
    } catch (error) {
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }

}


