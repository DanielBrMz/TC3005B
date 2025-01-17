import { Link } from 'react-router-dom';

type FilterSidebarProps = {
    currentCategory: string;
    className?: string;
};

const categories = [
    'Electronics',
    'Clothing',
    'Home',
    'Beauty',
    'Sports'
];

export const FilterSidebar = ({
                                  currentCategory,
                                  className
                              }: FilterSidebarProps) => {
    return (
        <aside className={`filter-sidebar ${className}`}>
            <h3>Categories</h3>
            <ul className="category-list">
                <li>
                    <Link
                        to="/products"
                        className={!currentCategory ? 'active' : ''}
                    >
                        All Products
                    </Link>
                </li>
                {categories.map(category => (
                    <li key={category}>
                        <Link
                            to={`/products?category=${encodeURIComponent(category)}`}
                            className={currentCategory === category ? 'active' : ''}
                        >
                            {category}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};