import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";

const getAuth = (req: NextRequest) => req.headers.get("Authorization");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const student_id = searchParams.get("student_id");
  const enrollment_id = searchParams.get("enrollment_id");
  const auth = getAuth(request);

  const BACKEND_URL = `${API_HOST}/api/v1/courses/${id}/curriculum`;

  try {
    const query = new URLSearchParams();
    if (student_id) query.append("student_id", student_id);
    if (enrollment_id) query.append("enrollment_id", enrollment_id);

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
    console.error(`GET Course Curriculum proxy error [${BACKEND_URL}]:`, message);
    return NextResponse.json(
      { message: "Failed to fetch course curriculum" },
      { status: 502 }
    );
  }
}
