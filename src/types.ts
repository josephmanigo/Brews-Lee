export type Category = 'Matcha Drinks' | 'Coffee' | 'Pastries';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  fullName: string;
  mobile: string;
  streetAddress: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'On the way' | 'Delivered' | 'Cancelled';
  paymentMethod: 'COD' | 'GCash';
  deliveryType: 'Delivery' | 'Pickup';
  address?: Address;
}

export interface User {
  id: string;
  name: string;
  email: string;
  orders: Order[];
  savedAddresses: Address[];
  voucherCode?: string;
  voucherUsed?: boolean;
}
