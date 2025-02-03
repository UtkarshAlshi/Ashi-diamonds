import React, { useEffect, useState } from "react";
import "./ItemModal.css";
import {
  fetchItemDetails,
  fetchQuotationData,
  fetchStockDetails,
} from "../../services/ashi-dotnet-service";

import { fetchRelatedProducts } from "../../services/filterService";

interface AddToQuotationProps {
  isQuotationOpen: boolean;
  onAddToQuotationClose: () => void;
  itemData: any; // Replace with proper type if you know the structure of itemData
}

const AddToQuotation: React.FC<AddToQuotationProps> = ({
  isQuotationOpen,
  onAddToQuotationClose,
  itemData,
}) => {
  //--set isOpen

  const [selectedValue, setSelectedValue] = useState("");
  const [stockLabel, setStockLabel] = useState("");
  const [itemDetails, setItemDetails] = useState<any>({});
  const [isAddToQuotationOpen, setIsAddToQuotationOpen] = useState(false);

  useEffect(() => {
    const backdropDiv = document.createElement("div");
    //set the id of backdropDiv
    backdropDiv.id = "itemModalId";
    backdropDiv.className = "modal-backdrop fade in";

    const fetchInitialQuotationData = async () => {
      let response = await fetchQuotationData();
      console.log(response);
    }

    if (isQuotationOpen) {
      document.body.appendChild(backdropDiv);
      //   let payload = {};
      //   if (itemData.dataArray) {
      //     payload = {
      //       ITEM_CD: itemData.dataArray[0].itemCD,
      //       RETAILER_ID: localStorage.getItem("JewelSoftId"),
      //     };
      //   } else {
      //     payload = {
      //       ITEM_CD: itemData._source.product_data.ITEM_ID,
      //       RETAILER_ID: localStorage.getItem("JewelSoftId"),
      //     };
      //   }
      // fetch item details
      fetchInitialQuotationData();
      //setSelectedValue("1");
    }

    return () => {
      if (document.body.contains(backdropDiv)) {
        document.body.removeChild(backdropDiv);
      }
    };
  }, [isQuotationOpen]);

  useEffect(() => {
    if (isQuotationOpen) {
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
  }, [isQuotationOpen]);

  if (!isQuotationOpen) {
    return null; // Don't render the modal if it's not open
  }

  return (
    isQuotationOpen && (
      <div
        className="modal fade bs-example-modal-lg in showDialog SalesQuotation SalesQuotationCon"
        role="document"
        id="SalesQuotation"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                onClick={onAddToQuotationClose}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
                <div className="col-sm-12 salesqpopup nopadding">
                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12 AddQuotationLeft nopadding_r">
                        <div className="AddQuotationSec">
                            <div className="QuotLeft-header">
                      <h3 className="QuotLeft-title">
                        Add Style to My Existing Sales Quotation{" "}
                        <a
                          className="popover-icon helpIcon"
                          role="button"
                          title=""
                          data-toggle="popover"
                          data-placement="top"
                          data-content="Click on the '+' icon to add selected style(s) to My Existing Sales Quotation."
                          data-original-title=""
                        >
                          <i className="fa fa-info-circle marginTop7"></i>
                        </a>
                      </h3>
                    </div>
                    <div className="QuotLeft-Body">
                      <div
                        className="SalesQListHead ng-scope"
                        ng-if="SalesQuotationArray.length > 1"
                      >
                        <div className="col-xs-6 sQPopHead1 col-sm-5 nopadding_r marginBottom10">
                          <strong>SQ Reference</strong>
                        </div>
                        <div className="col-xs-6 sQPopHead2 col-sm-3 nopadding_r marginBottom10">
                          <strong>SQ Update Date</strong>{" "}
                        </div>
                        <div className="col-xs-6 sQPopHead3 col-sm-4 marginBottom10 nopadding_r">
                          <strong>Total Qty</strong>
                        </div>
                        <div className="col-xs-6 sQPopHead4 col-sm-3 nopadding marginBottom10">
                          <strong>Total Amount</strong>{" "}
                        </div>
                      </div>
                      <ul
                        id="AddQuotationList"
                        className="Quotation-list-wraper ng-scope"
                        ng-if="SalesQuotationArray.length > 1"
                      >
                        <li>
                          <a
                            href="javascript:void(0);"
                            id="1119"
                            ng-if="prdid.Stylescount !=0"
                            ng-click="addQuotationItem(prdid.quotationid,SQItemid)"
                            className="ng-scope"
                          >
                            <div className="col-sm-6 col-md-5 col-xs-6 sQPopDetail1 nopadding_r  marginBottom10 ng-binding">
                              12345
                            </div>
                            <div className="col-sm-6 col-md-4 col-xs-6 sQPopDetail2 marginBottom10">
                              <span className="ng-binding">12/13/2024</span>
                            </div>

                            <div className="col-sm-6 col-md-4 col-xs-6 sQPopDetail3 marginBottom10">
                              <span className="ng-binding">3</span>
                            </div>

                            <div className="col-sm-6 col-md-4 col-xs-6 sQPopDetail4 nopadding marginBottom10">
                              <span className="ng-binding">$255</span>
                              <span className="sqplusicon">
                                <i className="fa-lg fa-regular fa-square-plus"></i>
                              </span>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12 AddQuotationLeft">
                    <div className="AddQuotationSec">
                        <div className="QuotLeft-header">
                            <h3 className="QuotLeft-title">
                                Add Style to My Last Sales Quotation
                            </h3>
                        </div>

                        <div className="QuotLeft-Body paddingTop10">
                            <div className="col-sm-12 nopadding QuotationListNo">
                                <div className="col-sm-4 nopadding SN1">
                                <div className="form-group update-ref">
                                    <label
                                    htmlFor="inputEmail"
                                    className="control-label col-xs-12 nopadding_l"
                                    >
                                    <strong>SQ Reference</strong>{" "}
                                    </label>
                                    <label
                                    htmlFor="inputEmail"
                                    id="quotationname"
                                    ng-model="quotnname"
                                    className="control-label col-xs-12 nopadding_l ng-pristine ng-untouched ng-valid"
                                    >
                                    NEW12345
                                    </label>
                                </div>
                                </div>
                                <div className="col-sm-4 nopadding SN2">
                                <div className="form-group update-ref">
                                    <label
                                    htmlFor="inputEmail"
                                    className="control-label col-xs-12 nopadding_l"
                                    >
                                    <strong>SQ Update Date</strong>
                                    </label>
                                    <label
                                    htmlFor="inputEmail"
                                    id="creationdate"
                                    ng-model="creatdate"
                                    className="control-label col-xs-12 nopadding_l ng-pristine ng-untouched ng-valid"
                                    >
                                    12/13/2024
                                    </label>
                                </div>
                                </div>
                                <div className="col-sm-4 nopadding SN3">
                                <div className="form-group update-ref">
                                    <label
                                    htmlFor="inputEmail"
                                    className="control-label col-xs-12 nopadding_l"
                                    >
                                    <strong>Total Qty</strong>{" "}
                                    </label>
                                    <label
                                    htmlFor="inputEmail"
                                    id="sqtotqty"
                                    ng-model="quotnno"
                                    className="control-label col-xs-12 nopadding_l ng-pristine ng-untouched ng-valid"
                                    >
                                    14
                                    </label>
                                </div>
                                </div>
                                <div className="col-sm-4 nopadding SN4">
                                <div className="form-group update-ref">
                                    <label
                                    htmlFor="inputEmail"
                                    className="control-label col-xs-12 nopadding_l"
                                    >
                                    <strong>Total Amount</strong>{" "}
                                    </label>
                                    <label
                                    htmlFor="inputEmail"
                                    id="sqtotamnt"
                                    ng-model="quotnno"
                                    className="control-label col-xs-12 nopadding_l ng-pristine ng-untouched ng-valid"
                                    >
                                    $61,234
                                    </label>
                                </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className=" col-xs-12 col-sm-12 marginTop10 text-center">
                                <a
                                    href="javascript:void(0)"
                                    id="btn_AddItemToLastQuotation"
                                    ng-click="addQuotationItem(SalesQuotationArray[0].quotationid,SQItemid)"
                                    className="btn-green userpagebtn"
                                >
                                    <img src="https://i.ashidiamonds.com/images/NewImages/PlusIcon.svg" />
                                    &nbsp; Add Style to My Last Quotation
                                </a>
                                <a
                                    href="javascript:void(0)"
                                    id="btn_AddListToLastQuotation"
                                    ng-click="addQuotationItem(SalesQuotationArray[0].quotationid,0)"
                                    className="btn-green userpagebtn"
                                    style={{ display: "none" }}
                                >
                                    <img src="https://i.ashidiamonds.com/images/NewImages/PlusIcon.svg" />
                                    &nbsp; Add Style to My Last Quotation
                                </a>
                                </div>
                            </div>
                            <div className="clearfix"></div>
                        </div>
                    </div>
                    <div className="AddQuotationSec">
                        <div className="QuotLeft-header">
                            <h3 className="QuotLeft-title">Create New Sales Quotation <a className="popover-icon helpIcon" role="button" title="" data-toggle="popover" data-placement="top" data-content="You can enter a Quotation Reference of your choice while creating a New Sales Quotation and adding the selected style(s)." data-original-title=""><i className="fa fa-info-circle marginTop7"></i></a></h3>
                        </div>
                        <div className="QuotLeft-Body paddingTop10">
                            <div className="form-group">
                                <div className="col-xs-12 col-sm-12 marginTop10 update-ref">
                                    <label htmlFor="Company" className="col-xs-12 col-sm-6 control-label nopadding_l marginTop5">Sales Quotation Reference</label>
                                <div className="col-xs-12 col-sm-6 nopadding">
                                    <input type="text" id="AddQuotation" style={{textTransform: "uppercase"}} ng-model="sqname" maxLength={15} className="form-control ng-pristine ng-untouched ng-valid ng-valid-maxlength" placeholder=""></input>
                                </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className=" col-sm-12 marginTop10 text-center">
                                <a href="javascript:void(0)" id="btn_AddToList" ng-click="addSalesQuotation(0,1,SQItemid)" className="btn-orange userpagebtn userpagebtn1">
                                    <img src="https://i.ashidiamonds.com/images/NewImages/PlusIcon.svg" />
                                    &nbsp; Create Quotation &amp; Add Style
                                </a>
                                <a href="javascript:void(0)" id="btn_AddToListMultiple" ng-click="addSalesQuotation(0,1,0)" className="btn-orange userpagebtn userpagebtn1" style={{display: "none"}}>
                                    <img src="https://i.ashidiamonds.com/images/NewImages/PlusIcon.svg" />
                                    &nbsp; Create Quotation &amp; Add Style
                                </a>
                                </div>
                            </div>
                            <div className="clearfix"></div>
                        </div>
                    </div>
                </div>
                </div>

                <div className="clearfix"></div>
                <div className="col-sm-12 salesqconfirm nopadding">
                    <div className="row nomargin">
                        <h2 className="SalesqconfirmHead">Item(s) Added to your SQ Reference <strong><span id="sqref"></span></strong> and Quotation # <strong><span id="sqcode"></span></strong></h2>
                        <div className="col-sm-12 nopadding MultiQTconfirm">
                  <div className="col-lg-3 col-md-3 col-sm-3 col-xs-12 marginTop15 mobTag767">
                     <div className="TagIcon text-center">
                        <img src="" id="sqflag" className="img-responsive" alt="" title="" role="presentation" data-uw-rm-alt="SRC"></img>
                     </div>
                    <img className="img-responsive img-center" id="sqImage" alt="" title="" src="" width="170" role="presentation" data-uw-rm-alt="SRC"></img>
                  </div>
                  <div className="col-lg-9 col-md-9 col-sm-9 col-xs-12 listPopupRight">
                     <h3 id="sqheading"></h3>
                     <p className="Conf_Short_Web_Desc" id="sqDescription"></p>
                     <div className="col-xs-12 col-sm-12 styleID nopadding">
                        <label className="control-label1 pull-left">Style #:&nbsp; </label>
                        <big><span id="sqItemcd"> </span></big>                                       
                     </div>
                     <div className="col-xs-12 col-sm-12 stockSize nopadding ng-scope">
                        <div className="col-xs-12 col-sm-12 shopprice nopadding ng-scope">
                           <label className="control-label1 pull-left">Price:&nbsp;</label>
                           <big><span id="sqPrice"></span></big>
                        </div>
                        <div className="col-xs-12 col-sm-12 styleID nopadding">
                           <label className="control-label1 pull-left">Qty:&nbsp;</label>
                           <big><span id="sqQty"></span></big>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="col-sm-12 salesqconfirmall nopadding marginTop30" style={{display: "none"}}>
                  <h4 className="text-success text-center" id="sqconfirmationwithQtyPL">
                     <span id="sqstylecnt"></span> Style(s) with total <span id="sqstyleqty"></span> Quantity have been successfully added to the Sales Quotation.
                  </h4>
                  <h4 className="text-success text-center" id="sqconfirmationwithoutQtyPL">
                     <span id="sqstylecnt1"></span> Style(s) have been successfully added to the Sales Quotation.
                  </h4>
               </div>
               <div className="clearfix"></div>
               <div className="col-xs-12 col-sm-6 marginTop30"><a href="javascript:void(0)" className="btn btn-default btn-block" data-dismiss="modal" aria-label="Close">CONTINUE BROWSING</a></div>
               <div className="col-xs-12 col-sm-6 marginTop30"><a id="plGotoSQ" href="https://www.ashidiamonds.com/SalesQuotation/UserwiseSalesQuotation.aspx" className="btn btn-orange btn-block">GO TO SALES QUOTATION</a></div>
               <div className="col-sm-12 relatedProductWraper relatedProductPopup nomargin" id="ReleatedProductSalesQuotationPopup" style={{opacity: 1}}></div>
            </div>
            <div className="clearfix"></div>
        </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AddToQuotation;
