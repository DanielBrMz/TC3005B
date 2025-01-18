import { useState, useEffect } from 'react';
import { ProductForm } from '../components/ProductForm';
import { ProductTable } from '../components/ProductTable';
import { Product } from '../types/products';
import { db } from '../services/firebaseConfig';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

export const Admin = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Fetch products from Firestore
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const productsCollection = collection(db, 'products');
            const snapshot = await getDocs(productsCollection);
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productsData);
        } catch (err) {
            setError('Failed to fetch products');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Add product to Firestore
    const addProduct = async (product: Product) => {
        try {
            setLoading(true);
            setProducts([...products, product]);
            return product;
        } catch (err) {
            setError('Failed to add product');
            console.error('Error adding product:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update product in Firestore
    const updateProduct = async (product: Product) => {
        try {
            setLoading(true);
            setProducts(products.map(p =>
                p.id === product.id ? product : p
            ));
        } catch (err) {
            setError('Failed to update product');
            console.error('Error updating product:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete product from Firestore
    const deleteProduct = async (productId: string) => {
        try {
            setLoading(true);
            await deleteDoc(doc(db, 'products', productId));
            setProducts(products.filter(p => p.id !== productId));
        } catch (err) {
            setError('Failed to delete product');
            console.error('Error deleting product:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (productData: Omit<Product, 'id'>) => {
        try {
            if (editingProduct) {
                await updateProduct({ ...productData, id: editingProduct.id });
            } else {
                await addProduct(productData as Product);
            }
            setEditingProduct(null);
        } catch (err) {
            // Error is already handled in individual functions
            console.log(err);
        }
    };

    if (loading && products.length === 0) {
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className="admin-page">
            <div className="container">
                <h1>Admin Dashboard</h1>
                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={() => setError(null)}>Dismiss</button>
                    </div>
                )}

                <div className="admin-layout">
                    <div className="admin-form">
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <ProductForm
                            product={editingProduct as Product}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setEditingProduct(null)}
                        />
                    </div>

                    <div className="admin-table">
                        <h2>Product Inventory</h2>
                        {products.length === 0 ? (
                            <p>No products found</p>
                        ) : (
                            <ProductTable
                                products={products}
                                onEdit={setEditingProduct}
                                onDelete={deleteProduct}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};