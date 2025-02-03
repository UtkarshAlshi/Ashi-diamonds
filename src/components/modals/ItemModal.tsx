import React, { useEffect, useState } from "react";
import "./ItemModal.css";
import {
  fetchItemDetails,
  fetchStockDetails,
} from "../../services/ashi-dotnet-service";
import AddToCart from "./AddToCart";
import AddToWishlist from "./AddToWishlist";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemData: any; // Replace with proper type if you know the structure of itemData
}

const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, itemData }) => {
  //--set isOpen

  const [selectedValue, setSelectedValue] = useState("");
  const [stockLabel, setStockLabel] = useState("");
  const [itemDetails, setItemDetails] = useState<any>({});
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const [isAddToWishlistOpen, setIsAddToWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  const handleOpenWishlist = () => {
    setIsAddToWishlistOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
    onClose();
  };

  const handleCloseWishlist = () => {
    setIsAddToWishlistOpen(false);
  };

  useEffect(() => {

    setIsAddToCartOpen(false);
    const backdropDiv = document.createElement("div");
    //set the id of backdropDiv
    backdropDiv.id = "itemModalId";
    backdropDiv.className = "modal-backdrop fade in";

    const fetchItemData = async (payload: any) => {
      let itemDetails = await fetchItemDetails(payload);
      setItemDetails(itemDetails);
      setStockMessage(stockLabel);
    };

    if (isOpen) {
      document.body.appendChild(backdropDiv);
      let payload = {
        ITEM_CD: itemData._source.product_data.ITEM_ID,
        RETAILER_ID: localStorage.getItem("JewelSoftId"),
      };
      // fetch item details
      fetchItemData(payload);
      setSelectedValue("1");
    }

    return () => {
      if (document.body.contains(backdropDiv)) {
        document.body.removeChild(backdropDiv);
      }
    };
  }, [isOpen]);

  const setStockMessage = (message: string) => {
    let stockElement = document.getElementById("stockLabelId");
    if (stockElement) {
     // stockElement.innerHTML = message;
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

  

  if (!isOpen) {
    return null; // Don't render the modal if it's not open
  }

  const handleAddToCartClick = () => {
    // Close current modal and open Add To Cart modal
    setIsAddToCartOpen(true);
    if (isAddToCartOpen) {
      onClose();
    }
  };

  return (
    itemDetails && itemDetails.dataArray && itemDetails.dataArray.length > 0 && <div
      className="modal fade bs-example-modal-lg in showDialog"
      role="document"
      id="ShoppingBag"
    >
      <div className="modal-dialog modal-lg">
      <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" onClick={onClose}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12 nopadding">
              <div className="ShopbagThum">
                <ul>
                  <li
                    
                    className="ng-scope"
                  >
                    <img

                      src={itemDetails.dataArray[0].IMAGE_URL_1}
                      className=""
                      onMouseOver={() => {
                        const shopBagImg = document.querySelector('.ShopbagFullImg img:last-child');
                        if (shopBagImg) {
                          (shopBagImg as HTMLImageElement).src = itemDetails.dataArray[0].IMAGE_URL_1;
                        }
                      }}
                      alt=""
                      title=""
                    />
                  </li>
                  <li>
                    <img
                      src={itemDetails.dataArray[0].IMAGE_URL_2}
                      className=""
                      onMouseOver={() => {
                        const shopBagImg = document.querySelector('.ShopbagFullImg img:last-child');
                        if (shopBagImg) {
                          (shopBagImg as HTMLImageElement).src = itemDetails.dataArray[0].IMAGE_URL_2;
                        }
                      }}
                      alt=""
                      title=""
                    />
                  </li>
                  <li>
                    <img
                      src={itemDetails.dataArray[0].IMAGE_URL_3}
                      className=""
                      onMouseOver={() => {
                        const shopBagImg = document.querySelector('.ShopbagFullImg img:last-child');
                        if (shopBagImg) {
                          (shopBagImg as HTMLImageElement).src = itemDetails.dataArray[0].IMAGE_URL_3;
                        }
                      }}
                      alt=""
                      title=""
                    />
                  </li>
                  <li>
                    <img
                      src={itemDetails.dataArray[0].IMAGE_URL_4}
                      className=""
                      onMouseOver={() => {
                        const shopBagImg = document.querySelector('.ShopbagFullImg img:last-child');
                        if (shopBagImg) {
                          (shopBagImg as HTMLImageElement).src = itemDetails.dataArray[0].IMAGE_URL_4;
                        }
                      }}
                      alt=""
                      title=""
                    />
                  </li>
                </ul>
              </div>

              <div className="ShopbagFullImg">
                <div className="TagIcon text-center ng-scope">
                  <img
                    src="https://i.ashidiamonds.com/images/NewImages/Icon_bestseller.png"
                    className="img-responsive"
                    alt=""
                    title=""
                  />
                </div>

                <img
                  className="img-responsive"
                  alt=""
                  title=""

                  role="presentation"
                  data-uw-rm-alt="SRC"
                  src={itemDetails.dataArray[0].IMAGE_URL_1}
                />
              </div>

              <div
                className="ShopbagFullImg video"
                id="video"
                style={{ display: "none" }}
              >
                <embed
                  id="video1"
                  src=""
                  type="application/x-shockwave-flash"
                  width="100%"
                  height="100%"
                  title="Adobe Flash Player"
                />
                <div className="clearfix"></div>
              </div>
            </div>

            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12 listPopupRight nopadding_r">
              <div className="col-sm-12 nopadding">
                <div>
                  <h3 className="ng-binding">
                    {itemDetails.dataArray[0].itemName}
                  </h3>
                  <p className="Short_Web_Desc ng-binding">
                    {itemDetails.dataArray[0].shortDesc}
                  </p>
                  <span className="AvaTestM DetPopMes hidden-lg visible-md visible-sm visible-xs ng-scope" id="InventoryCommentM">
                    <pre className="ng-binding">In Stock, Ready to Ship</pre>
                  </span>
                  <div className="bdr"></div>

                  <div className="col-xs-12 col-sm-12 styleID LPMargin nopadding">
                    <label className="control-label pull-left style">
                      Style #:{" "}
                    </label>{" "}
                    <big className="ng-binding">
                      {itemDetails.dataArray[0].itemCD}{" "}
                    </big>
                  </div>
                  
                    {/* <!-- ngIf: StockSize != 0.0 && StockSize != 0 --><label class="control-label pull-left ng-scope" ng-if="StockSize != 0.0 &amp;&amp; StockSize != 0">Stock Size: </label><!-- end ngIf: StockSize != 0.0 && StockSize != 0 --> */}
                    {itemDetails.dataArray[0].stockSize && 
                      <div className="col-xs-12 col-sm-12 LPMargin flyerID nopadding">
                        <label
                          className="control-label pull-left ng-scope"
                      >
                        Stock Size:{" "}
                      </label>

                      <big
                        
                        className="ng-binding ng-scope"
                      >
                        {itemDetails.dataArray[0].stockSize?.toString() || ''}
                      </big>
                      <span
                        className="AvaTest ListPopMes hidden-xs hidden-sm hidden-md visible-lg ng-scope"
                        id="InventoryComment1"
                      >
                        <pre className="ng-binding" id="stockLabelId">
                          {stockLabel}
                        </pre>
                      </span>
                    </div>
                    }
                  

                  {/* <!-- ngIf: Sellprice != SalePrice && SalePrice != '' --> */}

                  <div
                    className="control-label pull-left LPMargin price nopadding ng-scope"
                    ng-if="Sellprice==SalePrice &amp;&amp; Sellprice !=''"
                  >
                    <label className="control-label pull-left price">
                      Price:&nbsp;
                    </label>
                    {
                      <big
                        className="price ng-binding ng-scope"
                        id="sellprice"
                        ng-if="Sellprice!=0"
                      >
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(
                          itemData.inner_hits.retailer_data.hits.hits[0]._source.Price_Retail
                        )}
                      </big>
                    }
                    {/* <!-- ngIf: Sellprice==0 --> */}
                  </div>

                  <div className="col-xs-12 col-sm-12 shopqty LPQM nopadding">
                    <label className="control-label pull-left">
                      Qty:&nbsp;
                    </label>

                    <div
                      className="input-group DropDownIcon tenplusbox"
                      id="qtycontrol"
                    >
                      <select
                        name="visit"
                        id="visit"
                        className="visit form-control"
                        onChange={(e) => setSelectedValue(e.target.value)}
                        
                      >
                        <option
                          value="1"
                          ng-selected="true"
                          className="volunteer"
                        >
                          1
                        </option>
                        <option value="2" className="volunteer1">
                          2
                        </option>
                        <option value="3" className="volunteer2">
                          3
                        </option>
                        <option value="4" className="volunteer3">
                          4
                        </option>
                        <option value="5" className="volunteer4">
                          5
                        </option>
                        <option value="6" className="volunteer5">
                          6
                        </option>
                        <option value="7" className="volunteer6">
                          7
                        </option>
                        <option value="8" className="volunteer7">
                          8
                        </option>
                        <option value="9" className="volunteer8">
                          9
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-xs-12 col-sm-12 flyerID nopadding marginTop10 hidden">
                    <label className="control-label pull-left"></label>
                    <div className="input-group ng-binding">
                      <span className="DisTxt ng-binding">
                        *This Style is Rhodium Plated.
                      </span>
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-sm-12 nopadding AddMT">
                    <div className="col-xs-12 col-sm-12  nopadding">
                      <p className="col-sm-6 nopadding marginTop6">
                        <a
                          href="javascript:void(0);"
                          className="btn-orange"
                          id="AddToCartShopping"
                          
                          onClick={handleAddToCartClick}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src="https://i.ashidiamonds.com/images/NewImages/CartIcon.png"
                            title=""
                            
                          />
                          Add to Cart
                        </a>
                      </p>

                      <a
                        href="https://www.ashidiamonds.com/Product/ProductDetails.aspx?ITEM_ID=19429&amp;ItemType=&amp;PCategoryId=5&amp;CategoryId=11&amp;PCategoryName=Bridals"
                        className="btn-MoreDetail pull-right"
                      >
                        More Details <i className="fa fa-long-arrow-right"></i>
                      </a>
                      <div className="nopadding right col-sm-6 nopadding LPopup">
                        <div className="col-xs-12 col-sm-12 DetailBoxIcons nopadding pull-right">
                          <div className="col-xs-12 col-sm-12 WishMailPrint nopadding">
                            <ul className="WishMailPrintIcons  pull-right">
                              <li>
                                {/* <!-- ngIf: (IsInWishList != null && IsInWishList != 0 ); --> */}
                              </li>
                              <li>
                                <a
                                  id="POP19429"
                                  title="Add to  Wish List"
                                  className="ng-scope"
                                  onClick={handleOpenWishlist}
                                >
                                  <i className="fa fa-lg fa-heart"></i>
                                </a>
                              </li>

                              <li>
                                <a
                                  title="Email"
                                  href="javascript:void(0);"
                                  data-toggle="modal"
                                  ng-click="openEmailToFriendPopup(itemid);"
                                >
                                  <span className="icon_wishlist WishListIcon DIcon Email01 Email02"></span>
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="clearfix"></div>
                </div>
              </div>
            </div>

            <hr></hr>

            <div
              className="col-lg-12 col-md-12 col-sm-12 col-xs-12 Prod_Detail wow fadeInUp"
              style={{ visibility: "visible", animationName: "fadeInUp" }}
            >
              <div className="col-sm-4 col-md-3 col-xs-12  nopadding_l ng-scope">
                <ul className="Prod_Des">
                  <li>
                    <h1>Metal Info</h1>
                  </li>
                  {itemDetails.dataArray[0].metalColor && <li
                    
                    className="ng-binding ng-scope"
                  >
                    Metal Color: {itemDetails.dataArray[0].metalColor}
                  </li>
                  }
                  {itemDetails.dataArray[0].metalWt && <li
                    ng-if="METAL_WEIGHT_DISPLAY!='' &amp;&amp; METAL_WEIGHT_DISPLAY != null"
                    className="ng-binding ng-scope"
                  >
                    Metal Wt Gms (Appx.): {itemDetails.dataArray[0].metalWt}
                  </li>}
                </ul>
              </div>

              <div className="col-sm-4 col-md-3 col-xs-12  nopadding_l ng-scope">
                <ul className="Prod_Des">
                  
                  <li>
                    <h1>Center Stone Info</h1>
                  </li>
                  
                  {itemDetails.dataArray[0].stoneType && <li
                    ng-if="CTST_TYPE!='' &amp;&amp; CTST_TYPE != null"
                    className="ng-binding ng-scope"
                  >
                    Stone Type: {itemDetails.dataArray[0].stoneType }
                  </li>}
                  
                  {itemDetails.dataArray[0].stoneShap && <li
                    ng-if="CTST_SHAPE!='' &amp;&amp; CTST_SHAPE != null"
                    className="ng-binding ng-scope"
                  >
                    Stone Shape: {itemDetails.dataArray[0].stoneShap}
                  </li>}
                 {itemDetails.dataArray[0].diamondWt &&  <li
                    ng-if="CTST_WEIGHT_DISPLAY!='' &amp;&amp; CTST_WEIGHT_DISPLAY != null"
                    className="ng-binding ng-scope"
                  >
                    Stone Ct/MM Size (Appx.): {itemDetails.dataArray[0].diamondWt }
                  </li>}
                  {itemDetails.dataArray[0].stoneColor && <li
                  
                    className="ng-binding ng-scope"
                  >
                    Stone Color: {itemDetails.dataArray[0].stoneColor }
                  </li>}
                  { itemDetails.dataArray[0].stoneClrty && <li
                    className="ng-binding ng-scope"
                  >
                      Stone Clarity: {itemDetails.dataArray[0].stoneClrty}
                  </li>}
                </ul>
              </div>

              <div className="col-sm-4 col-md-3 col-xs-12  nopadding_l ng-scope">
                <ul className="Prod_Des">
                  <li>
                    <h1>Side Diamond Info</h1>
                  </li>
                  {/* <!-- ngIf: SDM_NUMBER!='' && SDM_NUMBER != null --><li ng-if="SDM_NUMBER!='' &amp;&amp; SDM_NUMBER != null" class="ng-binding ng-scope"># of Diamonds (Appx.): 2</li><!-- end ngIf: SDM_NUMBER!='' && SDM_NUMBER != null --> */}
                  {/* <!-- ngIf: SDM_SHAPE!='' && SDM_SHAPE != null --><li ng-if="SDM_SHAPE!='' &amp;&amp; SDM_SHAPE != null" class="ng-binding ng-scope">Diamond Shape: round</li><!-- end ngIf: SDM_SHAPE!='' && SDM_SHAPE != null --> */}
                  {/* <!-- ngIf: SDM_WEIGHT_DISPLAY!='' && SDM_WEIGHT_DISPLAY != null --><li ng-if="SDM_WEIGHT_DISPLAY!='' &amp;&amp; SDM_WEIGHT_DISPLAY != null" class="ng-binding ng-scope">Diamond Ct Wt (Appx.): 0.50 ct</li><!-- end ngIf: SDM_WEIGHT_DISPLAY!='' && SDM_WEIGHT_DISPLAY != null --> */}
                  {itemDetails.diamondColor && <li
                    
                    className="ng-binding ng-scope"
                  >
                    Diamond Color: {itemDetails.dataArray[0].diamondColor}
                  </li>}
                  {itemDetails.dataArray[0].diamoneClrity && <li
                    className="ng-binding ng-scope"
                  >
                    Diamond Clarity: {itemDetails.dataArray[0].diamoneClrity}
                  </li>}
                </ul>
              </div>
              <div className="col-sm-4 col-md-3 col-xs-12  nopadding_l ng-scope">
                <ul className="Prod_Des">
                  <li>
                    <h1>Other Info</h1>
                  </li>
                  {
                    itemDetails.dataArray[0].totalDiamondWt && <li className="ng-binding ng-scope">Total Diamond Wt (Appx.): {itemDetails.dataArray[0].totalDiamondWt}</li>
                  }
                  {
                    itemDetails.dataArray[0].chainType && <li className="ng-binding ng-scope">Chain Type: {itemDetails.dataArray[0].chainType}</li>
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddToCart
        isCartOpen={isAddToCartOpen}
        onCartClose={handleCloseCart}
        itemData={itemDetails}
      />

    <AddToWishlist
    
        isWishlistOpen={isAddToWishlistOpen}
        onWishlistClose={handleCloseWishlist}
        itemData={itemDetails}
      />
    </div>
  );
};

export default ItemModal;
