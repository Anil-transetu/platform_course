import { NextRequest, NextResponse } from "next/server";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BACKEND_URL = process.env.BACKEND_API_URL || `${API_HOST}/api/v1/institutions`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const authHeader = request.headers.get("Authorization");
  
  try {
    let url = BACKEND_URL;
    if (search) {
      url = `${BACKEND_URL}/search?search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url, { cache: "no-store",
      headers: { 
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: response.status });
  } catch (error) {
    console.error("GET Institutions proxy error:", error);
    return NextResponse.json({ message: "Failed to fetch institutions from backend" }, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  try {
    const body = await request.json();
    const response = await fetch(BACKEND_URL, { cache: "no-store",
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: response.status });
  } catch (error) {
    console.error("POST Institution proxy error:", error);
    return NextResponse.json({ message: "Failed to create institution in backend" }, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: 500 });
  }
}
