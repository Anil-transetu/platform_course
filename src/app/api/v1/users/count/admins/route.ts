import { NextRequest, NextResponse } from "next/server";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BACKEND_URL = `${API_HOST}/api/v1/users/count/admins`;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  try {
    const response = await fetch(BACKEND_URL, { cache: "no-store",
      headers: { 
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GET Admin Count proxy error [${BACKEND_URL}] status ${response.status}:`, errorText);
      return NextResponse.json(
        { message: `Backend error: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`GET Admin Count proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Unable to connect to backend at " + BACKEND_URL },
      { status: 503 }
    );
  }
}
