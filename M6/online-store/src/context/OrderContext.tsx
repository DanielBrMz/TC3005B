import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { Order } from "../types/order";
import { useAuth } from "./AuthContext";

type OrderContextType = {
  orders: Order[];
  loading: boolean;
  error: string | null;
};

const OrderContext = createContext<OrderContextType>({
  orders: [],
  loading: true,
  error: null,
});

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const ordersRef = collection(db, "users", user.uid, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to Date
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Order[];
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  return (
    <OrderContext.Provider value={{ orders, loading, error }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
