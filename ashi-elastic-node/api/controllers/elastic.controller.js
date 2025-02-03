const express = require('express');
const router = express.Router();
const elastic_service = require('../services/elastic.service')
const axios = require('axios')
require('dotenv').config() ; 


// routes
router.post('/elastic-service/items', callItems);
router.post('/elastic-service/filters', callFilterService);
router.post('/elastic-service/search', callSearchService);
router.post('/elastic-service/related-items', callRelatedItems);

module.exports = router;
async function callItems(req, res, next) {
    let data = await elastic_service.getItemData(req.body.query_type, req.body.data);
    res.json(data); 
}


async function callFilterService(req, res, next) {
    let data = await elastic_service.getFilterDataForProductList(req.body.query_type, req.body.data);
    // console.log("--------------------------")
    // console.log(JSON.stringify(data));
    // console.log("--------------------------")
    res.json(data); 
}

async function callSearchService(req, res, next) {
    let data = await elastic_service.getSearchData(req.body.query_type, req.body.data);
    res.json(data); 
}

async function callRelatedItems(req, res, next) {
    let data = await elastic_service.getRelatedItems(req.body.data);
    res.json(data); 
}


