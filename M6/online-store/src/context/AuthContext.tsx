import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { getUserDisplayName } from "../services/authenticationService";
import { getUserRole } from "../services/authenticationService";
interface AuthContextType {
  user: User | null;
  role: string;
  loading: boolean;
  displayName: string | null;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "customer",
  loading: true,
  displayName: null,
});
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("customer");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userRole = await getUserRole(user.uid);
        setRole(userRole);
        const userDisplayName = await getUserDisplayName(user.uid);
        setDisplayName(userDisplayName);
      } else {
        setRole("customer");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  return (
    <AuthContext.Provider value={{ user, role, loading, displayName }}>
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
