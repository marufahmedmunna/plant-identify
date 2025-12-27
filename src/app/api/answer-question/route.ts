import { answerQuestionsAboutPlant } from "@/ai/flows/answer-questions-about-plant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plantName, organName, speciesName, plantHealth, question } = body;

    if (!plantName || !question) {
      return NextResponse.json(
        { error: "Plant name and question are required" },
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

    const result = await answerQuestionsAboutPlant({
      plantName,
      organName,
      speciesName,
      plantHealth,
      question,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Question answering error:", error);
    return NextResponse.json(
      { error: "Failed to answer question", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}