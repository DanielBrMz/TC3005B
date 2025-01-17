import { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from "../types/products";
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useConfirmation } from "../hooks/useConfirmation";

type ProductFormProps = {
    product?: Product; // Changed to use Product type directly
    onSubmit: (product: Product) => void;
    onCancel: () => void;
};

const initialFormState: Omit<Product, 'id'> = {
    title: '',
    price: 0,
    description: '',
    category: '',
    image: '',
    stock: 0,
    rating: 0,
    createdAt: new Date()
};

export const ProductForm = ({ product, onSubmit, onCancel }: ProductFormProps) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialFormState);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [imagePreview, setImagePreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const isSubmittingRef = useRef(false);
    const { confirm, Confirmation } = useConfirmation();

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (formData.price <= 0) newErrors.price = 'Price must be positive';
        if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.image.trim()) newErrors.image = 'Image URL is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (product) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...productData } = product;
            setFormData(productData);
            setImagePreview(productData.image); // Set initial preview
        } else {
            setFormData(initialFormState);
            setImagePreview(''); // Clear preview for new products
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedFormData = {
            ...formData,
            [name]: name === 'price' || name === 'stock' || name === 'rating' ?
                parseFloat(value) || 0 : value,
        };
        setFormData(updatedFormData);
        // Update image preview immediately when image URL changes
        if (name === 'image') {
            setImagePreview(value || ''); // Set to empty string if value is falsy
        }
    };

    const handleAddProduct = useCallback(async () => {
        try {
            const docRef = await addDoc(collection(db, 'products'), {
                ...formData,
                createdAt: new Date()
            });
            const result = { ...formData, id: docRef.id };
            setImagePreview('');
            setFormData(initialFormState);
            onSubmit(result);
        } catch (error) {
            console.error('Error adding product:', error);
            setErrors({ submit: 'Failed to add product' });
        }
    }, [formData, onSubmit]);

    const handleUpdateProduct = useCallback(async () => {
        if (!product) return;
        try {
            await updateDoc(doc(db, 'products', product.id), formData);
            const result = { ...formData, id: product.id };
            onSubmit(result);
        } catch (error) {
            console.error('Error updating product:', error);
            setErrors({ submit: 'Failed to update product' });
        }
    }, [formData, product, onSubmit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmittingRef.current) return;
        if (!validateForm()) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        try {
            if (product) {
                // Show confirmation dialog for updates
                confirm({
                    title: 'Confirm Update',
                    message: 'Are you sure you want to update this product?',
                    confirmText: 'Update',
                    variant: 'warning',
                    onConfirm: handleUpdateProduct,
                });
            } else {
                // No confirmation needed for new products
                await handleAddProduct();
            }
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form ref={formRef} onSubmit={handleSubmit} className="product-form">
                {errors.submit && (
                    <div className="form-error">
                        {errors.submit}
                    </div>
                )}
                <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
                    <label htmlFor="title">Product Name</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                    />
                    {errors.title && <span className="error-message">{errors.title}</span>}
                </div>
                <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                    />
                    {errors.price && <span className="error-message">{errors.price}</span>}
                </div>
                <div className={`form-group ${errors.stock ? 'has-error' : ''}`}>
                    <label htmlFor="stock">Stock Quantity</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                    />
                    {errors.stock && <span className="error-message">{errors.stock}</span>}
                </div>
                <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Home">Home</option>
                        <option value="Beauty">Beauty</option>
                        <option value="Sports">Sports</option>
                    </select>
                    {errors.category && <span className="error-message">{errors.category}</span>}
                </div>
                <div className={`form-group ${errors.image ? 'has-error' : ''}`}>
                    <label htmlFor="image">Image URL</label>
                    <input
                        type="url"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                    />
                    {errors.image && <span className="error-message">{errors.image}</span>}
                    {/* Image preview section */}
                    {imagePreview ? (
                        <div className="image-preview-container">
                            <div>
                                <img
                                    src={imagePreview}
                                    alt="Product preview"
                                    className="image-preview"
                                    onError={() => setImagePreview('')}
                                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                                    // Clear preview if image fails to load
                                />
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="clear-image-button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, image: '' }));
                                        setImagePreview('');
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Remove Image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="image-preview-placeholder">
                            No image selected
                        </div>
                    )}
                </div>
                <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        disabled={isSubmitting}
                        required
                    />
                    {errors.description && <span className="error-message">{errors.description}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="rating">Rating</label>
                    <input
                        type="number"
                        id="rating"
                        name="rating"
                        min="0"
                        max="5"
                        step="0.1"
                        value={(formData.rating ?? 0).toString()}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cancel-button"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={product ? "edit-button" : "submit-button"}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="loading-indicator">Processing...</span>
                        ) : (
                            product ? 'Update Product' : 'Add Product'
                        )}
                    </button>
                </div>
            </form>
            <Confirmation />
        </>
    );
};