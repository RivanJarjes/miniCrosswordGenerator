import { NextResponse } from 'next/server';

// POST request to generate a puzzle
export async function POST(request: Request) {
  try {
    // Get the body of the request
    const body = await request.json();

    // Fetch the puzzle from the server
    const response = await fetch('http://localhost:8080/api/puzzles/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get the data from the response
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    // Log the error
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to generate puzzle' },
      { status: 500 }
    );
  }
} 
