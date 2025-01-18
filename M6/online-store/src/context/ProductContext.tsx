import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Product } from "../types/products";
import { db } from "../services/firebaseConfig.ts";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}
const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true,
  error: null,
  getProductById: () => undefined,
  refreshProducts: async () => {},
});
export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const productsCollection = collection(db, "products");
      const snapshot = await getDocs(productsCollection);
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);
  // Real-time updates
  useEffect(() => {
    const productsCollection = collection(db, "products");
    const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
      const updatedProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(updatedProducts);
    });
    return () => unsubscribe();
  }, []);
  const getProductById = useCallback(
    (id: string) => {
      return products.find((product) => product.id === id);
    },
    [products]
  );
  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        getProductById,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => useContext(ProductContext);
