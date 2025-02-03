

import React, { useState } from 'react';

interface CompareStripProps {
  products: string[];
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
}

export const CompareStrip: React.FC<CompareStripProps> = ({
  products,
  removeFromCompare,
  clearCompare,
}) => {
  const [isMinimized, setIsMinimized] = useState(false); // Track the state of the strip (minimized or maximized)

  // Function to minimize the strip
  const minimize = () => {
    setIsMinimized(true);
  };

  // Function to maximize the strip
  const maximize = () => {
    setIsMinimized(false);
  };

  return (
    <div className={`CompareStrip ${isMinimized ? 'minimized' : 'maximized'}`}>
      {/* Minimize/Maximize Strip */}
      <div className="CloseStrip">
        {isMinimized ? (
          <a href="javascript:void(0);" onClick={maximize}>
            <i className="fa fa-angle-double-up" aria-hidden="true"></i>
          </a>
        ) : (
          <a href="javascript:void(0);" onClick={minimize}>
            <i className="fa fa-angle-double-down" aria-hidden="true"></i>
          </a>
        )}
      </div>

      {/* Products List */}
      <div className={`container CompareBox ${isMinimized ? 'hidden' : ''}`}>
        {products.map((itemId) => (
          <div className="CompareProduct" key={itemId}>
            
            <img
              src={`https://i.jewelexchange.net/service/Images/${itemId}/Web/${itemId}_ANGVEW_ZOMRES.jpg`}
              className="img-responsive"
              alt={`Product ${itemId}`}
            />
            
            <p>{itemId}</p>
            
            <button
              className="remove-btn"
              onClick={() => removeFromCompare(itemId)}
            >
              x
            </button>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="CompareButton">
          <button className="btn btn-orange">Compare ({products.length})</button>
          <button className="btn Clearall" onClick={clearCompare}>
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareStrip;

