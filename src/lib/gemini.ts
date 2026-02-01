import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  PainMarker,
  MovementTestResult,
  GeminiPhysioResponse,
  UserContext,
  AffectedMuscle,
  AIGeneratedTest
} from './types';
import { getMusclesForRegion } from '@/data/muscle-map';

const SYSTEM_PROMPT = `You are a friendly AI physiotherapy assistant helping everyday people understand their pain. Your role is to analyze pain patterns and movement test results in a way that's easy to understand.

IMPORTANT GUIDELINES:
1. Use simple, everyday language - avoid medical jargon
2. Explain things like you're talking to a friend, not a doctor
3. Always recommend seeing a professional for proper diagnosis
4. Be conservative - when uncertain, recommend professional evaluation
5. Flag any warning signs that need immediate attention
6. Suggest simple self-care tips when appropriate
7. Never diagnose - only suggest what might be going on

LANGUAGE RULES:
- Instead of "inflammation", say "swelling or irritation"
- Instead of "musculoskeletal", say "muscle and joint"
- Instead of "referred pain", say "pain that travels from another area"
- Instead of "bilateral", say "on both sides"
- Instead of "chronic", say "long-lasting" or "ongoing"
- Instead of "acute", say "sudden" or "recent"
- Instead of "cervical", say "neck"
- Instead of "lumbar", say "lower back"
- Instead of "thoracic", say "upper/mid back"
- Use everyday comparisons to explain sensations

Your response should be warm, reassuring, and easy to understand.`;

