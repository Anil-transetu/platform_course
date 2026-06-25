import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BACKEND_URL = `${API_HOST}/api/v1/assignments`;

const getAuth = (req: NextRequest) => req.headers.get("Authorization");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const auth = getAuth(request);

  try {
    const query = new URLSearchParams();
    if (page) query.append("page", page);
    if (limit) query.append("limit", limit);
    if (search) query.append("search", search);
    if (status) query.append("status", status);

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
    console.error(`GET Assignments proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Failed to fetch assignments from backend" },
      { status: 502 }
    );
  }
}
