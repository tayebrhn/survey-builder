import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getCSRFToken } from "..";

interface User {
  id: number;
  username: string;
  is_superuser: boolean;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  // We only need the checker function
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from the Django endpoint we created above
    // Django Session cookies are sent automatically by the browser
    fetch(import.meta.env.VITE_SURVEY_API_USER, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()!,
      },
    })
      .then((res) => {
        if (res.status === 403 || res.status === 401) {
          // Session expired or not logged in
          window.location.href = ":8000/admin/login/";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUser(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);
  // Permission Logic
  const can = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.is_superuser) return true;
      return user.permissions.includes(permission);
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
