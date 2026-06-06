import { NextRequest, NextResponse } from "next/server";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BACKEND_URL = process.env.BACKEND_STUDENTS_API_URL || `${API_HOST}/api/v1/students`;

const getAuth = (req: NextRequest) => req.headers.get("Authorization");


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuth(request);
  
  try {
    const response = await fetch(`${BACKEND_URL}/${id}`, { cache: "no-store",
      headers: { 
        "Content-Type": "application/json",
        ...(auth ? { "Authorization": auth } : {})
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`GET Student proxy error [${BACKEND_URL}/${id}]:`, message);
    return NextResponse.json(
      { message: `Failed to connect to backend at ${BACKEND_URL}/${id}. Ensure the backend is running and publicly accessible.` },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuth(request);
  
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/${id}`, { cache: "no-store",
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        ...(auth ? { "Authorization": auth } : {})
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`PUT Student proxy error [${BACKEND_URL}/${id}]:`, message);
    return NextResponse.json(
      { message: `Failed to connect to backend at ${BACKEND_URL}/${id}. Ensure the backend is running and publicly accessible.` },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuth(request);
  
  try {
    const response = await fetch(`${BACKEND_URL}/${id}`, { cache: "no-store",
      method: "DELETE",
      headers: auth ? { "Authorization": auth } : {},
    });

    
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`DELETE Student proxy error [${BACKEND_URL}/${id}]:`, message);
    return NextResponse.json(
      { message: `Failed to connect to backend at ${BACKEND_URL}/${id}. Ensure the backend is running and publicly accessible.` },
      { status: 502 }
    );
  }
}
