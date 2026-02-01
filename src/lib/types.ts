// Pain Marker Types
export type PainType = 'point' | 'radiating' | 'diffuse' | 'referred';

export type PainQuality = 'sharp' | 'dull' | 'burning' | 'numbness';

export type PainTiming = 'constant' | 'intermittent' | 'with-movement' | 'at-rest';

export type PainOnset = 'sudden' | 'gradual';

export type BodyView = 'anterior' | 'posterior';

export interface PainCharacteristics {
  quality: PainQuality[];
  timing: PainTiming;
  onset: PainOnset;
  aggravatingFactors?: string[];
  relievingFactors?: string[];
}

export interface SpreadArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  radiusX?: number;
  radiusY?: number;
}

// Image attached to a pain marker
export interface PainMarkerImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface PainMarker {
  id: string;
  position: { x: number; y: number };
  region: string;
  bodyView: BodyView;
  painType: PainType;
  intensity: number; // 1-10
  spreadArea?: SpreadArea;
  timestamp: Date;
  images?: PainMarkerImage[];  // Photos showing the pain location
  notes?: string;  // Additional user notes about this pain point
}

// Muscle Mapping Types
export interface MuscleMapping {
  primary: string[];
  secondary: string[];
  nerves: string[];
}

export interface AffectedMuscle {
  muscle: string;
  confidence: 'high' | 'medium' | 'low';
  painMarkers: string[];
}

export interface PainAnalysis {
  markers: PainMarker[];
  affectedMuscles: AffectedMuscle[];
  possibleConditions: string[];
  suggestedTests: MovementTest[];
}

// Movement Test Types
export interface MovementTest {
  id: string;
  name: string;
  targetArea: string[];
  targetMuscles: string[];
  instructions: string[];
  demonstrationUrl?: string;
  duration: number;
  repetitions?: number;
  expectedFindings: {
    positive: string;
    negative: string;
  };
}

export interface MovementTestResult {
  testId: string;
  testName: string;
  isPositive: boolean;             // Did it cause pain? Yes/No
  notes?: string;                  // Free text description of what happened
  images?: PainMarkerImage[];      // Optional photos
  completedAt: Date;
}

// AI-Generated Movement Test (dynamic based on symptoms)
export interface AIGeneratedTest {
  id: string;
  name: string;
  purpose: string;                   // Why this test is recommended for their symptoms
  targetMuscles: string[];
  instructions: string[];
  duration: number;                  // seconds
  repetitions?: number;
  whatToWatch: string;               // What sensations/responses to pay attention to
  positiveIndicators: string[];      // Signs that suggest a problem
  negativeIndicators: string[];      // Signs that suggest normal function
}

// Session Types
export interface AssessmentSession {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'in-progress' | 'completed';
  initialStory?: string;  // User's initial description of their pain/problem
  painMarkers: PainMarker[];
  suggestedTests?: AIGeneratedTest[];  // AI-generated tests based on symptoms
  movementTests: MovementTestResult[];
  geminiAnalysis?: GeminiPhysioResponse;
}

export interface UserContext {
  age?: number;
  activityLevel?: string;
  relevantHistory?: string[];
}

// Gemini API Types
export interface GeminiPhysioRequest {
  painAnalysis: PainAnalysis;
  movementTestResults: MovementTestResult[];
  patientContext?: UserContext;
}

export interface AffectedStructure {
  structure: string;
  likelihood: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface GeminiPhysioResponse {
  preliminaryAssessment: string;
  affectedStructures: AffectedStructure[];
  recommendedNextSteps: string[];
  additionalTestsSuggested?: MovementTest[];
  redFlags?: string[];
  disclaimer: string;
}

// Body Region Types
export interface BodyRegion {
  id: string;
  name: string;
  path: string; // SVG path data
  muscles: MuscleMapping;
}
