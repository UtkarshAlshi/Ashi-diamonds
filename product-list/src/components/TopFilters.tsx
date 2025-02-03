import React from "react";
import { Filters } from "../types";

interface TopFiltersProps {
  payload: any;
  setPayload: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
  serverData: any; // The JSON response from the server
}

const TopFilters: React.FC<TopFiltersProps> = ({
  serverData,
  payload,
  setPayload,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      payload["data"]["stockStatus"][e.target.value] = true ;
    } else {
      payload["data"]["stockStatus"][e.target.value] = false;
    }

    let payloadData = payload.data;
    const updatedFilters = {
      data: {
        ...payloadData
      },
    };
    //update filters object in the parent component
    setPayload(updatedFilters);
  };

  return (
    <div className="nopadding_r allCheckBtn">
      <div className="SortLeft row">
        <div className="col-md-2">
          <label>
            <input
              type="checkbox"
              className="checkbox-primary"
              value="In_Stock"
              checked={payload.data.stockStatus["In_Stock"]}
              name="in_stock"
              onChange={handleChange}
            />
            &nbsp;
            In Stock
          </label>
        </div>
        <div className="col-md-2">
          <label>
            <input
              type="checkbox"
              value="In_Production"
              className="checkbox-primary"
              checked={payload.data.stockStatus["In_Production"]}
              name="in_production"
              onChange={handleChange}
            />
            &nbsp;
            In Production
          </label>
        </div>
        <div className="col-md-2">
          <label>
            <input
              type="checkbox"
              className="checkbox-primary"
              value="Open_Orders"
              checked={payload.data.stockStatus["Open_Orders"]}
              name="open_orders"
              onChange={handleChange}
            />
            &nbsp;
            Open Orders
          </label>
        </div>
        <div className="col-md-2">
          <label>
            <input
              type="checkbox"
              className="checkbox-primary"
              value="Open_Memos"
              checked={payload.data.stockStatus["Open_Memos"]}
              name="open_memos"
              onChange={handleChange}
            />
            &nbsp;
            Open Memos
          </label>
        </div>
        <div className="col-md-2">
          <label>
            <input
              type="checkbox"
              className="checkbox-primary"
              value="Purchased"
              checked={payload.data.stockStatus["Purchased"]}
              name="purchased"
              onChange={handleChange}
            />
            &nbsp;
            Purchased
          </label>
        </div>
      </div>
    </div>
  );
};

export default TopFilters;
