import React, { createContext, useContext, useState, useEffect } from "react";

// Backend API base URL
const API_BASE_URL = "http://localhost:5000/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  profile?: any;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("bindisa-token");
    const savedUser = localStorage.getItem("bindisa-user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Optionally verify token with backend
        verifyToken(token);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("bindisa-user");
        localStorage.removeItem("bindisa-token");
      }
    }
    setIsLoading(false);
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Token invalid");
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem("bindisa-user", JSON.stringify(data.data.user));
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token, user } = data.data;
        setUser(user);
        localStorage.setItem("bindisa-token", token);
        localStorage.setItem("bindisa-user", JSON.stringify(user));
        return true;
      } else {
        console.error("Login failed:", data.error?.message);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token, user } = data.data;
        setUser(user);
        localStorage.setItem("bindisa-token", token);
        localStorage.setItem("bindisa-user", JSON.stringify(user));
        return true;
      } else {
        console.error("Registration failed:", data.error?.message);
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Optional: Call logout endpoint to invalidate token on server
      const token = localStorage.getItem("bindisa-token");
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("bindisa-user");
      localStorage.removeItem("bindisa-token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
