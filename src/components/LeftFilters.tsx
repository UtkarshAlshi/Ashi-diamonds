import React, { useState } from "react";

interface LeftFiltersProps {
  payload: any;
  setPayload: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
  serverData: any; // The JSON response from the server
}

const LeftFilters: React.FC<LeftFiltersProps> = ({
  serverData,
  payload,
  setPayload
}) => {
  // Fetch the filter mapping from global settings stored in local storage
  const globalSettings = JSON.parse(
    localStorage.getItem("globalSettings") || "{}"
  );
  const filterMappingSort =
    globalSettings.default.side_filters.filter_mapping_sort || [];

  // Sort the filter mapping by sort_order
  const sortedFilterMapping = [...filterMappingSort].sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  );

  const [showAll, setShowAll] = useState(false); // State to toggle display of checkboxes

  // Define the maximum number of checkboxes to show when collapsed
  const MAX_VISIBLE = 3;

  // Determine the checkboxes to display based on `showAll`
  

  // Handler for toggling showAll
  const toggleShowAll = () => setShowAll((prev) => !prev);

  //const params = new URLSearchParams(location.search);
  //const searchTerm = params.get("search_term");

  // Handle checkbox changes
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    group: any,
    bucket: any
  ) => {
    // if checkbox is checked then add the group name and bucket key to the payload object
    let groupDisplayName = group.display_name.replace(/\s+/g, "_");
    let groupName = group.name;

    if (!payload["data"][groupDisplayName]) {
      payload["data"][groupDisplayName] = [];
    }

    if (e.target.checked) {
      if (groupDisplayName === "Product_Type") {
        payload["data"]["CATEGORIES"].push(bucket.key["category_id"]);
      } else {
        payload["data"][groupDisplayName].push(bucket.key[groupName]);
      }
    } else {
      if (groupDisplayName === "Product_Type") {
        payload["data"]["CATEGORIES"] = payload["data"]["CATEGORIES"].filter(
          (item: any) => item !== bucket.key["category_id"]
        );
      } else {
        payload["data"][groupDisplayName] = payload["data"][
          groupDisplayName
        ].filter((item: any) => item !== bucket.key[groupName]);
      }
    }

    let clickedGroup = { clicked_group: groupDisplayName };
    let payloadData = payload.data;
    //let originalFilters = { original_filters: filters };
    // Update the filters object immutably
    const updatedFilters = {
      data: {
        ...payloadData,
        ...clickedGroup,
      },
    };
    //update filters object in the parent component
    setPayload(updatedFilters);
  };

  //create a function to return payload object to parent compoenent
  const getLeftFiltersPayload = () => {
    return payload;
  };

  
  // Extract data for a given group name from the server response
  const getGroupData = (group: any) => {
    const dataPath = group.name.split("."); // Handle nested keys if needed
    let groupData = []; //serverData.aggregations.attribute_aggs.filtered_docs;
    groupData = serverData.aggregations.attribute_aggs.filtered_docs;

    for (const key of dataPath) {
      groupData = groupData?.[key];

      if (!groupData) break;
    }
    return groupData?.buckets || [];
  };

  return (
    <div>
      {sortedFilterMapping.map((group: any) => {
        const groupData = getGroupData(group);

        // Skip if no data is available for this group
        if (!groupData || groupData.length === 0) return null;

        function checkIfChecked(group: any, bucket: any): boolean | undefined {
          // convert this statement to a function
          let groupDisplayName =
            group.display_name == "Product Type"
              ? "CATEGORIES"
              : group.display_name.replace(" ", "_");
          let bucketKeyName =
            group.name == "product_type_count" ? "category_id" : group.name;
          return payload.data[groupDisplayName]?.includes(
            bucket.key[bucketKeyName]
          );
        }
        const visibleCheckboxes = showAll ? groupData : groupData.slice(0, MAX_VISIBLE);
        return (
          <div key={group.id || group.name}>
            <div className="panel-heading">
              <h3 className="panel-title ng-binding">{group.display_name}</h3>
            </div>
            <div className="panel-body ProductCat">
              <ul>
                {visibleCheckboxes.map(
                  (bucket: any, index: number) =>
                    bucket.doc_count > 0 && (
                      <li key={index}>
                        <div className="checkbox checkbox-primary">
                          <input
                            type="checkbox"
                            name={bucket.key[group.name]}
                            checked={checkIfChecked(group, bucket)}
                            onChange={(e) =>
                              handleCheckboxChange(e, group, bucket)
                            }
                          />
                          <label>
                            {bucket.key[group.name]}{" "}
                            <span className="count">({bucket.doc_count})</span>
                          </label>
                        </div>
                      </li>
                    )
                )}

                {/* Conditionally render the "Read More / Read Less" link */}
                {groupData.length > MAX_VISIBLE && (
                  <li className="readmore">
                    <a
                      className="readmore"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleShowAll();
                      }}
                    >
                      {showAll ? "Show Less" : "Show More"}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeftFilters;
