/**
 * Centralized API client with auth handling, error management, and type safety
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(config?: ApiClientConfig) {
    this.baseURL =
      config?.baseURL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://lms-backend-n83k.onrender.com";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config?.headers,
    };
  }

  private getAuthToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private handleAuthError(): void {
    if (typeof document === "undefined") return;
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  }

  async request<T = Record<string, unknown>>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.handleAuthError();
      }

      let errorData: Record<string, unknown> = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      throw new ApiError(
        response.status,
        (errorData.message as string) ||
          (errorData.detail as string) ||
          "API request failed",
        errorData
      );
    }

    return response.json() as Promise<T>;
  }

  get<T = Record<string, unknown>>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T = Record<string, unknown>>(
    endpoint: string,
    body?: Record<string, unknown>,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = Record<string, unknown>>(
    endpoint: string,
    body?: Record<string, unknown>,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = Record<string, unknown>>(
    endpoint: string,
    body?: Record<string, unknown>,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = Record<string, unknown>>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
