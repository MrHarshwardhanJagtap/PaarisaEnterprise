export enum UserRole {
  MANUFACTURER = 'MANUFACTURER',
  DISTRIBUTOR = 'DISTRIBUTOR'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  cost: number;
  stock: number;
  lastUpdated: string;
}

export interface OrderItem {
  bottleId: string;
  bottleName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  itemProfit: number;
}

export interface Order {
  id: string;
  fromId: string;
  toName: string;
  type: string;
  status: string;
  date: string;
  
  // New Multi-Item Fields
  items?: OrderItem[];
  totalAmount: number;
  totalProfit?: number; 

  // Legacy Fields (Optional for backward compatibility)
  bottleName?: string;
  quantity?: number;
  unitPrice?: number;
  profit?: number;
}

export interface LoginHistory {
  id: string;
  userId: string;
  deviceType: string;
  userAgent: string;
  timestamp: string;
}