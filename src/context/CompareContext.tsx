// import React, { createContext, useContext, useState } from "react";

// export interface CompareProduct {
//     itemId: string;
//     imageUrl: string;
//   }
  
//   interface CompareContextType {
//     products: CompareProduct[];
//     addToCompare: (itemId: string, imageUrl: string) => void;
//     removeFromCompare: (itemId: string) => void;
//     clearCompare: () => void;
//     isCompareStripVisible: boolean;
//   }
  

// const CompareContext = createContext<CompareContextType | undefined>(undefined);

// export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     type CompareProduct = { itemId: string; imageUrl: string };
//     const [products, setProducts] = useState<CompareProduct[]>([]);
//       const [isCompareStripVisible, setCompareStripVisible] = useState(false);

//       const addToCompare = (itemId: string, imageUrl: string) => {
//         if (!products.some(product => product.itemId === itemId)) {
//           setProducts(prev => {
//             const updatedProducts = [...prev, { itemId, imageUrl }];
//             console.log("Updated Products after setting state:", updatedProducts); // ✅ Debug log
//             return updatedProducts;
//           });
//           setCompareStripVisible(true);
//         }
//       };

//       const removeFromCompare = (itemId: string) => {
//         setProducts((prev: CompareProduct[]) => {
//           const updated = prev.filter((product) => product.itemId !== itemId);
//           if (updated.length === 0) setCompareStripVisible(false);
//           return updated;
//         });
//       };
      
  

//   const clearCompare = () => {
//     setProducts([]);
//     setCompareStripVisible(false);
//   };

//   return (
// <CompareContext.Provider value={{ products, addToCompare, removeFromCompare, clearCompare, isCompareStripVisible } as CompareContextType}>
// {children}
//     </CompareContext.Provider>
//   );
// };

// export const useCompare = () => {
//   const context = useContext(CompareContext);
//   if (!context) {
//     throw new Error("useCompare must be used within a CompareProvider");
//   }
//   return context;
// };



import React, { createContext, useContext, useState } from "react";

export interface CompareProduct {
    itemId: string;
    imageUrl: string;
}

interface CompareContextType {
    products: CompareProduct[];
    addToCompare: (itemId: string, imageUrl: string) => void;
    removeFromCompare: (itemId: string) => void;
    clearCompare: () => void;
    isCompareStripVisible: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<CompareProduct[]>([]);
    const [isCompareStripVisible, setCompareStripVisible] = useState(false);

    const addToCompare = (itemId: string, imageUrl: string) => {
        if (!products.some(product => product.itemId === itemId)) {
          setProducts(prev => {
            const updatedProducts = [...prev, { itemId, imageUrl }];
            console.log("Updated Products after setting state:", updatedProducts); // ✅ Debug log
            return updatedProducts;
          });
          setCompareStripVisible(true);
        }
      };      

    const removeFromCompare = (itemId: string) => {
        setProducts(prev => {
            const updated = prev.filter(product => product.itemId !== itemId);
            if (updated.length === 0) setCompareStripVisible(false);
            return updated;
        });
    };

    const clearCompare = () => {
        setProducts([]);
        setCompareStripVisible(false);
    };

    return (
        <CompareContext.Provider value={{ products, addToCompare, removeFromCompare, clearCompare, isCompareStripVisible }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error("useCompare must be used within a CompareProvider");
    }
    return context;
};
