import { FieldValue } from "firebase/firestore";

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
  municipality: string;
  colonia: string;
}

export interface ShippingMethod {
  carrier: string;
  service: string;
  cost: number;
  estimatedDelivery: Date;
}

export interface PaymentInfo {
  method: "paypal" | "credit_card" | "cash";
  amount: number;
  transactionId: string;
  status: "pending" | "completed" | "failed";
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  payment: PaymentInfo;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  total: number;
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}
