import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;
export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // If a backend URL is configured, proxy the request to it
    const apiHost = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
    const backendUrl = process.env.BACKEND_AUTH_URL || `${apiHost}/auth/login`;
        if (backendUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const backendResponse = await fetch(backendUrl, { cache: "no-store",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        try {
          const data = await backendResponse.json();
          return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: backendResponse.status });
        } catch {
          // If backend returned something non-JSON, only fallback if it was a server error
          if (backendResponse.status >= 500) {
            throw new Error("Backend server error");
          }
          return NextResponse.json(
            { message: "Backend response error" },
            { status: backendResponse.status }
          );
        }
      } catch (error) {
        console.warn("Backend unreachable or timed out, falling back to local auth:", error);
      }
    }

    // Local authentication using environment variables
    const adminEmail = process.env.ADMIN_EMAIL || "superadmin@lms.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "SuperLmsPassword@2026";

    if (email === adminEmail && password === adminPassword) {
      return NextResponse.json({
        token: `mock_admin_token`, // Fallback only
        role: "admin",
        user: {
          email: adminEmail,
          name: "Super Admin",
        },
        message: "Login successful (Fallback)",
      });
    }

    // Check additional credentials from env (format: "email1:password1:role1,email2:password2:role2")
    const extraUsers = process.env.AUTH_USERS || "";
    if (extraUsers) {
      const users = extraUsers.split(",").map((u) => {
        const [userEmail, userPassword, userRole] = u.trim().split(":");
        return { email: userEmail, password: userPassword, role: userRole || "student" };
      });

      const matchedUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (matchedUser) {
        return NextResponse.json({
          token: `lms_token_${Date.now()}`,
          role: matchedUser.role,
          user: {
            email: matchedUser.email,
            name: matchedUser.email.split("@")[0],
          },
          message: "Login successful",
        });
      }
    }

    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
