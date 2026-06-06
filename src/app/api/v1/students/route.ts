import { NextRequest, NextResponse } from "next/server";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BACKEND_URL = process.env.BACKEND_STUDENTS_API_URL || `${API_HOST}/api/v1/students`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');
    
    let url = BACKEND_URL;
    if (page || limit || search) {
      const query = new URLSearchParams();
      if (page) query.append('page', page);
      if (limit) query.append('limit', limit);
      if (search) query.append('search', search);
      url = `${BACKEND_URL}?${query.toString()}`;
    }

    const response = await fetch(url, { cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`GET Students proxy connection error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Unable to connect to your backend. Ensure the backend is running at " + BACKEND_URL },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("--- DEBUG: PROXYING STUDENT POST ---");
    console.log("Target URL:", BACKEND_URL);
    console.log("Payload:", JSON.stringify(body, null, 2));
    
    const response = await fetch(BACKEND_URL, { cache: "no-store",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    console.log("Backend Response Status:", response.status);
    console.log("Backend Response Body:", JSON.stringify(data, null, 2));
    
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`--- DEBUG: PROXY POST ERROR [${BACKEND_URL}] ---`);
    console.error("Error Message:", message);
    return NextResponse.json(
      { message: "Unable to connect to your backend. Ensure the backend is running at " + BACKEND_URL },
      { status: 503 }
    );
  }
}
