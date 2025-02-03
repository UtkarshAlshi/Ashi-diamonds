import React, { useEffect, useState } from "react";
import "./ItemModal.css";
import {
  fetchItemDetails,
  fetchStockDetails,
} from "../../services/ashi-dotnet-service";

import { fetchRelatedProducts } from "../../services/filterService";

interface AddToWishlistProps {
  isWishlistOpen: boolean;
  onWishlistClose: () => void;
  itemData: any; // Replace with proper type if you know the structure of itemData
}

const AddToWishlist: React.FC<AddToWishlistProps> = ({
  isWishlistOpen,
  onWishlistClose,
  itemData,
}) => {
  //--set isOpen

  const [selectedValue, setSelectedValue] = useState("");
  const [stockLabel, setStockLabel] = useState("");
  const [itemDetails, setItemDetails] = useState<any>({});
  const [isAddToWishlistOpen, setIsAddToWishlistOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const backdropDiv = document.createElement("div");
    //set the id of backdropDiv
    backdropDiv.id = "itemModalId";
    backdropDiv.className = "modal-backdrop fade in";

    const fetchItemData = async (payload: any) => {
      let itemDetailsData = await fetchItemDetails(payload);
     // setRelatedProducts(itemDetailsData.dataJson.hits.hits);
      setItemDetails(itemDetailsData);
      //let relatedProducts = await fetchRelatedProducts(itemDetails.dataArray[0].similarStyles);
      //setRelatedProducts(relatedProducts);
      //setStockMessage(stockLabel);
    };

    if (isWishlistOpen) {
      document.body.appendChild(backdropDiv);
      let payload = {};
      if (itemData.dataArray) {
        payload = {
          ITEM_CD: itemData.dataArray[0].itemCD,
          RETAILER_ID: localStorage.getItem("JewelSoftId"),
        };
      } else {
        payload = {
          ITEM_CD: itemData._source.product_data.ITEM_ID,
          RETAILER_ID: localStorage.getItem("JewelSoftId"),
        };
      }
      // fetch item details
      fetchItemData(payload);
      setSelectedValue("1");
    }

    return () => {
      if (document.body.contains(backdropDiv)) {
        document.body.removeChild(backdropDiv);
      }
    };
  }, [isWishlistOpen]);

  const setStockMessage = (message: string) => {
    let stockElement = document.getElementById("stockLabelId");
    if (stockElement) {
      stockElement.innerHTML = message;
    }
  };

  useEffect(() => {
    if (selectedValue) {
      // Call service when selectedValue changes
      const fetchStockData = async () => {
        try {
          let payload = {
            ITEM_CD: itemData._source.product_data.ITEM_CD,
            qty: selectedValue,
          };
          const response = await fetchStockDetails(payload);
          setStockLabel(response?.dataJson?.inventoryMessage); // Update the label with service response
          setStockMessage(stockLabel);
        } catch (error) {
          console.error("Error fetching service data:", error);
          setStockLabel(" ");
        }
      };

      fetchStockData();
    }
  }, [selectedValue]);

  useEffect(() => {
    if (isAddToWishlistOpen) {
      // Remove the backdrop from the first modal
      let backdropDiv = document.getElementById("itemModalId");
      if (backdropDiv && document.body.contains(backdropDiv)) {
        document.body.removeChild(backdropDiv);
      }

      // Add a new backdrop for the Add to Cart modal
      const newBackdropDiv = document.createElement("div");
      newBackdropDiv.className = "modal-backdrop fade in";
      newBackdropDiv.id = "addToCartModalId";
      document.body.appendChild(newBackdropDiv);
    }
  }, [isAddToWishlistOpen]);

  if (!isWishlistOpen) {
    return null; // Don't render the modal if it's not open
  }

  const handleAddToWishlistClick = () => {
    // Close current modal and open Add To Cart modal
    console.log("Wishlist button clicked");
  setIsAddToWishlistOpen(true);
  console.log("isAddToWishlistOpen state updated to true");
  };

  return (
    isWishlistOpen &&
    itemDetails.dataJson && (
      <div
        className="modal fade bs-example-modal-lg in showDialog"
        role="document"
        id="ShoppingBagCon"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" onClick={onWishlistClose}>
                <span aria-hidden="true">×</span>
              </button>
              <h2> Item Added to Your Wish List</h2>
            </div>
            <div className="modal-body">
              <div className="row nomargin sqconpopup">
                <div className="col-lg-3 col-md-3 col-sm-3 col-xs-12 marginTop15">
                  <div
                    className="TagIcon text-center ng-scope"
                    ng-if="IS_NEW_ITEM ==0 &amp;&amp; IS_TOP_SELLER_ITEM !=0 &amp;&amp; IS_OVER_STOCK_ITEM ==0"
                  >
                    <img
                      src="https://i.ashidiamonds.com/images/NewImages/Icon_bestseller.png"
                      className="img-responsive"
                      alt=""
                      title=""
                    />
                  </div>

                  <img
                    className="img-responsive img-center"
                    width="170"
                    height="170"
                    src={
                      itemDetails.dataJson.hits.hits[0]._source.product_data
                        .IMAGE_URL_1
                    }
                    alt="Item Image"
                  />
                </div>

                <div className="col-lg-9 col-md-9 col-sm-9 col-xs-12 listPopupRight">
                  <h3 className="ng-binding">
                    {
                      itemDetails.dataJson.hits.hits[0]._source.product_data
                        .ITEM_NAME
                    }
                  </h3>
                  <input
                    type="hidden"
                    ng-value="ConfirmationItemid"
                    value="19429"
                  />

                  <p className="Conf_Short_Web_Desc ng-binding">
                    {
                      itemDetails.dataJson.hits.hits[0]._source.product_data
                        .SHORT_WEB_DESC
                    }
                  </p>
                  <div className="col-xs-12 col-sm-12 styleID nopadding">
                    <label className="control-label pull-left">
                      Style #:&nbsp;{" "}
                    </label>
                    <big className="ng-binding">
                      {" "}
                      {
                        itemDetails.dataJson.hits.hits[0]._source.product_data
                          .ITEM_CD
                      }{" "}
                    </big>
                  </div>
                  <div
                    className="col-xs-12 col-sm-12 stockSize nopadding ng-scope"
                    ng-if="StockSize != 0.0 &amp;&amp; StockSize != 0"
                  >
                    <label className="control-label pull-left">Price</label>
                    <big className="ng-binding">
                      {
                        itemDetails.dataJson.hits.hits[0].inner_hits
                          .retailer_data.hits.hits[0]._source.Price_Retail
                      }
                    </big>
                  </div>
                  <div
                    className="col-xs-12 col-sm-12 shopprice nopadding ng-scope"
                    ng-if="ConfirmationPrices == SalePrice"
                  >
                    <label className="control-label pull-left">
                      Qty:&nbsp;
                    </label>
                    <big className="ng-binding ng-scope">{"1"}</big>
                  </div>
                </div>
              </div>
              <div className="clearfix"></div>

              <div className="col-xs-12 col-sm-6 marginTop10">
                <a
                  href="javascript:void(0)"
                  ng-click="CountinueBrowsing1()"
                  className="btn btn-default btn-block"
                >
                  CONTINUE BROWSING
                </a>
              </div>
              <div className="col-xs-12 col-sm-6 marginTop10">
                <a
                  href="https://www.ashidiamonds.com/OrderCart/OrderCart.aspx"
                  className="btn btn-orange btn-block"
                >
                  GO TO ORDER CART
                </a>
              </div>
            </div>
            <div              className="row relatedProductWraper nomargin"             id="RelatedProductData"              style={{ opacity: 1 }}            >
              <hr />
              <div className="col-xs-12">
                <h2>Other Retailers also Purchased</h2>
                <section>
                  <div id="jcarousel2" className="jcarousel-wrapper">
                    <div
                      className="jcarousel"
                      data-jcarousel="true"
                      data-jcarouselautoscroll="true"
                      data-jcarouselswipe="true"
                      style={{ touchAction: "pan-y" }}
                    >
                      <ul style={{ left: "0px", top: "0px" }}>
                        {relatedProducts && relatedProducts.map((product: any) => (
                          <li
                          id="ProductsBox"
                          className="col-sm-6 col-md-4 col-lg-3 ProductsBox"
                          style={{ width: "188px" }}
                        >
                          <div className="TagIcon text-center">
                            {product._source.product_data.IS_TOP_SELLER_ITEM != 0 && <img
                              src="https://i.ashidiamonds.com/images/NewImages/Icon_bestseller.png"
                              className="img-responsive"
                              alt=""
                              title=""
                              draggable="false"
                              style={{ userSelect: "none" }}
                            />}
                          </div>
                          <a
                            href={`/product/${product._source.product_data.ITEM_CD}`}
                            draggable="false"
                            style={{ userSelect: "none" }}
                          >
                            <img
                              src={product._source.product_data.IMAGE_URL_1}
                              className="img-responsive ImagechangeRelateddata"
                              alt=""
                              title=""
                              draggable="false"
                              style={{ userSelect: "none" }}
                            />
                          </a>
                          <div className="caption">
                          <p className="StyleId">{product._source.product_data.ITEM_CD} </p>
                            <p className="ProductPrice">${product.inner_hits.retailer_data.hits.hits[0]._source.Price_Retail}</p>
                            <p className="ProductDesc">
                              {product._source.product_data.SHORT_WEB_DESC}
                            </p>
                            
                          </div>
                        </li>
                        ))}
                      </ul>
                      <a
                        href="#"
                        className="jcarousel-control-prev inactive"
                        draggable="false"
                        data-jcarouselcontrol="true"
                        style={{ userSelect: "none" }}
                      >
                        <img
                          src="https://i.ashidiamonds.com/images/NewImages/carousel-arrow-left.png"
                          draggable="false"
                          style={{ userSelect: "none" }}
                        />
                      </a>
                      <a
                        href="#"
                        className="jcarousel-control-next"
                        draggable="false"
                        data-jcarouselcontrol="true"
                        style={{ userSelect: "none" }}
                      >
                        <img
                          src="https://i.ashidiamonds.com/images/NewImages/carousel-arrow-right.png"
                          draggable="false"
                          style={{ userSelect: "none" }}
                        />
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AddToWishlist;

