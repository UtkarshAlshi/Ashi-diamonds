const query = require('./query.json')
const blankQuery = require('./queries') 
const axios = require('axios')
var { ElasticResponse } = require('../utils/response')
const elasticService = require('../services/elastic.service')

const constants = require('../utils/constants')

module.exports = {
    postData
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


async function postData(indexName, query_type, preparedStatement){
    try {
        let url = `${process.env.ELASTIC_URL}/${indexName}/${query_type}` ;
        response = await axios.post(url, preparedStatement) ;
        return new ElasticResponse(constants.SUCCESS_CODE, "", response.data, {}) ;
    } catch (error) {
        console.log(error) ;
        return new ElasticResponse(constants.FAILURE_CODE, "Error in retrieving data " + error, [], {})
    }
}