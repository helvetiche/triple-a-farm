"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { getCurrentUserData, UserData } from "@/lib/client-auth";

interface AuthUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      if (!isMounted) {
        return;
      }

      // Debounce auth checks - only call if more than 1 second has passed since last check
      const now = Date.now();
      if (now - lastAuthCheck < 1000) {
        return;
      }

      setLastAuthCheck(now);
      setLoading(true);

      try {
        const { user: currentUser, profile } = await getCurrentUserData();

        if (!isMounted) {
          return;
        }

        setUser(currentUser);
        setUserData(profile);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.error("Error fetching user data:", error);
        setUser(null);
        setUserData(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [pathname, lastAuthCheck]);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
