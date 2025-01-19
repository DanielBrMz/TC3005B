import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  collection,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Order } from "../types/order.ts";

export const createOrder = async (
  userId: string,
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    // Validate required fields
    if (!userId) throw new Error("User ID is required");
    if (!orderData.items || orderData.items.length === 0)
      throw new Error("Order must contain items");
    if (!orderData.payment?.method)
      throw new Error("Payment method is required");
    if (orderData.total === undefined || orderData.total === null)
      throw new Error("Total amount is required");

    // Create document reference
    const userOrdersRef = collection(db, "users", userId, "orders");
    const newOrderRef = doc(userOrdersRef);
    const orderId = newOrderRef.id;

    // Build order object with defaults
    console.log(orderData);
    const order: Order = {
      id: orderId,
      userId: userId,
      customerName: orderData.customerName || "",
      items: orderData.items.map((item) => ({
        // Spread original item properties first
        ...item,
        // Then override with defaults if needed
        productId: item.productId,
        title: item.title || "Unnamed Product",
        quantity: item.quantity || 1,
        price: item.price || 0,
        image: item.image || "",
        // Add other item properties with defaults if needed
      })),
      shippingAddress: {
        street: orderData.shippingAddress.street || "",
        city: orderData.shippingAddress.city || "",
        state: orderData.shippingAddress.state || "",
        postalCode: orderData.shippingAddress.postalCode || "",
        fullName: orderData.shippingAddress.fullName || "",
        municipality: orderData.shippingAddress.municipality || "",
        colonia: orderData.shippingAddress.colonia || "",
      },
      shippingMethod: {
        // Spread original shipping method properties first
        ...orderData.shippingMethod,
        // Then override with defaults if needed
        carrier: orderData.shippingMethod.carrier || "",
        service: orderData.shippingMethod.service || "",
        cost: orderData.shippingMethod.cost || 0,
        estimatedDelivery: orderData.shippingMethod.estimatedDelivery || "",
      },
      payment: {
        method: orderData.payment.method,
        amount: orderData.payment.amount || orderData.total || 0,
        status: "pending",
        transactionId: "",
      },
      subtotal: orderData.subtotal || orderData.total || 0,
      total: orderData.total || 0,
      status: "processing",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newOrderRef, order);
    return orderId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error(
      `Order creation failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const updateOrderPaymentStatus = async (
  userId: string,
  orderId: string,
  transactionId: string,
  status: "completed" | "failed"
) => {
  try {
    // Correct document reference path: 'users/{userId}/orders/{orderId}'
    const orderRef = doc(db, "users", userId, "orders", orderId);
    await updateDoc(orderRef, {
      "payment.status": status,
      "payment.transactionId": transactionId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating order payment status:", error);
    throw error;
  }
};

export const getOrderById = async (
  userId: string,
  orderId: string
): Promise<Order | null> => {
  try {
    const orderRef = doc(db, "users", userId, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      return orderSnap.data() as Order;
    }
    return null;
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
};