export async function analyzeWithGemini(
  painMarkers: PainMarker[],
  movementTestResults: MovementTestResult[],
  userContext?: UserContext,
  apiKey?: string,
  initialStory?: string
): Promise<GeminiPhysioResponse> {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using Gemini 3 Pro - Google's most advanced reasoning model
  const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

  // Build affected muscles analysis
  const affectedMuscles: AffectedMuscle[] = [];
  const muscleMarkerMap: Record<string, string[]> = {};

  painMarkers.forEach(marker => {
    const muscles = getMusclesForRegion(marker.region);
    if (muscles) {
      muscles.primary.forEach(muscle => {
        if (!muscleMarkerMap[muscle]) {
          muscleMarkerMap[muscle] = [];
        }
        muscleMarkerMap[muscle].push(marker.id);
      });
    }
  });

  Object.entries(muscleMarkerMap).forEach(([muscle, markerIds]) => {
    affectedMuscles.push({
      muscle,
      confidence: markerIds.length > 1 ? 'high' : 'medium',
      painMarkers: markerIds
    });
  });

  // Build the analysis request
  const painSummary = painMarkers.map(marker => ({
    region: marker.region.replace(/-/g, ' '),
    view: marker.bodyView,
    painType: marker.painType,
    intensity: marker.intensity,
    hasImages: marker.images && marker.images.length > 0,
    notes: marker.notes || undefined
  }));

  // Collect all images from pain markers
  const allMarkerImages: { base64: string; mimeType: string; markerRegion: string }[] = [];
  painMarkers.forEach(marker => {
    if (marker.images && marker.images.length > 0) {
      marker.images.forEach(img => {
        allMarkerImages.push({
          base64: img.base64,
          mimeType: img.mimeType,
          markerRegion: marker.region.replace(/-/g, ' ')
        });
      });
    }
  });

  const testSummary = movementTestResults.map(result => ({
    test: result.testName,
    result: result.isPositive ? 'Caused pain/issues' : 'Felt okay',
    notes: result.notes || undefined,
    hasImages: result.images && result.images.length > 0
  }));

  const hasImages = allMarkerImages.length > 0;

  const prompt = `
${SYSTEM_PROMPT}

Please analyze this person's pain and give them helpful, easy-to-understand feedback.

${initialStory ? `## What They Told Us
"${initialStory}"

` : ''}${hasImages ? `## Photos Provided
They've shared ${allMarkerImages.length} photo(s) showing where it hurts. Look at these to:
1. See exactly where the pain is
2. Notice any visible signs like swelling or redness
3. Connect what you see with what they're describing

` : ''}## Where It Hurts
${JSON.stringify(painSummary, null, 2)}

## Muscles That Might Be Involved
${affectedMuscles.map(m => `- ${m.muscle} (${m.confidence === 'high' ? 'very likely' : 'possibly'} involved)`).join('\n')}

## Movement Test Results
${testSummary.length > 0 ? JSON.stringify(testSummary, null, 2) : 'No movement tests done yet.'}

${userContext ? `
## About This Person
- Age: ${userContext.age || 'Not shared'}
- How active they are: ${userContext.activityLevel || 'Not shared'}
- Past issues: ${userContext.relevantHistory?.join(', ') || 'None mentioned'}
` : ''}

Please respond in the following JSON format. Remember to use SIMPLE, EVERYDAY LANGUAGE - imagine you're explaining this to a friend who knows nothing about medicine:

{
  "preliminaryAssessment": "A friendly 2-3 sentence explanation of what's probably going on. Use simple words. Start with something like 'Based on what you've told me...' or 'It sounds like...'",
  "affectedStructures": [
    {
      "structure": "Name of the body part (use everyday names like 'shoulder muscle' not 'deltoid')",
      "likelihood": "high|medium|low",
      "reasoning": "Simple explanation anyone can understand - why you think this part is involved"
    }
  ],
  "recommendedNextSteps": [
    "Practical tip 1 - something they can do right now",
    "Practical tip 2 - clear and actionable"
  ],
  "additionalTestsSuggested": [
    "A simple movement they could try to learn more"
  ],
  "redFlags": [
    "Any warning signs that mean they should see a doctor right away (leave empty if none)"
  ],
  "disclaimer": "A friendly reminder that this is just guidance, not medical advice"
}

Respond ONLY with the JSON object, no additional text.`;

  try {
    let result;

    if (hasImages) {
      // Build content array with all images first, then text
      const contentParts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];

      // Add all images from pain markers
      allMarkerImages.forEach(img => {
        contentParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.base64
          }
        });
      });

      // Add text prompt at the end
      contentParts.push({ text: prompt });

      result = await model.generateContent(contentParts);
    } else {
      result = await model.generateContent(prompt);
    }
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const parsed = JSON.parse(jsonMatch[0]) as GeminiPhysioResponse;

    // Ensure all required fields exist
    return {
      preliminaryAssessment: parsed.preliminaryAssessment || 'Unable to generate assessment.',
      affectedStructures: parsed.affectedStructures || [],
      recommendedNextSteps: parsed.recommendedNextSteps || ['Consult with a healthcare professional for proper evaluation.'],
      additionalTestsSuggested: parsed.additionalTestsSuggested,
      redFlags: parsed.redFlags || [],
      disclaimer: parsed.disclaimer || 'This is not medical advice. Please consult a qualified healthcare professional for proper diagnosis and treatment.'
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

// Generate movement tests based on symptoms
export async function generateTestsForSymptoms(
  painMarkers: PainMarker[],
  apiKey: string,
  initialStory?: string
): Promise<AIGeneratedTest[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

  // Build affected muscles analysis
  const affectedMuscles: { muscle: string; region: string }[] = [];
  painMarkers.forEach(marker => {
    const muscles = getMusclesForRegion(marker.region);
    if (muscles) {
      muscles.primary.forEach(muscle => {
        affectedMuscles.push({ muscle, region: marker.region });
      });
    }
  });

  // Collect all images from pain markers
  const allMarkerImages: { base64: string; mimeType: string; markerRegion: string }[] = [];
  painMarkers.forEach(marker => {
    if (marker.images && marker.images.length > 0) {
      marker.images.forEach(img => {
        allMarkerImages.push({
          base64: img.base64,
          mimeType: img.mimeType,
          markerRegion: marker.region.replace(/-/g, ' ')
        });
      });
    }
  });

  const hasImages = allMarkerImages.length > 0;

  const painSummary = painMarkers.map(marker => ({
    region: marker.region.replace(/-/g, ' '),
    view: marker.bodyView,
    painType: marker.painType,
    intensity: marker.intensity,
    hasImages: marker.images && marker.images.length > 0,
    notes: marker.notes || undefined
  }));

  const prompt = `
You are a friendly AI physiotherapy assistant. Based on what this person told you about their pain${hasImages ? ' and the photos they shared' : ''}, create 3-5 simple movement tests they can do at home.

${initialStory ? `## What They Told Us
"${initialStory}"

` : ''}${hasImages ? `## Photos They Shared
They've provided ${allMarkerImages.length} photo(s) showing where it hurts. Use these to:
1. See exactly where the pain is
2. Notice any visible signs like swelling or redness
3. Create tests that are relevant to what you see

` : ''}## Where It Hurts
${JSON.stringify(painSummary, null, 2)}

## Muscles That Might Be Involved
${affectedMuscles.map(m => `- ${m.muscle} (${m.region.replace(/-/g, ' ')})`).join('\n')}

Create movement tests that:
1. Are SAFE and easy to do at home with no equipment
2. Help figure out what's causing the pain
3. Start with gentle movements, then progress to more challenging ones
4. Have CLEAR, SIMPLE instructions anyone can follow

IMPORTANT: Use everyday language, not medical terms. Imagine you're explaining this to a friend.

Return ONLY a JSON array with the following structure:
[
  {
    "id": "unique-test-id",
    "name": "Simple, descriptive name (e.g., 'Shoulder Reach Test' not 'Glenohumeral ROM Assessment')",
    "purpose": "Why this test helps - explained simply (e.g., 'This helps us see if the pain is coming from your shoulder joint or the muscles around it')",
    "targetMuscles": ["Simple muscle names like 'shoulder muscles', 'back muscles'"],
    "instructions": [
      "Clear step 1 - like you're explaining to a friend",
      "Clear step 2 - simple language",
      "Clear step 3 - easy to follow"
    ],
    "duration": 15,
    "repetitions": 3,
    "whatToWatch": "What to pay attention to during the test - in plain English",
    "positiveIndicators": [
      "If you feel THIS, it might mean there's an issue (plain language)",
      "Another sign to watch for"
    ],
    "negativeIndicators": [
      "If you can do this without problems, that's a good sign"
    ]
  }
]

Generate 3-5 tests. Respond ONLY with the JSON array, no additional text.`;

  try {
    let result;

    if (hasImages) {
      // Build content array with all images first, then text
      const contentParts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];

      // Add all images from pain markers
      allMarkerImages.forEach(img => {
        contentParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.base64
          }
        });
      });

      // Add text prompt at the end
      contentParts.push({ text: prompt });

      result = await model.generateContent(contentParts);
    } else {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const parsed = JSON.parse(jsonMatch[0]) as AIGeneratedTest[];
    return parsed;
  } catch (error) {
    console.error('Gemini test generation error:', error);
    throw error;
  }
}

