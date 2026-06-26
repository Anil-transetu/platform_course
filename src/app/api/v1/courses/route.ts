import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BACKEND_URL = `${API_HOST}/api/v1/courses`;

const getAuth = (req: NextRequest) => req.headers.get("Authorization");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const auth = getAuth(request);

  try {
    const query = new URLSearchParams();
    if (page) query.append("page", page);
    if (limit) query.append("limit", limit);
    if (status !== null) query.append("status", status);
    if (search) query.append("search", search);

    const url = query.toString() ? `${BACKEND_URL}?${query.toString()}` : BACKEND_URL;

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { "Authorization": auth } : {}),
      },
    });

    const textData = await response.text();
    let data;
    try {
      data = textData ? JSON.parse(textData) : {};
    } catch (e) {
      data = { message: textData || "Invalid JSON response from backend" };
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      status: response.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`GET Courses proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Failed to connect to backend courses endpoint" },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuth(request);

  try {
    const body = await request.json();
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { "Authorization": auth } : {}),
      },
      body: JSON.stringify(body),
    });

    const textData = await response.text();
    let data;
    try {
      data = textData ? JSON.parse(textData) : {};
    } catch (e) {
      data = { message: textData || "Invalid JSON response from backend" };
    }

    if (!response.ok) {
      console.error(`POST Course backend error:`, data);
    }
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      status: response.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`POST Courses proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Failed to create course in backend" },
      { status: 502 }
    );
  }
}
