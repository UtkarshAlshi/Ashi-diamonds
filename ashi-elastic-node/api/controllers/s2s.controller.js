const express = require('express');
const router = express.Router();
const s2s_service = require('../services/s2s.service')
require('dotenv').config() ; 


// routes
router.get('/product/:id/:retailerid', getProductDetailsById);
router.post('/product/stylehistory', getItemStyleHistory) ;
router.get('/product/inventorymessage/:itemCode/:qty', getInventoryMessage);
//-- Cart
router.get('/ordercart/items/:username/:retailerid', getOrderCartItemList);
router.post('/ordercart/additem', addItemToCart);
router.post('/ordercart/additems', addMultipleItemsToCart);

// -- Wishlist
router.get('/wishlist/items/:username/:retailerid', getWishListItems);
router.post('/wishlist/additem', addItemToWishList);
router.post('/wishlist/additems', addMultipleItemsToWishList);
router.post('/wishlist/removeitems', removeItemFromWishList);

router.post('/sales/quotation', getSalesQuotation) ;
router.post('/sales/create-quotation', createSalesQuotation) ;
router.post('/sales/quotation/additem', addItemToSalesQuotation) ;


module.exports = router;

async function getProductDetailsById(req, res, next) {
    let id = req.params.id ; 
    let retailerid = req.params.retailerid
    let data = await s2s_service.getProductDetailsById(id, retailerid) ;
    res.json(data); 
}


async function getOrderCartItemList(req, res, next) {
    let username = req.params.username ; 
    let retailerid = req.params.retailerid
    let data = await s2s_service.getOrderCartItemList(username, retailerid) ;
    res.json(data); 
}
async function addItemToCart(req, res, next) {
    let itemDetails = req.body.item_details ; 
    let data = await s2s_service.addItemToCart(itemDetails) ;
    res.json(data); 
}

async function addMultipleItemsToCart(req, res, next) {
    let itemDetails = req.body.items_details ; 
    let data = await s2s_service.addItemToCart(itemDetails) ;
    res.json(data); 
}


async function getWishListItems(req, res, next) {
    let username = req.params.username ; 
    let retailerid = req.params.retailerid
    let data = await s2s_service.getWishListItems(username, retailerid) ;
    res.json(data); 
}
async function addItemToWishList(req, res, next) {
    let itemDetails = req.body.item_details ; 
    let data = await s2s_service.addItemToWishList(itemDetails) ;
    res.json(data); 
}

async function addMultipleItemsToWishList(req, res, next) {
    let itemDetails = req.body.items_details ; 
    let data = await s2s_service.addItemToWishList(itemDetails) ;
    res.json(data); 
}

async function removeItemFromWishList(req, res, next) {
    let itemDetails = req.body.items_details ; 
    let data = await s2s_service.removeItemFromWishList(itemDetails) ;
    res.json(data); 
}


async function getSalesQuotation(req, res, next) {
    let userDetails = req.body.user_details ; 
    let data = await s2s_service.getSalesQuotation(userDetails) ;
    res.json(data); 
}

async function createSalesQuotation(req, res, next) {
    let quotationDetails = req.body; 
    let data = await s2s_service.createSalesQuotation(quotationDetails) ;
    res.json(data); 
}

async function addItemToSalesQuotation(req, res, next) {
    let itemDetails = req.body ; 
    let data = await s2s_service.addItemToSalesQuotation(itemDetails) ;
    res.json(data); 
}

async function getItemStyleHistory(req, res, next) {
    let jewelSoftId = req.body.jewelSoftId ; 
    let itemCd = req.body.item_cd ;
    let data = await s2s_service.getItemStyleHistory(jewelSoftId, itemCd) 
    res.json(data); 
}
async function getInventoryMessage(req, res, next) {
    let itemCode = req.params.itemCode ; 
    let qty = req.params.qty
    let data = await s2s_service.getInventoryMessage(itemCode, qty) ;
    res.json(data); 
}
