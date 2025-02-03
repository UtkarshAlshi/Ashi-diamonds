import axios from "axios";

export const fetchFilters = async (payload: any) => {
  try {
    const response = await axios.post(
      "http://localhost:8090/api/v1/elastic/elastic-service/filters",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching filters:", error);
    throw error;
  }
};

export const fetchItems = async (payload: any) => {
  try {
    const response = await axios.post(
      "http://localhost:8090/api/v1/elastic/elastic-service/items",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

export const fetchRelatedProducts = async (items: any) => {
  try {
    let payload = {
      query_type: "_search",
      data: {
        retailerId: localStorage.getItem("JewelSoftId"),
        items: items,
      },
    };
    const response = await axios.post(
      "http://localhost:8090/api/v1/elastic/elastic-service/related-items",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching related products:", error);
    throw error;
  }
};
