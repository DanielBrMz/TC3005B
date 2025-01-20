export interface StoreUser {
  uid: string;
  email: string;
  role: "customer"; // default role
  displayName: string;
  createdAt: Date;
}
