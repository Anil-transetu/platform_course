import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BACKEND_URL = `${API_HOST}/api/v1/courses/lookup`;

const getAuth = (req: NextRequest) => req.headers.get("Authorization");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const limit = searchParams.get("limit");
  const auth = getAuth(request);

  try {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (limit) query.append("limit", limit);

    const url = query.toString() ? `${BACKEND_URL}?${query.toString()}` : BACKEND_URL;

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { "Authorization": auth } : {}),
      },
    });

    const data = await response.json();
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
    console.error(`GET Course Lookup proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Failed to fetch course lookup details" },
      { status: 502 }
    );
  }
}
