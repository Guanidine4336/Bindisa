import React, { createContext, useContext, useState, useEffect } from "react";

// Backend API base URL
const API_BASE_URL = "http://localhost:5000/api";

// Check if backend is available
let backendAvailable = true;

const checkBackendAvailability = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn("Backend not available, using fallback mode");
    return false;
  }
};

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
      // Only verify with backend if it's available
      backendAvailable = await checkBackendAvailability();

      if (backendAvailable) {
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
      }
      // If backend not available, keep existing user from localStorage
    } catch (error) {
      console.error("Token verification failed:", error);
      // Only logout if backend is available but token is invalid
      if (backendAvailable) {
        logout();
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if backend is available
      backendAvailable = await checkBackendAvailability();

      if (backendAvailable) {
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
      } else {
        // Fallback mode - simulate authentication
        console.log("Using fallback authentication mode");
        if (email && password) {
          const mockUser: User = {
            id: "demo-" + Date.now(),
            name:
              email
                .split("@")[0]
                .replace(/[^a-zA-Z]/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()) || "Demo User",
            email: email,
            phone: "+91 9876543210",
            role: "farmer",
            isEmailVerified: false,
            isPhoneVerified: false,
          };
          setUser(mockUser);
          localStorage.setItem("bindisa-user", JSON.stringify(mockUser));
          localStorage.setItem("bindisa-token", "demo-token-" + Date.now());
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      // Fallback on any error
      if (email && password) {
        const mockUser: User = {
          id: "demo-" + Date.now(),
          name:
            email
              .split("@")[0]
              .replace(/[^a-zA-Z]/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()) || "Demo User",
          email: email,
          phone: "+91 9876543210",
          role: "farmer",
          isEmailVerified: false,
          isPhoneVerified: false,
        };
        setUser(mockUser);
        localStorage.setItem("bindisa-user", JSON.stringify(mockUser));
        localStorage.setItem("bindisa-token", "demo-token-" + Date.now());
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if backend is available
      backendAvailable = await checkBackendAvailability();

      if (backendAvailable) {
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
      } else {
        // Fallback mode - simulate registration
        console.log("Using fallback registration mode");
        const mockUser: User = {
          id: "demo-" + Date.now(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: "farmer",
          isEmailVerified: false,
          isPhoneVerified: false,
        };
        setUser(mockUser);
        localStorage.setItem("bindisa-user", JSON.stringify(mockUser));
        localStorage.setItem("bindisa-token", "demo-token-" + Date.now());
        return true;
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Fallback on any error
      const mockUser: User = {
        id: "demo-" + Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: "farmer",
        isEmailVerified: false,
        isPhoneVerified: false,
      };
      setUser(mockUser);
      localStorage.setItem("bindisa-user", JSON.stringify(mockUser));
      localStorage.setItem("bindisa-token", "demo-token-" + Date.now());
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Optional: Call logout endpoint to invalidate token on server
      const token = localStorage.getItem("bindisa-token");
      if (token && backendAvailable) {
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