// Image data type for follow-up questions
interface ImageData {
  base64: string;
  mimeType: string;
}

// Follow-up question function with optional multiple image support
export async function askFollowUpQuestion(
  question: string,
  previousAnalysis: GeminiPhysioResponse,
  painMarkers: PainMarker[],
  movementTestResults: MovementTestResult[],
  apiKey: string,
  images?: ImageData[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

  const painSummary = painMarkers.map(marker => ({
    region: marker.region.replace(/-/g, ' '),
    painType: marker.painType,
    intensity: marker.intensity,
    notes: marker.notes || undefined
  }));

  const hasImages = images && images.length > 0;
  const imageCount = images?.length || 0;

  const textPrompt = `
${SYSTEM_PROMPT}

You previously provided this assessment for a patient:

## Previous Assessment:
${previousAnalysis.preliminaryAssessment}

## Affected Structures Identified:
${previousAnalysis.affectedStructures.map(s => `- ${s.structure} (${s.likelihood}): ${s.reasoning}`).join('\n')}

## Pain Data:
${JSON.stringify(painSummary, null, 2)}

## Movement Tests Completed:
${movementTestResults.length > 0 ? movementTestResults.map(t => `- ${t.testName}: ${t.isPositive ? 'Positive' : 'Negative'}`).join('\n') : 'None'}

${hasImages ? `The patient has attached ${imageCount} image${imageCount > 1 ? 's' : ''} showing their pain location or affected body part. Please analyze ${imageCount > 1 ? 'all the images' : 'the image'} in the context of their symptoms and provide relevant observations.

` : ''}The patient has a follow-up question:
"${question}"

Please provide a helpful, clear response. Remember to:
1. Stay within your role as an AI physiotherapy assistant
2. Recommend professional consultation when appropriate
3. Be educational but not diagnostic
4. Keep your response concise and actionable
${hasImages ? `5. Reference specific observations from ${imageCount > 1 ? 'each image' : 'the image'} when relevant` : ''}`;

  try {
    let result;

    if (hasImages) {
      // Build content array with all images first, then text
      const contentParts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];

      // Add all images
      images.forEach((img, index) => {
        contentParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.base64
          }
        });
      });

      // Add text prompt at the end
      contentParts.push({ text: textPrompt });

      result = await model.generateContent(contentParts);
    } else {
      // Text only
      result = await model.generateContent(textPrompt);
    }

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini follow-up error:', error);
    throw error;
  }
}

// Helper to format the analysis for display
export function formatAnalysisForDisplay(analysis: GeminiPhysioResponse): string {
  let output = '';

  output += `## Preliminary Assessment\n${analysis.preliminaryAssessment}\n\n`;

  if (analysis.affectedStructures.length > 0) {
    output += `## Likely Affected Structures\n`;
    analysis.affectedStructures.forEach(s => {
      output += `- **${s.structure}** (${s.likelihood} likelihood): ${s.reasoning}\n`;
    });
    output += '\n';
  }

  if (analysis.redFlags && analysis.redFlags.length > 0) {
    output += `## ⚠️ Red Flags\n`;
    analysis.redFlags.forEach(flag => {
      output += `- ${flag}\n`;
    });
    output += '\n';
  }

  if (analysis.recommendedNextSteps.length > 0) {
    output += `## Recommended Next Steps\n`;
    analysis.recommendedNextSteps.forEach((step, i) => {
      output += `${i + 1}. ${step}\n`;
    });
    output += '\n';
  }

  output += `---\n*${analysis.disclaimer}*`;

  return output;
}
