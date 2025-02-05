import React from "react";
import { useCompare } from "/Users/utkarshalshi/Desktop/product-list/src/context/CompareContext.tsx";
import CompareStrip  from "/Users/utkarshalshi/Desktop/product-list/src/components/modals/CompareStrip.tsx";  // Import CompareStrip component

const CompareStripWrapper: React.FC = () => {
  // Access CompareContext values using useCompare
  const { products, removeFromCompare, clearCompare, isCompareStripVisible } = useCompare();

  return (
    <>
      {isCompareStripVisible && (
        <CompareStrip
          products={products} // This is now coming from the context, no need to pass as prop
          removeFromCompare={removeFromCompare}
          clearCompare={clearCompare}
        />
      )}
    </>
  );
};

export default CompareStripWrapper;
