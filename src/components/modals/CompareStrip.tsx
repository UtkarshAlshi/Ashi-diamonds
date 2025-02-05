

// import React, { useState } from 'react';
// import { CompareProduct } from '/Users/utkarshalshi/Desktop/product-list/src/context/CompareContext.tsx';
// interface CompareStripProps {
//   products: CompareProduct[];
//   removeFromCompare: (itemId: string) => void;
//   clearCompare: () => void;
// }


// export const CompareStrip: React.FC<CompareStripProps> = ({
//   products,
//   removeFromCompare,
//   clearCompare,
// }) => {
//   const [isMinimized, setIsMinimized] = useState(false); // Track the state of the strip (minimized or maximized)

//   // Function to minimize the strip
//   const minimize = () => {
//     setIsMinimized(true);
//   };

//   // Function to maximize the strip
//   const maximize = () => {
//     setIsMinimized(false);
//   };
//   console.log("CompareStrip received products:", products);

//   return (
//     <div className={`CompareStrip ${isMinimized ? 'minimized' : 'maximized'}`}>
//       {/* Minimize/Maximize Strip */}
//       <div className="CloseStrip">
//         {isMinimized ? (
//           <a href="javascript:void(0);" onClick={maximize}>
//             <i className="fa fa-angle-double-up" aria-hidden="true"></i>
//           </a>
//         ) : (
//           <a href="javascript:void(0);" onClick={minimize}>
//             <i className="fa fa-angle-double-down" aria-hidden="true"></i>
//           </a>
//         )}
//       </div>

//       {/* Products List */}
//       <div className={`container CompareBox ${isMinimized ? 'hidden' : ''}`}>
//       {products.map((product) => (
//   <div className="CompareProduct" key={product.itemId}>
//     <img src={product.imageUrl} width="100" height="100" className="img-responsive" alt={`Product ${product.itemId}`} onError={(e) => (e.currentTarget.src = "http://images.pexels.com/photos/674010/pexels-photo-674010.jpeg")} />
//     <p>{product.itemId}</p>
//     <button className="remove-btn" onClick={() => removeFromCompare(product.itemId)}>x</button>
//   </div>
// ))}




//         {/* Action Buttons */}
//         <div className="CompareButton">
//           <button className="btn btn-orange">Compare ({products.length})</button>
//           <button className="btn Clearall" onClick={clearCompare}>
//             Clear All
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CompareStrip;



import React, { useState } from 'react';
import { CompareProduct } from '/Users/utkarshalshi/Desktop/product-list/src/context/CompareContext.tsx';

interface CompareStripProps {
  products: CompareProduct[];
  removeFromCompare: (itemId: string) => void;
  clearCompare: () => void;
}

export const CompareStrip: React.FC<CompareStripProps> = ({ products, removeFromCompare, clearCompare }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const minimize = () => setIsMinimized(true);
  const maximize = () => setIsMinimized(false);

  return (
    <div className={`CompareStrip ${isMinimized ? 'minimized' : 'maximized'}`}>
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

      <div className={`container CompareBox ${isMinimized ? 'hidden' : ''}`}>
        {products.map(product => (
          <div className="CompareProduct" key={product.itemId}>
            <img
              src={product.imageUrl}
              className="img-responsive"
              alt={`Product ${product.itemId}`}
              style={{ maxWidth: '100%', height: 'auto' }}
              onError={(e) => (e.currentTarget.src = "http://images.pexels.com/photos/674010/pexels-photo-674010.jpeg")}
            />
            <p>{product.itemId}</p>
            <button className="remove-btn" onClick={() => removeFromCompare(product.itemId)}>x</button>
          </div>
        ))}

        <div className="CompareButton">
          <button className="btn btn-orange">Compare ({products.length})</button>
          <button className="btn Clearall" onClick={clearCompare}>Clear All</button>
        </div>
      </div>
    </div>
  );
};

export default CompareStrip;
