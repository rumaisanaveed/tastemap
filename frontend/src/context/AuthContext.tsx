import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  loginUser as loginUserApi,
  registerUser,
  verifyEmail as verifyEmailApi,
  logoutUser as logoutUserApi,
  getCurrentUser,
} from "@/api/authApi";
import axios from "axios";
import { LoginResponse, SignupResponse } from "@/types/auth";

export interface User {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  createdAt?: string;
}

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginResponse) => Promise<void>;
  signup: (userData: SignupResponse) => Promise<unknown>;
  verifyEmail: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        setUser(response.user);
      } catch(error) {
        setUser(null);
        if (
          axios.isAxiosError(error) &&
          [401, 403, 404].includes(error.response?.status ?? 0)
        ) {
          localStorage.removeItem("token");
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginResponse) => {
    const response = await loginUserApi(credentials);

    localStorage.setItem("token", response.token);

    setUser({
      ...response.user,
      isEmailVerified: true,
    });
  };

  const signup = async (userData: SignupResponse) => {
    const response = await registerUser(userData);
    return response;
  };

  const verifyEmail = useCallback(async (token: string) => {
    const response = await verifyEmailApi(token);

    localStorage.setItem("token", response.token);

    setUser({
      ...response.user,
      isEmailVerified: true,
    });
  }, []);

  const logout = async () => {
    try {
      await logoutUserApi();
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        verifyEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
