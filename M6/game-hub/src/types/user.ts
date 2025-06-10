export interface SavedGames {
  played: number[];
  queued: number[];
  wishlist: number[];
}

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  photoURL?: string;
  savedGames?: SavedGames;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
}
