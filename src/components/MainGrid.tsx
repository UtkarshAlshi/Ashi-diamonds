// import React from "react";
// import ItemCard from "./ItemCard";
// import ItemCardList from "./ItemCardList";
// //import ItemCard from './ItemCard';
// //import { Item } from '../types';

// interface MainGridProps {
//   items: any[];
//   addToCompare: (itemId: string) => void;
// }


// const MainGrid: React.FC<MainGridProps> = ({ items,addToCompare}) => (
  
//     <>
//       <div id="product-grid-view" className="AllProducts">
//         {items.map((item, index) => (
//             <ItemCard key={index} {...item} />
//         ))}

//       </div>

//       <div key="list" id="product-list-view" className="col-sm-12 AllProducts nopadding ProgramsProducts NoGridBor">
//         {items.map((item, index) => (
//             <ItemCardList key={index} {...item} />
//         ))}

//       </div>

//     </>


// );

// export default MainGrid;


import React from "react";
import ItemCard from "./ItemCard";

interface MainGridProps {
  items: any[];
  addToCompare: (itemId: string, imageUrl: string) => void;
}

const MainGrid: React.FC<MainGridProps> = ({ items, addToCompare }) => (
  <div id="product-grid-view" className="AllProducts">
    {items.map((item, index) => (
      <ItemCard key={index} {...item} addToCompare={addToCompare} />
    ))}
  </div>
);

export default MainGrid;
