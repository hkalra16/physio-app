import { NextRequest, NextResponse } from 'next/server';
import { generateTestsForSymptoms } from '@/lib/gemini';
import { PainMarker } from '@/lib/types';

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
    const { painMarkers, initialStory } = body as {
      painMarkers: PainMarker[];
      initialStory?: string;
    };

    if (!painMarkers || painMarkers.length === 0) {
      return NextResponse.json(
        { error: 'Pain markers are required' },
        { status: 400 }
      );
    }

    const tests = await generateTestsForSymptoms(painMarkers, apiKey, initialStory);

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Generate tests API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tests' },
      { status: 500 }
    );
  }
}
