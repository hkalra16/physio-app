# AI Physiotherapist - Codebase Overview

## What This App Does
Interactive pain assessment tool where users:
1. Mark pain points on an anatomical body diagram (front/back views)
2. Annotate pain characteristics (type, intensity, quality, timing)
3. Complete AI-generated movement tests personalized to their symptoms
4. Get AI-powered analysis via Google Gemini 3 Pro
5. Ask follow-up questions about their assessment

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand with localStorage persistence
- **AI**: Google Gemini 3 Pro API (@google/generative-ai)

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── assessment/page.tsx         # Main assessment flow (tabs: Pain/Tests/Analysis)
│   └── api/analyze/route.ts        # Gemini API endpoint
│
├── components/
│   ├── body-visualizer/
│   │   ├── BodyVisualizer.tsx      # Main SVG body with click handling + L/R labels
│   │   ├── BodySvg.tsx             # SVG paths for body regions (~50 clickable areas)
│   │   └── PainMarkerIcon.tsx      # Visual marker rendered on body
│   │
│   ├── pain-annotation/
│   │   ├── PainAnnotationPanel.tsx # Slide-in form for pain details (uses smart defaults)
│   │   └── MarkerDetails.tsx       # Shows selected marker info
│   │
│   ├── movement-test/
│   │   ├── MovementTestList.tsx    # Generates AI tests, shows list
│   │   └── AITestCard.tsx          # Individual AI-generated test card with feedback
│   │
│   ├── analysis/
│   │   └── AnalysisPanel.tsx       # Gemini analysis + copy button + follow-up chat
│   │
│   └── ui/                         # shadcn components
│
├── store/
│   └── painStore.ts                # Zustand store - ALL app state lives here
│
├── data/
│   ├── muscle-map.ts               # Region ID → muscles/nerves mapping
│   └── movement-tests.ts           # Legacy static tests (now using AI-generated)
│
└── lib/
    ├── types.ts                    # All TypeScript interfaces
    ├── gemini.ts                   # Gemini API: analysis, test generation, follow-up
    └── utils.ts                    # Tailwind merge utility
```

## Key Data Types (src/lib/types.ts)

```typescript
// Pain marker placed on body
interface PainMarker {
  id: string;
  position: { x: number; y: number };
  region: string;                    // e.g., "shoulder-left-anterior"
  bodyView: 'anterior' | 'posterior';
  painType: 'point' | 'radiating' | 'diffuse' | 'referred';
  intensity: 1-10;
  characteristics: {
    quality: ('sharp' | 'dull' | 'burning' | 'numbness')[];
    timing: 'constant' | 'intermittent' | 'with-movement' | 'at-rest';
    onset: 'sudden' | 'gradual';
  };
}

// AI-Generated Movement Test
interface AIGeneratedTest {
  id: string;
  name: string;
  purpose: string;                   // Why this test for their symptoms
  targetMuscles: string[];
  instructions: string[];
  duration: number;
  whatToWatch: string;               // What to pay attention to
  positiveIndicators: string[];      // Signs suggesting a problem
  negativeIndicators: string[];      // Signs suggesting normal
}

// Movement test result with detailed feedback
interface MovementTestResult {
  testId: string;
  testName: string;
  isPositive: boolean;
  painIntensity?: number;
  painLocation?: string;
  painTiming?: string;              // "start" | "middle" | "end" | "throughout"
  painDescription?: string;
  additionalObservations?: string;
}

