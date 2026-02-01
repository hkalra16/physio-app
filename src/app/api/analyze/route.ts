import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/gemini';
import { PainMarker, MovementTestResult, UserContext } from '@/lib/types';

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
    const { painMarkers, movementTestResults, userContext, initialStory } = body as {
      painMarkers: PainMarker[];
      movementTestResults: MovementTestResult[];
      userContext?: UserContext;
      initialStory?: string;
    };

    if (!painMarkers || painMarkers.length === 0) {
      return NextResponse.json(
        { error: 'Pain markers are required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeWithGemini(
      painMarkers,
      movementTestResults || [],
      userContext,
      apiKey,
      initialStory
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}
