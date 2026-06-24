import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    // In a real app, you would cryptographically verify the token here using jsonwebtoken or jose
    // For this mock implementation, we will assume any non-empty token is valid.
    
    // Removed setTimeout to prevent any potential hanging in the API route.

    return NextResponse.json({
      valid: true,
      message: 'Token is valid'
    });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
