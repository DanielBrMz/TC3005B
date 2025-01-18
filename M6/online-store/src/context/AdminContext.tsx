import { createContext, useContext, useState } from 'react';
import {Product,AdminContextType} from '../types/products.ts'

const AdminContext = createContext<AdminContextType>({
    products: [],
    addProduct: () => {},
    updateProduct: () => {},
    deleteProduct: () => {},
});

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);

    const addProduct = (product: Omit<Product, 'id'>) => {
        const newProduct = {
            ...product,
            id: Date.now(),
        };
        setProducts(prev => [...prev, newProduct]);
    };

    const updateProduct = (product: Product) => {
        setProducts(prev =>
            prev.map(p => (p.id === product.id ? product : p))
        );
    };

    const deleteProduct = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    return (
        <AdminContext.Provider
            value={{
                products,
                addProduct,
                updateProduct,
                deleteProduct,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useProducts = () => useContext(AdminContext);