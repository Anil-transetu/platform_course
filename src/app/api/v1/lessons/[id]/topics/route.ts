import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";

const getAuth = (req: NextRequest) => req.headers.get("Authorization");

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const auth = getAuth(request);
  const BACKEND_URL = `${API_HOST}/api/v1/lessons/${lessonId}/topics`;

  try {
    const body = await request.json();
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });

    const textData = await response.text();
    let data;
    try {
      data = textData ? JSON.parse(textData) : {};
    } catch {
      data = { message: textData || "Invalid JSON response from backend" };
    }

    if (!response.ok) {
      console.error(`POST Lesson Topic backend error [${BACKEND_URL}]:`, data);
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
    console.error(`POST Lesson Topic proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Failed to create topic in lesson" },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const auth = getAuth(request);
  const BACKEND_URL = `${API_HOST}/api/v1/lessons/${lessonId}/topics`;

  try {
    const response = await fetch(BACKEND_URL, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
    });

    const textData = await response.text();
    let data;
    try {
      data = textData ? JSON.parse(textData) : {};
    } catch {
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
    console.error(`GET Lesson Topics proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Failed to fetch topics for lesson" },
      { status: 502 }
    );
  }
}
