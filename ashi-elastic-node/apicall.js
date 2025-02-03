const axios = require('axios');

// API URL and headers
const apiUrl = 'http://localhost:8090/api/v1/dotnet-to-elastic/items';
const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InByYXZlZW5AaGlsZXh0ZWNoLmNvbSIsImNvbXBhbnlfY29kZSI6IkhMWDAwMSIsImlhdCI6MTcwODUyNjI2Mn0.OFXZQ48WWOW0cStkk5npdXbz0JZ1XWVRL2aL8kJJqL8',
};

// Payload
const payload = {
  "pagesize": 100,
  "storeid": "CARTJA",
  "pageindex": 1,
  "pricemax": 1200,
  "pricemin": 1000,
  "pricelevel": null,
  "pricemarkup": 0,
  "discount": 0,
  "priceroundoff": 0,
  "vendorid": 0,
  "orderby": 10,
  "keywords": "",
  "categoryids": [
      {
          "id": 11
      }
  ],
  "microwebsiteid": 0,
  "CollectionId": 0,
  "CategoryId": 5,
  "designerids": [],
  "filteredspecs": [],
  "collectionids": [],
  "publishedproducts": 1,
  "producttypeid": 1,
  "subpageindex": 0,
  "subpagesize": 8,
  "manufacturerid": 0,
  "currentfilteredspecs": [],
  "productids": "",
  "cachedate": 0
}

// Function to call the API
const callApi = async () => {
  try {
    const response = await axios.post(apiUrl, payload, { headers });
    let sortedProducts = response.data.products.sort((a, b) => a.price - b.price);    
    sortedProducts.forEach(element => {
      //log the item price sorted by price

      console.log(element.productid + " : " + element.price); 
    });


  } catch (error) {
    console.error('Error calling the API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

// Call the API function
callApi();
