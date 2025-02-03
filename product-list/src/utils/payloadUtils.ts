export const buildLeftFiltersPayload = (filters: { [key: string]: any }) => {
  interface Payload {
    [key: string]: any; // Allows dynamic keys with any value
    query_type?: string;
    query_code?: string;
    data?: any;
  }

  let payload: Payload = {};
  //let payload = { [key: string]: string} = {}
  payload = {
    query_type: "_search",
    query_code: "left_side_filter_query",
    data: filters.data
  };

  //payload.data.stockStatus = filters.original_filters?.data?.stockStatus;

  getTopFilterStatus(filters, payload);  
  return payload;
};

export const getTopFilterStatus = (filters: { [key: string]: any }, payload: any) => {
    //if filters.data has in_stock, in_production, open_orders, open_memos, purchased, my_stock then add it to stockStatus object
    if (filters.in_stock || filters.original_filters?.data?.in_stock) {
      if (!payload.data.stockStatus) {
        payload.data.stockStatus = {};
      }
      payload.data.stockStatus.In_Stock = true;
    } 
    if (filters.in_production || filters.original_filters?.data?.in_production ) {
      if (!payload.data.stockStatus) {
        payload.data.stockStatus = {};
      }
      payload.data.stockStatus.In_Production = true;
    }
    if (filters.open_orders || filters.original_filters?.data?.open_orders ) {     
      if (!payload.data.stockStatus) {
        payload.data.stockStatus = {};
      }
      payload.data.stockStatus.Open_Order = true;
    }
    if (filters.open_memos || filters.original_filters?.data?.open_memos ) {
      if (!payload.data.stockStatus) {
        payload.data.stockStatus = {};
      }
      payload.data.stockStatus.Open_Memo = true;
    }
    if (filters.purchased || filters.original_filters?.data?.purchased   ) {
      if (!payload.data.stockStatus) {
        payload.data.stockStatus = {};
      }
      payload.data.stockStatus.Purchase = true;
    }   
    if (filters.my_stock || filters.original_filters?.data?.my_stock) {
      if (!payload.data.stockStatus) {
        payload.data.stockStatus = {};
      }
    payload.data.stockStatus.My_Stock = true;
  } 
}

export const buildItemsPayload = (filters: { [key: string]: any }) => {
  let payload: any;
  payload = {
    query_type: "_search",
    query_code: "item_query",
    data: filters.data
  };
  //payload.data.stockStatus = filters.original_filters?.data?.stockStatus;

  getTopFilterStatus(filters, payload);  
  return payload; 

}