// Full session
interface AssessmentSession {
  id: string;
  status: 'in-progress' | 'completed';
  painMarkers: PainMarker[];
  suggestedTests?: AIGeneratedTest[];  // AI-generated tests
  movementTests: MovementTestResult[];
  geminiAnalysis?: GeminiPhysioResponse;
}
```

## State Management (src/store/painStore.ts)

Single Zustand store with:
- `currentSession` - Active assessment session
- `sessions` - Past completed sessions (persisted to localStorage)
- `currentView` - 'anterior' or 'posterior'
- `isAnnotating` - Whether pain annotation panel is open
- `pendingMarkerPosition` - Click position waiting for annotation
- `painDefaults` - Remembered values from last marker (smart defaults)

Key actions:
- `startAnnotation(x, y, region)` - Opens annotation panel
- `addPainMarker(type, intensity, characteristics)` - Saves marker + updates defaults
- `setSuggestedTests(tests)` - Stores AI-generated tests
- `addMovementTestResult(result)` - Records test completion
- `setGeminiAnalysis(analysis)` - Stores AI response

## How Pain Marking Works

1. User clicks body region in `BodyVisualizer.tsx`
2. Click handler calls `startAnnotation(x, y, regionId)`
3. `PainAnnotationPanel.tsx` (Sheet) opens with form
4. Form pre-populates with `painDefaults` from previous marker
5. For point/radiating pain, user can upload photos showing exact pain location
6. User fills out pain details, clicks "Add Pain Point"
7. `addPainMarker()` saves marker (with images) AND updates defaults for next time

## Pain Marker Images

Users can attach photos when marking point or radiating pain:
- Photos help clarify exact pain location
- Multiple images supported per marker
- Images are stored in the `PainMarker.images` array
- Images are sent to Gemini during analysis for visual assessment
- AI analyzes images for: exact location, visible signs (swelling, posture), correlation with symptoms

## AI-Generated Movement Tests (NEW)

Instead of static pre-defined tests, tests are now dynamically generated by Gemini:

1. User marks pain points → clicks "Generate Movement Tests"
2. `generateTestsForSymptoms()` in gemini.ts sends pain data to AI
3. AI returns 3-5 personalized tests with:
   - Purpose (why this test for their symptoms)
   - Step-by-step instructions
   - What to watch for
   - Positive/negative indicators
4. Tests stored in `currentSession.suggestedTests`
5. User completes each test, provides detailed feedback
6. Results sent to final analysis

## Gemini Integration (src/lib/gemini.ts)

Three main functions:

1. **`generateTestsForSymptoms(painMarkers, apiKey)`**
   - Input: Pain markers with regions, characteristics
   - Output: 3-5 AIGeneratedTest objects

2. **`analyzeWithGemini(painMarkers, testResults, userContext, apiKey)`**
   - Input: All pain + test data
   - Output: GeminiPhysioResponse with assessment, structures, recommendations

3. **`askFollowUpQuestion(question, analysis, painMarkers, tests, apiKey)`**
   - Input: User question + context
   - Output: AI response string

Model: `gemini-3-pro-preview` (Google's latest)

## Analysis Panel Features

- **Copy button**: Copies full analysis as formatted text
- **Follow-up chat**: Ask questions about your assessment
- **Image upload**: Upload photos of pain location for visual analysis
- **Re-analyze**: Regenerate analysis after more tests

## Image Upload in Chat

Users can upload images in the follow-up chat to show their pain location:
- Click the image icon to select a photo
- Preview appears before sending
- Image is sent to Gemini as base64 with the question
- Supports JPEG, PNG, etc. (max 10MB)
- AI analyzes the image in context of their symptoms

## Muscle Mapping (src/data/muscle-map.ts)

Maps ~50 body regions to anatomical structures:
```typescript
muscleRegionMap['shoulder-left-anterior'] = {
  primary: ['Deltoid (anterior)', 'Pectoralis major'],
  secondary: ['Biceps brachii', 'Coracobrachialis'],
  nerves: ['Axillary nerve', 'Musculocutaneous nerve']
}
```

## Body Diagram Labels

- Anterior (front) view: L/R are mirrored (as if patient facing you)
- Posterior (back) view: L/R as you'd see looking at someone's back
- Labels added in `BodyVisualizer.tsx` SVG

## Common Modifications

**Add new body region**: Edit `BodySvg.tsx` - add path to `anteriorRegions` or `posteriorRegions`

**Change pain quality options**: Edit `PainAnnotationPanel.tsx` - modify `painQualityOptions` array

**Modify AI test generation**: Edit `generateTestsForSymptoms()` prompt in `gemini.ts`

**Change AI model**: Update model name in `gemini.ts` (3 places)

**Persist more state**: Edit `painStore.ts` - add to `partialize` function in persist config

## File Dependencies

```
assessment/page.tsx
  └── BodyVisualizer.tsx (SVG body + markers + L/R labels)
  └── PainAnnotationPanel.tsx (uses painDefaults from store)
  └── MovementTestList.tsx (generates AI tests)
        └── AITestCard.tsx (individual test UI)
  └── AnalysisPanel.tsx (analysis + copy + follow-up chat)
        └── gemini.ts (all AI functions)

painStore.ts ← Central state, imported by most components
muscle-map.ts ← Used by PainAnnotationPanel + gemini.ts
types.ts ← Used everywhere
```

## API Key

Stored in localStorage as `gemini-api-key`. Configure via Settings button in header.
