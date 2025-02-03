const express = require('express');
const router = express.Router();
const search_service = require('../services/search.service')
const axios = require('axios')
require('dotenv').config() ; 


// routes
router.post('/trending', callTrending);
router.post('/best-seller', callBestSeller);
router.post('/popup-search', callSearchPopupData);
router.post('/update-trending', updateTrending);
router.post('/item-search', searchItems);
router.post('/left-categories', callCategories);
router.post('/left-filter', leftFilterForSearch);
router.post('/spo-item-master', getSPOItemMaster);
router.post('/leading-jewelry', getLeadingJewelry);


module.exports = router;

//-- call this to get left side trending data on search popup
async function callTrending(req, res, next) {
    let data = await search_service.getTrendingData(req.body.query_type, req.body.data) ;
    res.json(data); 
}

//-- Best Seller Data
//-- Popup Data when nothing is entered
async function callBestSeller(req, res, next) {
    let data = await search_service.getBestSellerData(req.body.query_type, req.body.data);
    res.json(data); 
}

//-- When user enters a search term in the popup and the below products are filtered
async function callSearchPopupData(req, res, next){
    let data = await search_service.getSearchPopupData(req.body.query_type, req.body.data);
    res.json(data) ;
}

async function updateTrending(req, res, next){
    let data = await search_service.getSearchPopupData(req.body.query_type, req.body.data);
    res.json(data) ;
}

async function searchItems(req, res, next){
    let data = await search_service.getItemSearchData(req.body.query_type, req.body.data);
    res.json(data) ;
}


async function leftFilterForSearch(req, res, next){
    let data = await search_service.getLeftSideFilterDataForSearch(req.body.query_type, req.body.data);
    res.json(data) ;
}

async function callCategories(req, res, next){
    let data = await search_service.getCategoryData(req.body.query_type, req.body.data);
    res.json(data) ;
}


async function getSPOItemMaster(req, res, next){
    let data = await search_service.getCategoryData(req.body.query_type, req.body.data);
    res.json(data) ;
}

async function getLeadingJewelry(req, res, next){
    let data = await search_service.getCategoryData(req.body.query_type, req.body.data);
    res.json(data) ;
}