import axios from "axios";




export const fetchStockDetails = async (payload: any) => {
  try {
    
    let url = `${import.meta.env.VITE_API_URL}/s2s/product/inventorymessage/${payload.ITEM_CD}/${payload.qty}`
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching filters:", error);
    throw error;
  }
};

export const fetchItemDetails = async (payload: any) => {
  try {
    
    let url = `${import.meta.env.VITE_API_URL}/s2s/product/${payload.ITEM_CD}/${payload.RETAILER_ID}`
    const response = await axios.get(url);
    if (response.data && response.data.dataArray && response.data.dataArray.length > 0) {
      return response.data; 
    }
    else{
      console.log("No data found for URL " + url ) ;
      return {} ;
    }
    
  } catch (error) {
    console.error("Error fetching filters:", error);
    throw error;
  }
};

export const fetchItems = async (payload: any) => {
  try {
    const response = await axios.post("http://localhost:8090/api/v1/elastic/elastic-service/items", payload, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }

};

export const fetchQuotationData = async () => {
  try {

    let payload = 
      {
        "user_details":{  
            "UserName": localStorage.getItem("Email"),
            "jewelsoftId":localStorage.getItem("JewelSoftId")
        }
    }

    let url = `${import.meta.env.VITE_API_URL}/s2s/sales/quotation`
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching quotation data:", error);
    throw error;
  }
};  
