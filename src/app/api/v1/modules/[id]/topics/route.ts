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
  const { id } = await params;
  const auth = getAuth(request);
  const BACKEND_URL = `${API_HOST}/api/v1/modules/${id}/topics`;

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
    console.error(`POST Module Topic proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Failed to add topic to module" },
      { status: 502 }
    );
  }
}
