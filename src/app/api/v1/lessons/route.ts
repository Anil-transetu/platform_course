import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BACKEND_URL = `${API_HOST}/api/v1/lessons`;

const getAuth = (req: NextRequest) => req.headers.get("Authorization");

export async function GET(request: NextRequest) {
  const auth = getAuth(request);

  try {
    const response = await fetch(BACKEND_URL, {
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
    console.error(`GET Lessons proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Failed to fetch lessons from backend" },
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
      console.error(`POST Lesson backend error:`, data);
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
    console.error(`POST Lesson proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Failed to create lesson in backend" },
      { status: 502 }
    );
  }
}
