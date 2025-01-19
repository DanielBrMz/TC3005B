export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}
export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}
export const createNewCart = (userId: string): Cart => ({
  userId,
  items: [],
  updatedAt: new Date(),
});
