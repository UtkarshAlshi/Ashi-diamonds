const query = require('./query.json')
const globalSettings = require('../../global-settings.json')
const axios = require('axios')
var { ElasticResponse } = require('../utils/response')

const constants = require('../utils/constants')
module.exports = {
    getReferenceData,
    getReferenceDataForSearch
};




function getReferenceData(){


    let returnArray =  [
        {
          "display_value": "Product Type",
          "data_value": "Product_Type",
          "display_order": 1
        },
        {
          "display_value": "Product Style",
          "data_value": "Product_Style",
          "display_order": 2
        }
      ]

      let filterMappings = globalSettings.default.side_filters.filter_mapping ;
      let aggregateJson = {} ;
      let i = 3 ; 
      filterMappings.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
          const parts = value.split('.');
          if (parts && parts.length > 1){
            let referenceItem = {
              "display_value": key,
              "data_value": parts[1],
              "display_order": i++ 
          }
          returnArray.push(referenceItem)
          }

        })

      }) ;

      return returnArray ; 
     
}


function getReferenceDataForSearch(){


  let returnArray =  [
      {
        "display_value": "Product Style",
        "data_value": "Product_Style",
        "display_order": 2
      }
    ]

    let filterMappings = globalSettings.pages['search-product-list-page'].side_filters.filter_mapping;
    let aggregateJson = {} ;
    let i = 3 ; 
    filterMappings.forEach(item => {
      Object.entries(item).forEach(([key, value]) => {
        //const parts = value.split('.');
        //if (parts && parts.length > 1){
          let referenceItem = {
            "display_value": key,
            "data_value": (typeof value === "string" ? value.replace(" ", "_") : value), 
            "display_order": item.display_order 
        }
        returnArray.push(referenceItem)
        //}

      })

    }) ;

    return returnArray ; 
   
}