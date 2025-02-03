export interface Item {
    id: string;
    inner_hits: any;
    _source: any;
   
    price: number
  }
  
  export interface Filters {
    [key: string]: boolean;
  }
  
