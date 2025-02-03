import React, { useState } from "react";
import { Item } from "../types";
import ItemModal from "./modals/ItemModal";
import AddToWishlist from "./modals/AddToWishlist";
import AddToQuotation from "./modals/AddToQuotation";
import CompareStrip from "./modals/CompareStrip";
import { useCompare } from "/Users/utkarshalshi/Desktop/product-list/src/context/CompareContext.tsx";


const ItemCard: React.FC<Item> = (item: any) => {
  
  const [visible, setVisible] = useState<{ [key: string]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddToWishlistOpen, setIsAddToWishlistOpen] = useState(false);
  const [isAddToQuotationOpen, setIsAddToQuotationOpen] = useState(false);
  const [compareProducts, setCompareProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCompareStripVisible, setCompareStripVisible] = useState(false); // Visibility state for CompareStrip
  const [products, setProducts] = useState<string[]>([]); // Manage the list of products to compare


  const { addToCompare } = useCompare();

  // Function to handle adding a product to compare
  // const addToCompare = (itemId: string) => {
  //   if (!products.includes(itemId)) {
  //     setProducts([...products, itemId]);
  //     setCompareStripVisible(true); // Show CompareStrip
  //   }
  // };

  // Function to remove a product from compare
  // const removeFromCompare = (itemId: string) => {
  //   const updatedProducts = products.filter((id) => id !== itemId);
  //   setProducts(updatedProducts);
  //   if (updatedProducts.length === 0) setCompareStripVisible(false); // Hide CompareStrip if no products left
  // };

  // Function to clear all compared products
  // const clearCompare = () => {
  //   setProducts([]);
  //   setCompareStripVisible(false); // Hide CompareStrip
  // };


  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenWishlist = () => {
    console.log("handleOpenWishlist triggered");
    setIsAddToWishlistOpen(true);
    console.log("isAddToWishlistOpen updated:", isAddToWishlistOpen);
  };
  

  const handleCloseWishlist = () => {
    setIsAddToWishlistOpen(false);
  };

  const handleCloseQuotation = () => {
    setIsAddToQuotationOpen(false);
  };

  const handleOpenQuotation = () => {
    setIsAddToQuotationOpen(true);
  };

  const showhide = (id: string) => () => {
    // hide short_web_desc when hover on product img  
    document.getElementById(`ShortDecListView_${id}`)?.classList.add("hidden");
    setVisible((prevState) => ({
      ...prevState,
      [`ProductImg_${id}`]: true,
    }));
  };

  const hideprevious = (id: string) => () => {
    document.getElementById(`ShortDecListView_${id}`)?.classList.remove("hidden");
    setVisible((prevState) => ({
      ...prevState,
      [`ProductImg_${id}`]: false,
    }));
  };


  function handleCheckboxChange(e: any): void {
    let itemId = e.target.value;
    if (e.target.checked) {
      // set the value of selectqty_itemcard in itemcard to 1
      const itemCardSelectQty = document.getElementById(`Q${itemId}`);
      if (itemCardSelectQty) {
        (itemCardSelectQty as HTMLSelectElement).value = "1";
      }
    }
    else{
      // set the value of selectqty_itemcard in itemcard to ?
      const itemCardSelectQty = document.getElementById(`Q${itemId}`);
      if (itemCardSelectQty) {
        (itemCardSelectQty as HTMLSelectElement).value = "?";
      }
    }
  }

  function getSelectValue(itemId: any) {
    const selectElement = document.getElementById(`Q${itemId}`) as HTMLSelectElement;
    return selectElement ? Number(selectElement.value) : 0;
  };



  return (
    <>
    <div
      id="ProductsBox1"
      className="col-sm-6 col-md-4 col-lg-3 ProductsBox ng-scope"
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

      {/* <div className="CompareProduct" id="CompareProductdiv">
        <div className="checkbox checkbox-primary">
          <a title="Compare" href="javascript:void(0);" id="A19429">
            <span className="icon_wishlist WishListIcon DIcon Comp01"></span>
          </a>
        </div>
      </div> */}

      {/* <div className="CompareProduct" id="CompareProductdiv">
      <div className="checkbox checkbox-primary">
        <a
          title="Compare"
          href="javascript:void(0);"
        >
          <span className="icon_wishlist WishListIcon DIcon Comp01"></span>
        </a>
      </div>
    </div> */}


 <div>
     
      <div className="CompareProduct" id="CompareProductdiv">
        <div className="checkbox checkbox-primary">
          <a
            title="Compare"
            href="javascript:void(0);"
            onClick={() => addToCompare(item._source.product_data.ITEM_ID)} 
          >
            <span className="icon_wishlist WishListIcon DIcon Comp01"></span>
          </a>
        </div>
      </div>

     
      {/* {isCompareStripVisible && (
        <CompareStrip
          products={products}
          removeFromCompare={removeFromCompare}
          clearCompare={clearCompare}
        />
      )} */}
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
            href={`https://www.ashidiamonds.com/Product/ProductDetails.aspx?ITEM_ID=19429&amp;ItemType=&amp;PCategoryId=5&amp;CategoryId=11,5&amp;PCategoryName=Bridals`}
          >
            <img
              src={item._source.product_data.IMAGE_URL_1}
              alt={item._source.product_data.ITEM_NAME}
              className="img-responsive  ImagechangeListdata ImagechangeListdata_19429"
              id="ImagechangeListdata_1"
            />
          </a>
        </div>

        <div
          className="ProductThumbs"
          id="ProductThumbs_1"
          style={{
            display: visible[`ProductImg_${item._source.product_data.ITEM_ID}`]
              ? "block"
              : "none",
            padding: "10px",
          }}
        >
          <a href="javascript:void(0)">
            <img
              src="https://i.jewelexchange.net/service/Images/1/3/30411FGWG/Web/30411FGWG_ANGVEW_MEDRES.jpg"
              className="img-responsive thumbsListPagedata"
            />
          </a>
          <a
            href="javascript:void(0)"
            ng-repeat="Listimages in obj.pictures | orderBy:picorder |filter : '!youtube' "
            className="ng-scope"
          >
            <img
              src="https://i.jewelexchange.net/service/Images/1/3/30411FGWG/Web/30411FGWG_SGTVEW_MEDRES.jpg"
              className="img-responsive thumbsListPagedata"
            />
          </a>
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
      <div className="ProductPrice text-center">
        <span className="text-center">
          {/* format below price in 1,234.56 format */}
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
        id="SelectQty_1"
        style={{ display: "block" }}
      >
        <div id={`ShortDecListView_${item._source.product_data.ITEM_ID}`} className="ProductShortDec">
          <p className="ShortDecListView L ng-binding">
            {item._source.product_data.SHORT_WEB_DESC.length > 45
              ? item._source.product_data.SHORT_WEB_DESC.substring(0, 45) +
                "..."
              : item._source.product_data.SHORT_WEB_DESC}
          </p>
        </div>
      </div>
      <div className="SelectQty" id="SelectQty_5">
        <div className="checkbox checkbox-primary col-xs-5 col-sm-5 pull-left text-right nopadding_r">
          <input
            type="checkbox"
            id={`${item._source.product_data.ITEM_ID}`}
            value={`${item._source.product_data.ITEM_ID}`}
            onChange={(e) =>  handleCheckboxChange(e)}
              
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
                id={`Q${item._source.product_data.ITEM_ID}`}
                onChange={() => {
                  // Re-render to reflect the dynamic checkbox checked state
                  const checkbox:any = document.getElementById(item._source.product_data.ITEM_ID);
                  if (checkbox) checkbox.checked = getSelectValue(item._source.product_data.ITEM_ID) > 0;
                }}
              >
                <option value="? undefined:undefined ?"></option>
                
                
                <option value="1" className="volunteer">1</option>
                <option value="2" className="volunteer1">2</option>
                <option value="3" className="volunteer2">3</option>
                <option value="4" className="volunteer3">4</option>
                <option value="5" className="volunteer4">5</option>
                <option value="6" className="volunteer5">6</option>
                <option value="7" className="volunteer6">7</option>
                <option value="8" className="volunteer7">8</option>
                <option value="9" className="volunteer8">9</option>

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
        <span >
          <a
            href="javascript:void(0)"
            title="Add to Cart"
            onClick={() => handleOpenModal()}
            
          >
            <i className="fa fa-cart-shopping item-card-icons"></i>
          </a>
        </span>

       
          <a
            title="Add to Wish List"
            href="javascript:void(0)"
            onClick={() => handleOpenWishlist()}
          >
            <i className="fa fa-heart  item-card-icons"></i>
            <span className="ng-scope"></span>
          </a>
         


        {/* <a
          href="javascript:void(0)"
          id="ctl00_ContentPlaceHolder1_btnSaleQuotation"
          title="Add to Quotation"
          className="SalesQuotation ng-pristine ng-untouched ng-valid"
          onClick={() => handleOpenQuotation()} 
          data-target="#SalesQuotation"
        >
          <i className="fa fa-file-invoice  item-card-icons"></i>
          <span className="icon_wishlist WishListIcon DIcon SalesQIconList"></span>
        </a> */}

        <a
          ng-href="https://www.ashidiamonds.com/Product/ProductDetails.aspx?ITEM_ID=19435&amp;ItemType=&amp;PCategoryId=5&amp;CategoryId=11,5&amp;PCategoryName=Bridals"
          title="Product Detail"
          href="https://www.ashidiamonds.com/Product/ProductDetails.aspx?ITEM_ID=19435&amp;ItemType=&amp;PCategoryId=5&amp;CategoryId=11,5&amp;PCategoryName=Bridals"
        >
         <i className="fa fa-receipt item-card-icons"></i>
        </a>
      </div>
      
      

    </div>
    <ItemModal 
    isOpen={isModalOpen} 
    onClose={handleCloseModal} 
    itemData={item} 
    />

  <AddToWishlist 
  isWishlistOpen={isAddToWishlistOpen} 
  onWishlistClose={handleCloseWishlist} 
  itemData={item} 
    />


    <AddToQuotation 
    isQuotationOpen={isAddToQuotationOpen} 
    onAddToQuotationClose={handleCloseQuotation} 
    itemData={item} 
    />
    </>
  );
};

 export default ItemCard;




function removeFromCompare(itemId: any) {
  throw new Error("Function not implemented.");
}


