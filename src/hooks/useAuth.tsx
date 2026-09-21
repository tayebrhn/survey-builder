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
    const checkAuth = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_SURVEY_API_USER, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken() || "",
          },
        });

        if (response.status === 401 || response.status === 403) {
          redirectToLogin();
          return;
        }

        const text = await response.text();

        if (text.includes("login")) {
          redirectToLogin();
          return;
        }

        const data = JSON.parse(text);
        setUser(data);
      } catch (err) {
        console.error("Auth error:", err);
        redirectToLogin(); // optional fallback
      } finally {
        setIsLoading(false);
      }
    };

    const redirectToLogin = () => {
      const loginUrl = import.meta.env.VITE_ADMIN_LOGIN_URL || `${window.location.origin}/admin/login/`;
      if (window.location.href.startsWith(loginUrl)) return;
      const next = encodeURIComponent(window.location.href);
      window.location.href = `${loginUrl}?next=${next}`;
    };

    checkAuth();
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

export const useSurveyPermissions = () => {
  const { can } = useAuth();

  return {
    canEdit: can("eeusurvey_app.change_survey"),
    canDelete: can("eeusurvey_app.delete_survey"),
    canView: can("eeusurvey_app.view_survey"),
    canCreate: can("eeusurvey_app.add_survey"),
  };
};
