import { Product } from '../types/products.ts'
import { Link } from "react-router-dom";
import { DeleteButton } from "./DeleteButton";

type ProductTableProps = {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;  // Changed from number to string
};

export const ProductTable = ({ products, onEdit, onDelete }: ProductTableProps) => {
    const formatNumber = (value: number | undefined, decimals = 2) => {
        if (value === undefined || isNaN(value)) return 'N/A';
        return value.toFixed(decimals);
    };

    return (
        <div className="table-container">
            <table className="product-table">
                <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Category</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {products.map(product => (
                    <tr key={product.id}>
                        <td>
                            <Link to={`/product/${product.id}`}>
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="product-thumbnail"
                                />
                            </Link>
                        </td>
                        <td>
                            <Link to={`/product/${product.id}`}>
                                {product.title}
                            </Link>
                        </td>
                        <td>${formatNumber(product.price)}</td>
                        <td>{formatNumber(product.stock, 0)}</td>
                        <td>{formatNumber(product.rating, 1)}</td>
                        <td>{product.category}</td>
                        <td className="actions">
                            <button
                                onClick={() => onEdit(product)}
                                className="edit-button"
                            >
                                Edit
                            </button>
                            <DeleteButton
                                onDelete={() => onDelete(product.id as string)}  // Updated to pass the id as string
                                className="delete-button"
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};