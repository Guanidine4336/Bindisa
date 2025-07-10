// API utility for backend communication with fallback support

const API_BASE_URL = "http://localhost:5000/api";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private backendAvailable: boolean = true;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(
        `${this.baseUrl.replace("/api", "")}/health`,
        {
          method: "GET",
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      this.backendAvailable = response.ok;
      return response.ok;
    } catch (error) {
      this.backendAvailable = false;
      return false;
    }
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      // Check backend availability before making request
      if (!this.backendAvailable) {
        await this.checkHealth();
      }

      if (!this.backendAvailable) {
        throw new Error("Backend not available");
      }

      const url = `${this.baseUrl}${endpoint}`;
      const token = localStorage.getItem("bindisa-token");

      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token && !token.startsWith("demo-token")) {
        defaultHeaders.Authorization = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: "Network error" },
        }));
        return {
          success: false,
          error: errorData.error || { message: "Request failed" },
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      this.backendAvailable = false;
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  isBackendAvailable(): boolean {
    return this.backendAvailable;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type { ApiResponse };
