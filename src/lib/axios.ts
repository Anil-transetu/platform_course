// src/lib/axios.ts
/**
 * Mock Axios API client using fetch to communicate with Next.js local proxies.
 * Includes automatic auth headers from document cookies.
 */

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";

function getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...customHeaders };
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    if (match) {
      headers["Authorization"] = `Bearer ${match[2]}`;
    }
  }
  return headers;
}

const api = {
  get: async <T>(url: string, config?: { params?: Record<string, any> }): Promise<{ data: T }> => {
    let finalUrl = url;
    if (config?.params) {
      const filteredParams = Object.entries(config.params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          acc[k] = String(v);
        }
        return acc;
      }, {} as Record<string, string>);
      const searchParams = new URLSearchParams(filteredParams);
      if (searchParams.toString()) {
        finalUrl += `?${searchParams.toString()}`;
      }
    }
    const res = await fetch(finalUrl, {
      method: "GET",
      headers: getHeaders({
        "Content-Type": "application/json",
      }),
    });
    if (!res.ok) {
      throw new Error(`GET API error: ${res.statusText}`);
    }
    const data = await res.json();
    return { data };
  },

  post: async <T>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    const isFormData = data instanceof FormData;
    
    // Intercept bulk upload to go directly to backend, as the local proxy does not support dynamic POST
    let targetUrl = url;
    if (url === "/api/v1/students/bulk") {
      targetUrl = `${API_HOST}/api/v1/students/bulk-upload`;
    }

    const headers = getHeaders(config?.headers);
    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    // Note: for FormData, we MUST let the browser set the Content-Type boundary, so delete it if set
    if (isFormData) {
      delete headers["Content-Type"];
    }

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `POST API error: ${res.statusText}`);
    }
    const resData = await res.json();
    return { data: resData };
  },

  put: async <T>(url: string, data?: any): Promise<{ data: T }> => {
    const res = await fetch(url, {
      method: "PUT",
      headers: getHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`PUT API error: ${res.statusText}`);
    }
    const resData = await res.json();
    return { data: resData };
  },

  delete: async <T>(url: string): Promise<{ data: T }> => {
    const res = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`DELETE API error: ${res.statusText}`);
    }
    const data = res.status === 204 ? (null as any) : await res.json();
    return { data };
  },
};

export default api;
