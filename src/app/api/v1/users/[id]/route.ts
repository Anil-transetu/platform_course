import { NextRequest, NextResponse } from "next/server";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";
const BACKEND_URL = `${API_HOST}/api/v1/users`;

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
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`GET User proxy error [${BACKEND_URL}/${id}]:`, message);
    return NextResponse.json(
      { message: `Failed to connect to backend at ${BACKEND_URL}/${id}.` },
      { status: 502 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuth(request);
  
  try {
    const body = await request.json();
    console.log(`PATCH User proxy [${BACKEND_URL}/${id}] payload:`, body);
    
    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(`${BACKEND_URL}/${id}`, { cache: "no-store",
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(auth ? { "Authorization": auth } : {})
        },
        body: JSON.stringify(body),

        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`PATCH User proxy [${BACKEND_URL}/${id}] response status:`, response.status);
      
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log(`PATCH User proxy [${BACKEND_URL}/${id}] response JSON:`, data);
      } else {
        const text = await response.text();
        console.log(`PATCH User proxy [${BACKEND_URL}/${id}] response Text:`, text);
        data = { message: text || `Backend returned status ${response.status}` };
      }
      
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: response.status });
     } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return NextResponse.json({ message: "Backend request timed out" }, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: 504 });
        }
        throw fetchError;
      }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`PATCH User proxy error [${BACKEND_URL}/${id}]:`, message);
    return NextResponse.json(
      { message: `Failed to connect to backend at ${BACKEND_URL}/${id}: ${message}` },
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
    console.log(`PUT User proxy [${BACKEND_URL}/${id}] payload:`, body);
    
    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(`${BACKEND_URL}/${id}`, { cache: "no-store",
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(auth ? { "Authorization": auth } : {})
        },
        body: JSON.stringify(body),

        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`PUT User proxy [${BACKEND_URL}/${id}] response status:`, response.status);
      
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log(`PUT User proxy [${BACKEND_URL}/${id}] response JSON:`, data);
      } else {
        const text = await response.text();
        console.log(`PUT User proxy [${BACKEND_URL}/${id}] response Text:`, text);
        data = { message: text || `Backend returned status ${response.status}` };
      }
      
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: response.status });
     } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return NextResponse.json({ message: "Backend request timed out" }, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate", "Pragma": "no-cache", "Expires": "0" },  status: 504 });
        }
        throw fetchError;
      }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`PUT User proxy error [${BACKEND_URL}/${id}]:`, message);
    return NextResponse.json(
      { message: `Failed to connect to backend at ${BACKEND_URL}/${id}: ${message}` },
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
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`DELETE User proxy error [${BACKEND_URL}/${id}]:`, message);
    return NextResponse.json(
      { message: `Failed to connect to backend at ${BACKEND_URL}/${id}.` },
      { status: 502 }
    );
  }
}
