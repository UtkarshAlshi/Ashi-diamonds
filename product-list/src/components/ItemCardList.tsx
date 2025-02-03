import React, { useState } from "react";
import { Item } from "../types";
import CompareStrip from "./modals/CompareStrip";
import ItemCard from "./ItemCard";
import items from "../data/items";

interface ItemCardProps extends Item {
  productId: string;
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  isInCompare: boolean;
}

const ItemCardList: React.FC<ItemCardProps> = (item: any) => {
  const [visible, setVisible] = useState<{ [key: string]: boolean }>({});
  const [compareProducts, setCompareProducts] = useState<string[]>([]);
  const [isCompareStripVisible, setCompareStripVisible] = useState(false);


  const showhide = (id: string) => () => {
    // hide short_web_desc when hover on product img
    document.getElementById(`ShortDecListView_${id}`)?.classList.add("hidden");
    setVisible((prevState) => ({
      ...prevState,
      [`ProductImg_${id}`]: true,
    }));
  };

  const hideprevious = (id: string) => () => {
    document
      .getElementById(`ShortDecListView_${id}`)
      ?.classList.remove("hidden");
    setVisible((prevState) => ({
      ...prevState,
      [`ProductImg_${id}`]: false,
    }));
  };

  
  return (
    <div
      className="col-sm-6 col-md-4 col-lg-3 ProductsBox ng-scope"
      id="ProductsBox1"
    >
      <div
        className="TagIcon text-center ng-scope"
        ng-if="obj.isnewitem ==0 &amp;&amp; obj.istopselleritem !=0 &amp;&amp; obj.isoverstockitem ==0"
      >
        <img
          src="https://i.ashidiamonds.com/images/NewImages/Icon_bestseller.png"
          className="img-responsive"
          alt=""
          title=""
        />
      </div>

      <div className="CompareProduct" id="CompareProductdiv">
        <div className="checkbox checkbox-primary">
          <a
            title="Compare"
            href="javascript:void(0);"
            id="A19429"
            ng-model="active.winner"
            ng-click="addCompareProducts(obj,active)"
            className="ng-pristine ng-untouched ng-valid"
          >
            <span className="icon_wishlist WishListIcon DIcon Comp01"></span>
          </a>
        </div>
      </div>      


      <div
        className="ProductImg"
        id="ProductImg_1"
        onMouseOver={showhide("1")}
        onMouseOut={hideprevious("1")}
      >
        <div>
          <a
            id={item._source.product_data.ITEM_ID}
            href="https://www.ashidiamonds.com/Product/ProductDetails.aspx?ITEM_ID=19429&amp;ItemType=&amp;PCategoryId=5&amp;CategoryId=11,5&amp;PCategoryName=Bridals"
          >
            <img
              className="img-responsive  ImagechangeListdata ImagechangeListdata_19429"
              ng-model="Productlistimage"
              title=""
              src={item._source.product_data.IMAGE_URL_1}
              alt={item._source.product_data.ITEM_NAME}
              id="ImagechangeListdata_1"
            />
          </a>
          <div
            className="ProductThumbs ListViewAVThumb"
            id="ProductThumbs_2"
            style={{ display: "block" }}
          >
            <a
              href="javascript:void(0)"
              ng-repeat="Listimages in obj.pictures | orderBy:picorder |filter : '!youtube' "
              className="ng-scope"
            >
              <img
                src={item._source.product_data.IMAGE_URL_1}
                alt={item._source.product_data.ITEM_NAME}
                className="img-responsive thumbsListPagedata"
                id="ImagechangeListdata_1"
              />


            </a>
            <a
              href="javascript:void(0)"
              ng-repeat="Listimages in obj.pictures | orderBy:picorder |filter : '!youtube' "
              className="ng-scope"
            >
              <img
                src={item._source.product_data.IMAGE_URL_2}
                alt={item._source.product_data.ITEM_NAME}
                className="img-responsive thumbsListPagedata"
                id="ImagechangeListdata_1"
              />
            </a>
            <a
              href="javascript:void(0)"
              ng-repeat="Listimages in obj.pictures | orderBy:picorder |filter : '!youtube' "
              className="ng-scope"
            >
              <img
                src={item._source.product_data.IMAGE_URL_3}
                alt={item._source.product_data.ITEM_NAME}
                className="img-responsive thumbsListPagedata"
                id="ImagechangeListdata_1"
              />
            </a>
            <a
              href="javascript:void(0)"
              ng-repeat="Listimages in obj.pictures | orderBy:picorder |filter : '!youtube' "
              className="ng-scope"
            >
              <img
                src={item._source.product_data.IMAGE_URL_4}
                alt={item._source.product_data.ITEM_NAME}
                className="img-responsive thumbsListPagedata"
                id="ImagechangeListdata_1"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="ProductName">
        <p className="text-center">
          <span className="hidden-xs">Style #:</span>
          <span id="SQCD19429" className="ng-binding">
            {item._source.product_data.ITEM_CD}
          </span>
        </p>
      </div>

      <div className="ProductPrice text-center ng-scope" id="SQPRICE2220">
        <span className="text-center ng-binding ng-scope">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(
            item.inner_hits.retailer_data.hits.hits[0]._source.Price_Retail
          )}
        </span>
      </div>

      <div
        className="SelectQty marginBottom0"
        id="SelectQty_2"
        style={{ display: "block" }}
      >
        <div className="ProductShortDec">
          <p id="SQDESC220" style={{ display: "none" }} className="ng-binding">
            {item._source.product_data.ITEM_NAME}
          </p>

          <p className="ShortDecListView" style={{ display: "none" }}>
            {item._source.product_data.SHORT_WEB_DESC}
          </p>
          <p className="ShortDecListView">
            {item._source.product_data.SHORT_WEB_DESC}
          </p>
        </div>
      </div>

      <div className="SelectQty" id="SelectQty_5">
        <div className="checkbox checkbox-primary col-xs-5 col-sm-5 pull-left text-right nopadding_r">
          <input
            type="checkbox"
            ng-model="obj.selected"
            ng-change="optionToggled()"
            ng-init="optionToggled()"
            id="19435"
            value="19435"
            ng-checked="selection.indexOf(obj) > -1"
            ng-click="toggleSelection(Quantity,obj,obj.selected)"
            className="ng-pristine ng-untouched ng-valid"
          />

          <label htmlFor="19435">Select </label>
        </div>
        <div className="col-xs-6 col-sm-6 pull-left productQty nopadding_r nopadding_l">
          <label
            className="control-label col-xs-4 col-sm-4 nopadding"
            htmlFor="qty"
          >
            Qty:
          </label>

          <div className="col-xs-8 col-sm-8 nopadding_l ListQty">
            <div className="input-group DropDownIcon tenplusbox">
              <select
                className="form-control ng-pristine ng-untouched ng-valid"
                name="Q19435"
                id="Q19435"
                ng-change="updateQty(obj,'Q19435')"
                ng-model="Quantity"
                ng-focus="onFocusUpdateQty(obj,'Q19435')"
              >
                <option value="? undefined:undefined ?"></option>

                <option value="1" className="volunteer">
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

                {item.inner_hits.retailer_data.hits.hits[0]._source
                  .Price_Retail < 500 && (
                  <option value="10" className="volunteer9 ng-scope">
                    10 +
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="ProductIcons">
        <span>
          <a
            href="javascript:void(0)"
            title="Add to Cart"
            ng-click="ListShoppingPopupFunction(obj.productid);"
            data-toggle="modal"
            data-target="#ShoppingBag"
          >
            <i className="fa fa-cart-shopping item-card-icons"></i>
          </a>
        </span>

        <span ng-if="!onloadUserRoleAddToWishList()" className="ng-scope">
          <a
            title="Add to Wish List"
            id="W19435"
            href="javascript:void(0)"
            ng-click="ListWishlistPopupFunction(obj.productid,obj.shortdesc,obj.price,obj.itemcd,obj.pictures[0].pictureurl,obj.isnewitem, obj.istopselleritem,obj.isoverstockitem)"
          >
            <i className="fa fa-heart  item-card-icons"></i>
          </a>
        </span>

        <a
          href="javascript:void(0)"
          id="ctl00_ContentPlaceHolder1_btnSaleQuotation"
          title="Add to Quotation"
          ng-model="itemid"
          data-id="{{obj.productid}}"
          ng-click="ListQuotationPopupFunction(obj.productid, obj.isnewitem, obj.istopselleritem,obj.isoverstockitem);"
          data-toggle="modal"
          className="SalesQuotation ng-pristine ng-untouched ng-valid"
          data-target="#SalesQuotation"
        >
          <i className="fa fa-file-invoice  item-card-icons"></i>
          <span className="icon_wishlist WishListIcon DIcon SalesQIconList"></span>
        </a>

        <a
          ng-href="https://www.ashidiamonds.com/Product/ProductDetails.aspx?ITEM_ID=19435&amp;ItemType=&amp;PCategoryId=5&amp;CategoryId=11,5&amp;PCategoryName=Bridals"
          title="Product Detail"
          href="https://www.ashidiamonds.com/Product/ProductDetails.aspx?ITEM_ID=19435&amp;ItemType=&amp;PCategoryId=5&amp;CategoryId=11,5&amp;PCategoryName=Bridals"
        >
          <i className="fa fa-receipt item-card-icons"></i>
        </a>
      </div>
    </div>
  );
};

export default ItemCardList;


