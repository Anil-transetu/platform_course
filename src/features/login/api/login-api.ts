interface LoginResponse {
  token?: string;
  accessToken?: string;
  role: string;
  user?: {
    email: string;
    name: string;
  };
  message: string;
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
    const error = await response.json().catch(() => ({
      message: "Login failed",
    }));
    throw new Error(error.message || "Login failed");
  }

  const data = (await response.json()) as LoginResponse;
  return data;
}
