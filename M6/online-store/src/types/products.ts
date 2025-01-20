export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  weight?: number;
  rating?: number;
  createdAt?: Date;
}

export interface AdminContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
}

export interface ProductsResponse {
  data: Product[];
  totalPages: number;
  currentPage: number;
}
