import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SearchBar } from "../components/SearchBar";
import { FilterSidebar } from "../components/FilterSidebar";
import { Pagination } from "../components/Pagination";
import { Product } from "../types/products";
import { fetchProducts } from "../services/productService";

export const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get query parameters
  const category = searchParams.get("category") || "";
  const searchQuery = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const { data, totalPages } = await fetchProducts({
          page,
          category,
          query: searchQuery,
          source: "products",
        });
        setProducts(data);
        setTotalPages(totalPages);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, category, searchQuery]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1 className="page-title">
          {category ? `${category} Products` : "All Products"}
        </h1>

        <div className="products-header">
          <SearchBar
            value={searchQuery}
            onChange={(e) => {
              const newQuery = e.target.value;
              const params = new URLSearchParams(searchParams);
              if (newQuery) {
                params.set("q", newQuery);
              } else {
                params.delete("q");
              }
              window.history.replaceState(null, "", `?${params.toString()}`);
            }}
          />
          <button
            className="mobile-filter-button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="products-layout">
          <div
            className={`filter-container ${
              showMobileFilters ? "mobile-visible" : ""
            }`}
          >
            <button
              className="close-mobile-filters"
              onClick={() => setShowMobileFilters(false)}
            >
              &times;
            </button>
            <FilterSidebar
              currentCategory={category}
              className="desktop-filters"
            />
          </div>

          <main className="products-grid-container">
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : products.length > 0 ? (
              <>
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  maxVisible={10}
                />
              </>
            ) : (
              <div className="no-results">
                <p>No products found matching your criteria.</p>
                <button
                  onClick={() => (window.location.href = "/products")}
                  className="reset-filters"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
