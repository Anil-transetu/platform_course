export interface LoginResponse {
  success?: boolean;
  token?: string;
  accessToken?: string;
  role?: string;
  user?: {
    email: string;
    name: string;
    role?: string;
  };
  message?: string;
  error?: string;
}

/**
 * Login to the API with email and password
 * @param email User email
 * @param password User password
 * @returns Login response with token and role
 */
export async function loginToApi(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const status = response.status;
    const body = await response.json().catch(() => ({
      message: "Login failed",
    }));

    // For expected authentication & business validation errors (4xx range), return response object
    if (status >= 400 && status < 500) {
      return {
        success: false,
        message: body.message || body.error || "Login failed",
        error: body.error || body.message || "Login failed",
        ...body,
      };
    }

    // For 5xx server errors, throw an exception
    throw new Error(body.message || body.error || "Server error occurred. Please try again.");
  }

  const data = (await response.json()) as LoginResponse;
  return data;
}

/**
 * Verify session token with the backend
 * @param token User token
 */
export async function verifySession(token: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}
