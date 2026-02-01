import { NextRequest, NextResponse } from 'next/server';
import { askFollowUpQuestion } from '@/lib/gemini';
import { PainMarker, MovementTestResult, GeminiPhysioResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { question, previousAnalysis, painMarkers, movementTestResults, images } = body as {
      question: string;
      previousAnalysis: GeminiPhysioResponse;
      painMarkers: PainMarker[];
      movementTestResults: MovementTestResult[];
      images?: { base64: string; mimeType: string }[];
    };

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const response = await askFollowUpQuestion(
      question,
      previousAnalysis,
      painMarkers,
      movementTestResults || [],
      apiKey,
      images
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Follow-up API error:', error);
    return NextResponse.json(
      { error: 'Failed to process follow-up question' },
      { status: 500 }
    );
  }
}
