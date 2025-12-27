import { identifyPlantFromImage } from "@/ai/flows/identify-plant-from-image";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoDataUri } = body;

    if (!photoDataUri) {
      return NextResponse.json(
        { error: "Photo data URI is required" },
        { status: 400 }
      );
    }

    // Validate that the API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    const result = await identifyPlantFromImage({ photoDataUri });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Plant identification error:", error);
    return NextResponse.json(
      { error: "Failed to identify plant", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}