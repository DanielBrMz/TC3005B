import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Cart, CartItem, createNewCart } from '../types/cart';
import { getCart, addItemToCart, updateCartItemQuantity, removeItemFromCart, clearCart } from '../services/cartService';
import { useAuth } from './AuthContext';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig.ts";

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    clearUserCart: () => Promise<void>;
    cartItemCount: number;
}

const CartContext = createContext<CartContextType>({
    cart: null,
    loading: true,
    addToCart: async () => {},
    updateItemQuantity: async () => {},
    removeFromCart: async () => {},
    clearUserCart: async () => {},
    cartItemCount: 0
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    
    const ensureCartExists = useCallback(async (userId: string): Promise<Cart> => {
        const existingCart = await getCart(userId);
        if (!existingCart) {
            // Create new cart if it doesn't exist
            const newCart = createNewCart(userId);
            await setDoc(doc(db, 'carts', userId), newCart);
            return newCart;
        }
        return existingCart;
    }, []);
    
    const fetchCart = useCallback(async () => {
        if (!user) {
            setCart(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const userCart = await ensureCartExists(user.uid);
            setCart(userCart);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCart(user ? createNewCart(user.uid) : null);
        } finally {
            setLoading(false);
        }
    }, [user, ensureCartExists]);
    
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);
    
    const removeFromCart = useCallback(async (productId: string) => {
        if (!user) throw new Error('User must be logged in to remove from cart');
        try {
            setLoading(true);
            // Ensure cart exists before removing
            await ensureCartExists(user.uid);
            await removeItemFromCart(user.uid, productId);
            await fetchCart();
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [user, fetchCart, ensureCartExists]);
    
    const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
        if (!user) throw new Error('User must be logged in to add to cart');
        try {
            setLoading(true);
            // Ensure cart exists before adding item
            await ensureCartExists(user.uid);
            const newItem: CartItem = {
                productId,
                quantity,
                addedAt: new Date()
            };
            await addItemToCart(user.uid, newItem);
            await fetchCart();
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [user, fetchCart, ensureCartExists]);
    
    const updateItemQuantity = useCallback(async (productId: string, quantity: number) => {
        if (!user) throw new Error('User must be logged in to update cart');
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }
        try {
            setLoading(true);
            // Ensure cart exists before updating
            await ensureCartExists(user.uid);
            await updateCartItemQuantity(user.uid, productId, quantity);
            await fetchCart();
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [user, fetchCart, ensureCartExists, removeFromCart]);
    
    const clearUserCart = useCallback(async () => {
        if (!user) throw new Error('User must be logged in to clear cart');
        try {
            setLoading(true);
            // Ensure cart exists before clearing
            await ensureCartExists(user.uid);
            await clearCart(user.uid);
            await fetchCart();
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [user, fetchCart, ensureCartExists]);
    
    const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
    
    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            updateItemQuantity,
            removeFromCart,
            clearUserCart,
            cartItemCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);