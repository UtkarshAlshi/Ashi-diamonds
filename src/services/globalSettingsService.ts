import axios from "axios";

const API_URL = "http://localhost:8090/api/v1/reference/global-settings"; // Replace with your actual API URL
const LOCAL_STORAGE_KEY = "globalSettings";

export const fetchAndSaveGlobalSettings = async (): Promise<void> => {
  try {
    // Fetch data from the API
    const response = await axios.get(API_URL, {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InByYXZlZW5AaGlsZXh0ZWNoLmNvbSIsImNvbXBhbnlfY29kZSI6IkhMWDAwMSIsImlhdCI6MTcwODUyNjI2Mn0.OFXZQ48WWOW0cStkk5npdXbz0JZ1XWVRL2aL8kJJqL8",
          },
    });

    if (response.status === 200) {
      // Save the response to local storage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(response.data));
      console.log("Global settings saved to local storage.");
    } else {
      console.error("Failed to fetch global settings. Status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching global settings:", error);
  }
};

// Function to get global settings from local storage
export const getGlobalSettingsFromLocalStorage = (): any | null => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};
