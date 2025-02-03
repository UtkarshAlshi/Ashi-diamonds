const express = require('express');
const router = express.Router();
const dotnetToElastic = require('../services/dotnet-to-elastic.service')
const axios = require('axios')
require('dotenv').config() ; 


// routes
router.post('/items', callItems);


module.exports = router;
async function callItems(req, res, next) {
    let data = await dotnetToElastic.getFullData(req.body);
    res.json(data.dataArray); 
}
