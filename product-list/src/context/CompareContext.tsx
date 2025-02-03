import React, { createContext, useContext, useState } from "react";

interface CompareContextType {
  products: string[];
  addToCompare: (itemId: string) => void;
  removeFromCompare: (itemId: string) => void;
  clearCompare: () => void;
  isCompareStripVisible: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<string[]>([]);
  const [isCompareStripVisible, setCompareStripVisible] = useState(false);

  const addToCompare = (itemId: string) => {
    if (!products.includes(itemId)) {
      setProducts((prev) => [...prev, itemId]);
      setCompareStripVisible(true);
    }
  };

  const removeFromCompare = (itemId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((id) => id !== itemId);
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
