import { Item } from '../types';

const items: Item[] = [
  { id: 1, name: 'Item 1', price: 100, image: '/path/to/image1.jpg', isPopular: true, isDiscounted: false, attributes: ['14kt', 'yellow-gold'] },
  { id: 2, name: 'Item 2', price: 200, image: '/path/to/image2.jpg', isPopular: false, isDiscounted: true, attributes: ['18kt', 'white-gold'] },
];

export default items;
