const express = require('express');
const router = express.Router();
const reference_service = require('../services/reference.services')
const globalSettings = require('../../global-settings.json') 
const axios = require('axios')
require('dotenv').config() ; 


// routes
router.get('/elastic-service', callService);
router.get('/global-settings', getGlobalSettings);

module.exports = router;
async function callService(req, res, next) {
    let data = await reference_service.getReferenceData() ;
    res.json(data); 
  
}


async function getGlobalSettings(req, res, next) {
    res.json(globalSettings);  
  
}
