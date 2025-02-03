import React, { useState, useEffect } from "react";
import {
  buildItemsPayload,
  buildLeftFiltersPayload,
} from "./utils/payloadUtils";
import { fetchFilters, fetchItems } from "./services/filterService";
import { fetchAndSaveGlobalSettings } from "./services/globalSettingsService";
import LeftFilters from "./components/LeftFilters";
import TopFilters from "./components/TopFilters";
import MainGrid from "./components/MainGrid";
import CompareStrip from "./components/modals/CompareStrip";
import { CompareProvider, useCompare } from "/Users/utkarshalshi/Desktop/product-list/src/context/CompareContext.tsx";


// Main Component
const AppComponent = () => {
  const [payload, setPayload] = useState<{ [key: string]: any }>({});
  const [serverData, setServerData] = useState<any>([]);
  const [itemsData, setItemsData] = useState<any>([]);
  const [filtersLoading, setFiltersLoading] = useState<boolean>(true);
  const [itemsLoading, setItemsLoading] = useState<boolean>(true);
  const [itemsLoaded, setItemsLoaded] = useState<boolean>(false);
  const [selectedFilterArray, setSelectedFilterArray] = useState<any[]>([]);

  const [isCompareStripVisible, setCompareStripVisible] = useState(false);
  const [products, setProducts] = useState<string[]>([]);


// Function to add a product to the compare list
const addToCompare = (itemId: string) => {
  if (!products.includes(itemId)) {
    const updatedProducts = [...products, itemId];
    setProducts(updatedProducts);
    setCompareStripVisible(true); // Ensure strip is shown
  }
};

// Function to remove a product from the compare list
const removeFromCompare = (itemId: string) => {
  const updatedProducts = products.filter((id) => id !== itemId);
  setProducts(updatedProducts);
  if (updatedProducts.length === 0) setCompareStripVisible(false);
};

// Function to clear all products from the compare list
const clearCompare = () => {
  setProducts([]);
  setCompareStripVisible(false);
};

  const categoryName = new URLSearchParams(window.location.search).get(
    "CategoryName"
  );
  const categoryId = new URLSearchParams(window.location.search).get(
    "CategoryId"
  );
  const parentCategoryId = new URLSearchParams(window.location.search).get(
    "PCategoryId"
  );
  const parentCategoryName = new URLSearchParams(window.location.search).get(
    "PCategoryName"
  );

  const [sortOrder, setSortOrder] = useState({
    "best-seller": "asc",
    price: "asc",
    "diamond-weight": "asc",
    "new-item": "asc",
  });

  const toggleSortOrder = (
    field: string,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    // Prevent the default behavior of the <a> tag
    event.preventDefault();
    const validSortFields = [
      "best-seller",
      "price",
      "diamond-weight",
      "new-item",
    ] as const;
    if (!validSortFields.includes(field as (typeof validSortFields)[number])) {
      return;
    }

    const newOrder =
      sortOrder[field as (typeof validSortFields)[number]] === "asc"
        ? "desc"
        : "asc";
    setSortOrder((prevSortOrder) => ({
      ...prevSortOrder,
      [field]: newOrder,
    }));

    //change the data inside  payload
    const updatedPayload = {
      ...payload,
      data: {
        ...payload.data,
        sort: {
          field: field,
          order: newOrder,
        },
      },
    };
    setPayload(updatedPayload);
  };


  const removeFilter = (groupDisplayName: any, bucket: any) => {
    if (groupDisplayName === "Product_Type") {
      payload["data"]["CATEGORIES"] = payload["data"]["CATEGORIES"].filter(
        (item: any) => item !== bucket.key["category_id"]
      );
    } else {
      payload["data"][groupDisplayName] = payload["data"][
        groupDisplayName
      ].filter((item: any) => item !== bucket);
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
    setPayload(updatedFilters);
  };

  const fetchData = async (
    argPayload: { [key: string]: any },
    clickedGroup: any
  ) => {
    try {
      setFiltersLoading(true);
      setItemsLoading(false);
      const globalSettings = JSON.parse(
        localStorage.getItem("globalSettings") || "{}"
      );
      const filterMappingSort =
        globalSettings.default?.side_filters?.filter_mapping_sort || [];

      const builtFilterPayload = buildLeftFiltersPayload(argPayload);
      const builtItemPayload = buildItemsPayload(argPayload);

      //before fetching filterData, store the clicked group of serverData in a variable
      let clickedGroupCount = serverData.aggregations
        ? serverData.aggregations.attribute_aggs.filtered_docs[
            clickedGroup.toLowerCase().replace(" ", "_") + "_count"
          ]
        : {};

      const filterData = await fetchFilters(builtFilterPayload);
      const itemData = await fetchItems(builtItemPayload);

      //set localstorage for jewelsoftid
      localStorage.setItem("JewelSoftId", "CARTJA")  ;
      localStorage.setItem("Email", "avalontester1@gmail.com")  ;



      if (clickedGroup) {
        //store the selected filters in the selectedFilterArray
        //first remove the clicked group from the selectedFilterArray and then add the new clicked group

        //if selectedFilterArray is empty, then add the clicked group to the selectedFilterArray
        if (selectedFilterArray.length === 0) {
          let clickedArray = [
            { [clickedGroup]: argPayload.data[clickedGroup] },
          ];
          setSelectedFilterArray(clickedArray);
        } else {
          const newSelectedFilterArray = selectedFilterArray.filter(
            (filter: any) => !filter[clickedGroup]
          );
          setSelectedFilterArray([
            ...newSelectedFilterArray,
            { [clickedGroup]: argPayload.data[clickedGroup] },
          ]);
        }
      }

      //after updating the serverData, replace the clicked group of serverData with the clicked group of filterData
      // check if clickedGroupCount is an empty object, if it is, then don't update the serverData
      if (clickedGroupCount && Object.keys(clickedGroupCount).length > 0) {
        filterData.dataArray.aggregations.attribute_aggs.filtered_docs[
          clickedGroup.toLowerCase().replace(" ", "_") + "_count"
        ] = clickedGroupCount;
      }

      //const result = await response.json();
      setServerData(filterData.dataArray); // Update state with fetched data
      setItemsData(itemData.dataArray.hits.hits); // Update state with fetched data
      
    } catch (error) {
      console.error("Error fetching left filter data:", error);
    } finally {
      setFiltersLoading(false); // Stop loading indicator
      setItemsLoaded(true);
    }
  };
  // Fetch data from server on initial load
  useEffect(() => {
    const initializeGlobalSettings = async () => {
      await fetchAndSaveGlobalSettings();
    };

    initializeGlobalSettings();

    // Initial filters setup
    const initialPayload = {
      data: {
        PARENT_CATEGORY_ID: parentCategoryId,
        RETAILER_ID: "CARTJA",
        clicked_group: "",
        CATEGORIES: [categoryId],
        stockStatus: {},
      },
    };

    setPayload(initialPayload);

    fetchData(initialPayload, "");
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    if (!payload || !payload.data) return; // Guard clause to avoid running with empty payload

    const clickedGroup = payload.data.clicked_group || "";
    fetchData(payload, clickedGroup);
    //fetchItemsData(filters);
  }, [payload]);

  useEffect(() => {
    //the below code should be called only when the page is loaded with new data
    if (filtersLoading) return;
    
    //the below code should be called only when the page is loaded with new data
    let field = payload.data.sort ? payload.data.sort.field : "";
    let newOrder = payload.data.sort ? payload.data.sort.order : "";

    if (field === "") {
      field = "best-seller";  
    };
    const iconElement = document.getElementById(`${field}Icon`);
    if (iconElement) {
      iconElement.classList.toggle("fa-caret-up", newOrder === "asc");
      iconElement.classList.toggle("fa-caret-down", newOrder === "desc");
    }

    //remove the active class from all a elements
    const aElements = document.querySelectorAll("a");
    aElements.forEach((a) => {
      a.classList.remove("active");
    });
    //change the a.active class of the clicked field

    const aElement = document.getElementById(`${field}`);
    if (aElement) {
      aElement.classList.toggle("active", true);
    }

    //also set the size value in size dropdown from payload
    const sizeElement = document.getElementById("show");
    if (sizeElement) {
      (sizeElement as HTMLSelectElement).value = (payload.data.size || "100").toString();
    } 

  }, [filtersLoading]);

  if (filtersLoading) return <div>Loading...</div>; // Render loading state

  function handlePageSizeChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    //set the size in the payload
    const updatedPayload = {
      ...payload,
      data: {
        ...payload.data,
        size: event.target.value,
      },
    };  
    setPayload(updatedPayload);
  }

  function handleViewChange(arg0: string): void {
    //change the view in maingrid component.Put the logic here by toggling the display of grid and list
    
    const mainGridElement = document.getElementById("mainprodsection");
    if (mainGridElement) {
      //hide the grid view and show the list view
      let gridView = document.getElementById("product-grid-view");
      let listView = document.getElementById("product-list-view");
      if (arg0 === "list") {
        if (gridView) {
          gridView.style.display = "none";
        }
        if (listView) {
          listView.style.display = "block";
        }
      } else {
        if (gridView) {
          gridView.style.display = "block";
        }
        if (listView) {
          listView.style.display = "none";
        }
      }
    } 

  }

  function toggleAll(): void {
    //-- select all checkboxes on itemcard and itemcardlist which are inside the ProductsBox1 id div and uncheck them when select all is unchecked
    const selectAllCheckbox:any = document.getElementById("SelectAll1");
    const itemCardCheckboxes = document.querySelectorAll("#ProductsBox1 input[type='checkbox']");
    itemCardCheckboxes.forEach((checkbox: any) => {
      checkbox.checked = selectAllCheckbox.checked;
      const selectElements = document.querySelectorAll("#ProductsBox1 select");
      if (selectAllCheckbox.checked) {
        //set all select values to 1 inside ProductsBox1 id div
        
        selectElements.forEach((select: any) => {
          (select as HTMLSelectElement).value = "1";
        });
      }
      else{
        selectElements.forEach((select: any) => {
          (select as HTMLSelectElement).value = "?";
        });
      }
    });

    const itemCardListCheckboxes = document.querySelectorAll("#product-list-view input[type='checkbox']");
    itemCardListCheckboxes.forEach((checkbox: any) => {
      checkbox.checked = selectAllCheckbox.checked;
    }); 
  }


  return (
    <div>
      <div className="container">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="../HomePage.aspx">
              <span id="brdHome">Home</span>{" "}
            </a>
            <span>
              <i className="fa fa-solid fa-angle-double-right"></i>{" "}
            </span>
            <a
              href="https://www.ashidiamonds.com/Product/ProductlandingPage.aspx"
              id="ctl00_ContentPlaceHolder1_ancPageType"
            >
              <span id="ctl00_ContentPlaceHolder1_parentcategoryname">
                Jewelry
              </span>

              <span
                className="fa fa-angle-double-right"
                id="brdProductList"
              ></span>
            </a>
            <a
              href="https://www.ashidiamonds.com/Product/ProductList.aspx?CategoryId=5&amp;PCategoryId=5&amp;PCategoryName=Bridals&amp;CategoryName=Bridals"
              id="ctl00_ContentPlaceHolder1_lnkParentCategoryId"
            ></a>
            <span id="ctl00_ContentPlaceHolder1_brdParent">
              {parentCategoryName}
            </span>{" "}
            <span
              className="fa fa-angle-double-right"
              id="brdProductList"
            ></span>
            <span id="breadcumproductid">{categoryName}</span>
          </li>
        </ol>
      </div>

      <div className="MainContent ProductListPageInner" id="mainprodsection">
        <div className="container">
          {/* Left Filters Area */}
          <div className="col-sm-3 col-md-3 col-lg-2 SideBarFilter Left nopadding">
            <div className="panel panel-default">
              <div className="panel-heading SeachPanel" id="prodlstClearall">
                <a
                  href="javascript:void(0)"
                  className="ClearAllfilter"
                  ng-click="ClearAll()"
                >
                  Clear All
                </a>
              </div>
              <div className="AttachedFilter">
                <div
                  className="panel-heading1 ng-binding ng-scope"
                  ng-repeat="fileter in CollectionCategories "
                >
                  {categoryName}
                  {selectedFilterArray &&
                    selectedFilterArray.length > 0 &&
                    selectedFilterArray.map((filter: any) => (
                      <a
                        href="javascript:void(0)"
                        ng-click="ListByFilter(fileter,filteractive1)"
                      >
                        {Object.keys(filter).map((key: any) =>
                          filter[key].map((item: any) => (
                            <div>
                              <i
                                className="fa-solid fa-circle-xmark"
                                onClick={() => removeFilter(key, item)}
                              ></i>
                              &nbsp;{item}
                            </div>
                          ))
                        )}
                      </a>
                    ))}
                </div>
              </div>
              <div className="panel-body">
                <div
                  className="panel ProductAccoding ng-scope"
                  id="leftMenuList1"
                >
                  {serverData ? (
                    <LeftFilters
                      serverData={serverData}
                      payload={payload}
                      setPayload={setPayload}
                    />
                  ) : (
                    <div>Error loading data</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Item Grid Area */}

          <div className="col-sm-9 col-md-9 col-lg-10 col-xs-12 ProductShow Right nopadding_r ProductListView">
            <div className="col-xs-12 col-sm-12 ListpageBanner nopadding hidden-xs">
              <h3 className="">
                <span>Bridals</span>
              </h3>
            </div>

            <div className="col-xs-12 col-sm-12 ListpageBanner nopadding hidden-xs">
              {serverData ? (
                <TopFilters
                  serverData={serverData}
                  payload={payload}
                  setPayload={setPayload}
                />
              ) : (
                <div>Error loading data</div>
              )}
            </div>

            <div className="col-sm-12 HorizontalFilter nopadding">
              <div className="col-sm-12 col-md-12 col-lg-5 pull-left SortLeft  nopadding_r">
                <p>
                  <span className="hidden-xs">Sort By: </span>
                  <a
                    href="Javascript:void(0)"
                    id="best-seller"
                    className="SortBestSellers active disable_a_href"
                    onClick={(event) => toggleSortOrder("best-seller", event)}
                  >
                    Best Sellers
                  </a>
                  <a
                    href="Javascript:void(0)"
                    id="price"
                    className="SortPricing"
                    onClick={(event) => toggleSortOrder("price", event)}
                  >
                    Price
                    <i className="fa-caret-up fa" id="priceIcon"></i>
                  </a>

                  <a
                    href="Javascript:void(0)"
                    id="diamond-weight"
                    className="SortDiamondWeight"
                    onClick={(event) =>
                      toggleSortOrder("diamond-weight", event)
                    }
                  >
                    Diamond Weight
                    <i className="fa-caret-up fa" id="diamond-weightIcon"></i>
                  </a>

                  <a
                    href="Javascript:void(0)"
                    id="new-item"
                    className="SortNewItems"
                    onClick={(event) => toggleSortOrder("new-item", event)}
                  >
                    New <span className="hidden-xs">Items</span>
                  </a>
                </p>
              </div>
              <div className="col-sm-12 col-md-12 col-lg-7 pull-left PaginationRight ProductListTopPagination">
                <div className="col-xs-12 col-sm-5 pull-left PerPageProducts nopadding">
                  <label
                    className="control-label col-xs-2 col-sm-3 paddingTop6 text-right nopadding"
                    htmlFor="show"
                  >
                    Show:
                  </label>
                  <div className="col-xs-10 col-sm-9 DropDownIcon">
                    <select
                      className="form-control ng-pristine ng-untouched ng-valid"
                      id="show"
                      onChange={(event) => handlePageSizeChange(event)}
                    >
                      <option value="100">
                        100 Per Page
                      </option>
                      <option value="200">
                        200 Per Page
                      </option>
                      <option value="300">
                        300 Per Page
                      </option>
                    </select>
                  </div>
                </div>
                <div className="col-xs-12 col-sm-2 text-right ProductListItemsCount marginTop5">
                  <span id="totalproductcount" style={{ paddingRight: "10px" }}>
                    {serverData.hits.total.value}
                  </span>
                  Items
                </div>
                <nav className="col-xs-12 col-sm-4 pull-left  nopadding"></nav>
                <div className="col-xs-12 col-sm-1 nopadding_r GridV">
                  <div
                    className="ProductListMobileStrip"
                    style={{ display: "block", textAlign: "center" }}
                  >
                    <div className="ProductFilterSortStrip">
                      <a
                        href="javascript:void(0)"
                        className="ProductMobBack"
                        style={{ display: "none" }}
                        onClick={() => handleViewChange("grid")}
                      >
                        <i className="fa fa-angle-left" aria-hidden="true"></i>
                      </a>
                      <a
                        href="javascript:void(0)"
                        className="ProductMobGrid"
                        style={{ display: "block" }}
                        onClick={() => handleViewChange("list")}
                      >
                        <i className="fa fa-th-list" title="List View"></i>
                        {/*   <i className="fa fa-th-large" title="Grid View"></i> */}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-12 SelectAllCartButton nopadding">
              <div className="col-sm-12 col-md-4 pull-left SelectAllItemCount nopadding">
                <div className="checkbox checkbox-primary pull-left">
                  <input
                    type="checkbox"
                    id="SelectAll1"
                    onClick={() => toggleAll()}
                    className="ng-pristine ng-untouched ng-valid"
                  />
                  <label htmlFor="SelectAll1">Select All</label>
                </div>
                <div className="ItemCount pull-left">
                  <span id="lstitemcount" className="ng-binding">
                    (0) Items Selected{" "}
                  </span>
                </div>
              </div>

              <div className="col-sm-12 col-md-8 pull-left WishListOrderCart text-right nopadding">
                <a
                  id="SalesQuotationAll1"
                  href="javascript:void(0)"
                  title=""
                  ng-model="SQALL"
                  ng-click="ListQuotationPopupFunction(0)"
                  className="btn btn-transparent disabled ng-pristine ng-untouched ng-valid"
                  data-toggle="modal"
                  data-target="#SalesQuotation"
                >
                  <i className="fa fa-file-invoice"> </i>&nbsp; Add{" "}
                  <span>Selected Items </span>to Quotation
                 </a> 
                <a
                  id="WishListall1"
                  href="javascript:void(0)"
                  ng-click="WishListPageAll()"
                  className="btn btn-transparent disabled"
                  style={{ display: "inline" }}
                >
                  <i className="fa fa-heart"> </i>&nbsp; Add{" "}
                  <span>Selected Items </span>to Wish List
                </a>
                <a
                  id="Ordercartall1"
                  href="javascript:void(0);"
                  ng-click="OderCartPageAll()"
                  className="btn btn-transparent1 disabled"
                  style={{ display: "inline-block" }}
                >
                  <i className="fa fa-cart-shopping"> </i>&nbsp; Add{" "}
                  <span>Selected Items </span>to Order Cart
                </a>
              </div>
            </div>
            <>

              {itemsData ? (
                <CompareProvider>
                <MainGrid items={itemsData} addToCompare={addToCompare}  />
                <CompareStripWrapper />
                </CompareProvider>
              ) : (
                <div>Error loading items</div>
              )}

              {/* Global CompareStrip */}
      {/* {isCompareStripVisible && (
        <CompareStrip
          products={products}
          removeFromCompare={removeFromCompare}
          clearCompare={clearCompare}
        />
      )} */}
               
            </>
          </div>
          {/* Top Filters Area */}
        </div>
       
      </div>

    </div>
  );
};

const CompareStripWrapper: React.FC = () => {
  const { products, removeFromCompare, clearCompare, isCompareStripVisible } = useCompare();

  return (
    <>
      {isCompareStripVisible && (
        <CompareStrip
          products={products}
          removeFromCompare={removeFromCompare}
          clearCompare={clearCompare}
        />
      )}
    </>
  );
};

export default AppComponent;


