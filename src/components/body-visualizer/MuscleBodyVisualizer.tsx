'use client';

import { useState, useEffect, useCallback } from 'react';
import Body, { type ExtendedBodyPart, type Slug } from 'react-muscle-highlighter';
import { usePainStore } from '@/store/painStore';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

// Parts that are CENTER only (no left/right differentiation)
// These muscles are single/central and cannot be clicked separately on left/right
const CENTER_ONLY_PARTS: Slug[] = [
  'head', 'neck', 'chest', 'abs', 'trapezius', 'hair'
];

// Parts that have LEFT/RIGHT differentiation
// These muscles have separate left and right SVG paths in the library
const BILATERAL_PARTS: Slug[] = [
  'deltoids', 'biceps', 'triceps', 'forearm', 'hands',
  'gluteal', 'quadriceps', 'hamstring', 'adductors',
  'calves', 'tibialis', 'knees', 'ankles', 'feet', 'obliques',
  'upper-back', 'lower-back'  // These DO have left/right paths!
];

// Slug to human-readable region name (with side support)
function getRegionDisplayName(slug: Slug, side?: 'left' | 'right'): string {
  const baseNames: Record<Slug, string> = {
    'abs': 'Abdominals',
    'adductors': 'Inner Thigh',
    'ankles': 'Ankle',
    'biceps': 'Biceps',
    'calves': 'Calf',
    'chest': 'Chest',
    'deltoids': 'Shoulder',
    'feet': 'Foot',
    'forearm': 'Forearm',
    'gluteal': 'Glutes',
    'hamstring': 'Hamstring',
    'hands': 'Hand',
    'hair': 'Hair',
    'head': 'Head',
    'knees': 'Knee',
    'lower-back': 'Lower Back',
    'neck': 'Neck',
    'obliques': 'Obliques',
    'quadriceps': 'Quadriceps',
    'tibialis': 'Shin',
    'trapezius': 'Trapezius',
    'triceps': 'Triceps',
    'upper-back': 'Upper Back',
  };

  const baseName = baseNames[slug] || slug;

  // Only add side for bilateral body parts
  if (side && BILATERAL_PARTS.includes(slug)) {
    return `${side === 'left' ? 'Left' : 'Right'} ${baseName}`;
  }

  return baseName;
}

// Get intensity color based on pain level (1-10)
function getIntensityColor(intensity: number): string {
  if (intensity <= 3) return '#fbbf24'; // Yellow - mild
  if (intensity <= 6) return '#f97316'; // Orange - moderate
  return '#ef4444'; // Red - severe
}

// Map intensity 1-10 to library's 1-3 scale
function mapIntensityToLibraryScale(intensity: number): number {
  if (intensity <= 3) return 1;
  if (intensity <= 6) return 2;
  return 3;
}

// Color for pending/selected muscle (blue highlight)
const PENDING_HIGHLIGHT_COLOR = '#3b82f6';

/**
 * Convert between patient side and SVG side based on view.
 *
 * In FRONT view (anterior): Patient faces you (mirror image)
 *   - SVG left side = Patient's RIGHT
 *   - SVG right side = Patient's LEFT
 *
 * In BACK view (posterior): Patient's back to you (same orientation)
 *   - SVG left side = Patient's LEFT
 *   - SVG right side = Patient's RIGHT
 */
function patientSideToSvgSide(
  patientSide: 'left' | 'right' | undefined,
  view: 'anterior' | 'posterior'
): 'left' | 'right' | undefined {
  if (!patientSide) return undefined;
  if (view === 'anterior') {
    // Flip for front view
    return patientSide === 'left' ? 'right' : 'left';
  }
  // No flip for back view
  return patientSide;
}

function svgSideToPatientSide(
  svgSide: 'left' | 'right' | undefined,
  view: 'anterior' | 'posterior'
): 'left' | 'right' | undefined {
  if (!svgSide) return undefined;
  if (view === 'anterior') {
    // Flip for front view
    return svgSide === 'left' ? 'right' : 'left';
  }
  // No flip for back view
  return svgSide;
}

export default function MuscleBodyVisualizer() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Track the currently clicked muscle for immediate visual feedback
  // This stores the PATIENT side (not SVG side)
  const [pendingMuscle, setPendingMuscle] = useState<{ slug: Slug; patientSide?: 'left' | 'right' } | null>(null);

  // Subscribe to store
  const currentView = usePainStore((state) => state.currentView);
  const setCurrentView = usePainStore((state) => state.setCurrentView);
  const currentSession = usePainStore((state) => state.currentSession);
  const startAnnotation = usePainStore((state) => state.startAnnotation);
  const isAnnotating = usePainStore((state) => state.isAnnotating);
  const pendingMarkerPosition = usePainStore((state) => state.pendingMarkerPosition);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Clear pending muscle when annotation is cancelled or completed
  useEffect(() => {
    if (!isAnnotating) {
      setPendingMuscle(null);
    }
  }, [isAnnotating]);

  // Get markers for current view
  const markers = isHydrated && currentSession?.painMarkers
    ? currentSession.painMarkers.filter(m => m.bodyView === currentView)
    : [];

  // Build body data for the muscle highlighter
  const bodyData: ExtendedBodyPart[] = (() => {
    const data: ExtendedBodyPart[] = [];

    if (!isHydrated) return data;

    // Group markers by muscle slug + patient side and get highest intensity
    const muscleIntensities: Record<string, { intensity: number; patientSide?: 'left' | 'right' }> = {};

    markers.forEach(marker => {
      // Parse the region to extract slug and PATIENT side
      // Region format: "slug" or "slug-left" or "slug-right" (where left/right is patient's side)
      const parts = marker.region.split('-');
      let slug: string;
      let patientSide: 'left' | 'right' | undefined;

      if (parts.length >= 2 && (parts[parts.length - 1] === 'left' || parts[parts.length - 1] === 'right')) {
        patientSide = parts[parts.length - 1] as 'left' | 'right';
        slug = parts.slice(0, -1).join('-');
      } else {
        slug = marker.region;
      }

      const key = patientSide ? `${slug}-${patientSide}` : slug;
      const currentMax = muscleIntensities[key]?.intensity || 0;

      if (marker.intensity > currentMax) {
        muscleIntensities[key] = { intensity: marker.intensity, patientSide };
      }
    });

    // Add existing pain markers to body data
    // Need to convert patient side to SVG side for rendering
    // IMPORTANT: Library uses data.find() so we can only have ONE entry per slug
    // We need to handle left/right separately in the data array
    Object.entries(muscleIntensities).forEach(([key, { intensity, patientSide }]) => {
      const slug = patientSide ? key.replace(`-${patientSide}`, '') : key;
      const svgSide = patientSideToSvgSide(patientSide, currentView);

      data.push({
        slug: slug as Slug,
        color: getIntensityColor(intensity),
        intensity: mapIntensityToLibraryScale(intensity),
        side: svgSide,
      });
    });

    // Add pending muscle highlight (blue) if currently annotating
    // But ONLY if we don't already have an entry for the exact same slug+side
    if (pendingMuscle) {
      // Convert patient side to SVG side for rendering
      const svgSide = patientSideToSvgSide(pendingMuscle.patientSide, currentView);

      // Check if we already have ANY entry for this slug in data
      // The library only looks at the first entry per slug, so we should not add duplicates
      const existingForSlug = data.find(d => d.slug === pendingMuscle.slug);

      // Only add pending highlight if:
      // 1. No existing entry for this slug, OR
      // 2. Existing entry is for a DIFFERENT side (but library won't handle this correctly)
      // For now, skip adding pending if there's ANY existing entry for this slug
      // to avoid confusing the library
      if (!existingForSlug) {
        data.push({
          slug: pendingMuscle.slug,
          color: PENDING_HIGHLIGHT_COLOR,
          side: svgSide,
          styles: {
            fill: PENDING_HIGHLIGHT_COLOR,
            stroke: '#1d4ed8',
            strokeWidth: 2,
          },
        });
      }
    }

    console.log('bodyData being sent to library:', JSON.stringify(data, null, 2));
    console.log('muscleIntensities:', JSON.stringify(muscleIntensities, null, 2));
    return data;
  })();

  // Handle muscle click
  const handleBodyPartPress = useCallback((part: ExtendedBodyPart, svgSide?: 'left' | 'right') => {
    if (!part.slug) return;

    // Debug: Log what the library reports
    console.log('Library reported:', { slug: part.slug, svgSide, view: currentView });

    // For center-only parts, ignore the side completely
    const isBilateral = BILATERAL_PARTS.includes(part.slug);
    const effectiveSvgSide = isBilateral ? svgSide : undefined;

    // Convert SVG side to patient side (only for bilateral parts)
    const patientSide = isBilateral ? svgSideToPatientSide(effectiveSvgSide, currentView) : undefined;
    console.log('Effective side:', { isBilateral, effectiveSvgSide, patientSide });

    // Store the pending muscle with PATIENT side
    setPendingMuscle({ slug: part.slug, patientSide });

    // Create a region ID using PATIENT side
    // Format: "slug" for center parts, "slug-left" or "slug-right" for bilateral parts
    const finalRegionId = patientSide ? `${part.slug}-${patientSide}` : part.slug;

    // Use approximate center positions for the marker (based on effective SVG side for visual positioning)
    const s = effectiveSvgSide; // shorthand
    const approximatePositions: Record<string, { x: number; y: number }> = {
      'head': { x: 150, y: 60 },
      'neck': { x: 150, y: 125 },
      'deltoids': s === 'left' ? { x: 60, y: 160 } : s === 'right' ? { x: 240, y: 160 } : { x: 150, y: 160 },
      'chest': { x: 150, y: 180 },
      'biceps': s === 'left' ? { x: 40, y: 220 } : s === 'right' ? { x: 260, y: 220 } : { x: 150, y: 220 },
      'triceps': s === 'left' ? { x: 40, y: 220 } : s === 'right' ? { x: 260, y: 220 } : { x: 150, y: 220 },
      'forearm': s === 'left' ? { x: 35, y: 305 } : s === 'right' ? { x: 265, y: 305 } : { x: 150, y: 305 },
      'hands': s === 'left' ? { x: 30, y: 375 } : s === 'right' ? { x: 270, y: 375 } : { x: 150, y: 375 },
      'abs': { x: 150, y: 260 },
      'obliques': s === 'left' ? { x: 90, y: 265 } : s === 'right' ? { x: 210, y: 265 } : { x: 150, y: 265 },
      'upper-back': s === 'left' ? { x: 100, y: 180 } : s === 'right' ? { x: 200, y: 180 } : { x: 150, y: 180 },
      'trapezius': { x: 150, y: 160 },
      'lower-back': s === 'left' ? { x: 110, y: 280 } : s === 'right' ? { x: 190, y: 280 } : { x: 150, y: 270 },
      'gluteal': s === 'left' ? { x: 110, y: 360 } : s === 'right' ? { x: 190, y: 360 } : { x: 150, y: 360 },
      'quadriceps': s === 'left' ? { x: 100, y: 440 } : s === 'right' ? { x: 200, y: 440 } : { x: 150, y: 440 },
      'adductors': s === 'left' ? { x: 135, y: 440 } : s === 'right' ? { x: 165, y: 440 } : { x: 150, y: 440 },
      'hamstring': s === 'left' ? { x: 110, y: 460 } : s === 'right' ? { x: 190, y: 460 } : { x: 150, y: 460 },
      'knees': s === 'left' ? { x: 110, y: 525 } : s === 'right' ? { x: 190, y: 525 } : { x: 150, y: 525 },
      'tibialis': s === 'left' ? { x: 110, y: 615 } : s === 'right' ? { x: 190, y: 615 } : { x: 150, y: 615 },
      'calves': s === 'left' ? { x: 110, y: 620 } : s === 'right' ? { x: 190, y: 620 } : { x: 150, y: 620 },
      'ankles': s === 'left' ? { x: 110, y: 695 } : s === 'right' ? { x: 190, y: 695 } : { x: 150, y: 695 },
      'feet': s === 'left' ? { x: 110, y: 730 } : s === 'right' ? { x: 190, y: 730 } : { x: 150, y: 730 },
    };

    const pos = approximatePositions[part.slug] || { x: 150, y: 400 };

    // Start annotation with the region ID (contains patient side)
    startAnnotation(pos.x, pos.y, finalRegionId);
  }, [currentView, startAnnotation]);

  // Map our view names to library's side prop
  const librarySide = currentView === 'anterior' ? 'front' : 'back';

  // Get the display name of the currently pending region (uses patient side)
  const pendingRegionName = pendingMuscle
    ? getRegionDisplayName(pendingMuscle.slug, pendingMuscle.patientSide)
    : pendingMarkerPosition?.region
      ? pendingMarkerPosition.region.replace(/-/g, ' ')
      : null;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Controls Row */}
      <div className="flex flex-wrap gap-2 justify-center">
        {/* View Toggle */}
        <div className="flex gap-1">
          <Button
            variant={currentView === 'anterior' ? 'default' : 'outline'}
            onClick={() => setCurrentView('anterior')}
            size="sm"
          >
            Front
          </Button>
          <Button
            variant={currentView === 'posterior' ? 'default' : 'outline'}
            onClick={() => setCurrentView('posterior')}
            size="sm"
          >
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView(currentView === 'anterior' ? 'posterior' : 'anterior')}
            title="Flip view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Gender Toggle */}
        <div className="flex gap-1 border-l pl-2 ml-2">
          <Button
            variant={gender === 'male' ? 'default' : 'outline'}
            onClick={() => setGender('male')}
            size="sm"
            title="Male body"
            className="text-xs px-2"
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="14" r="5" />
              <path d="M19 5l-5.4 5.4M19 5h-5M19 5v5" />
            </svg>
            Male
          </Button>
          <Button
            variant={gender === 'female' ? 'default' : 'outline'}
            onClick={() => setGender('female')}
            size="sm"
            title="Female body"
            className="text-xs px-2"
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="5" />
              <path d="M12 13v8M9 18h6" />
            </svg>
            Female
          </Button>
        </div>
      </div>

      {/* Body Diagram */}
      <div className="relative flex justify-center" style={{ minHeight: '500px' }}>
        {/* Left/Right Labels - These show PATIENT's left/right */}
        {/* For FRONT view: Patient faces you, so their RIGHT is on YOUR left */}
        {/* For BACK view: You're behind them, so their LEFT is on YOUR left */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-xs font-bold text-blue-600 z-10">
          <span className="bg-blue-50 px-2 py-1 rounded border border-blue-200">
            {currentView === 'anterior' ? 'R' : 'L'}
          </span>
          <span className="text-[10px] text-blue-500 font-medium">
            {currentView === 'anterior' ? 'Right' : 'Left'}
          </span>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-xs font-bold text-blue-600 z-10">
          <span className="bg-blue-50 px-2 py-1 rounded border border-blue-200">
            {currentView === 'anterior' ? 'L' : 'R'}
          </span>
          <span className="text-[10px] text-blue-500 font-medium">
            {currentView === 'anterior' ? 'Left' : 'Right'}
          </span>
        </div>

        <Body
          data={bodyData}
          side={librarySide}
          gender={gender}
          scale={1.2}
          colors={['#fbbf24', '#f97316', '#ef4444']} // Yellow, Orange, Red for intensity
          onBodyPartPress={handleBodyPartPress}
          border="#d1d5db"
          defaultFill="#3f3f3f"
          defaultStroke="#2f2f2f"
          defaultStrokeWidth={0.5}
        />

        {/* Selected region indicator */}
        {isAnnotating && pendingRegionName && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="capitalize">{pendingRegionName}</span>
          </div>
        )}

        {/* View indicator at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-t-lg">
          {currentView === 'anterior' ? 'Front View (facing you)' : 'Back View (facing away)'}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 justify-center">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: PENDING_HIGHLIGHT_COLOR }} />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }} />
          <span>Mild (1-3)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} />
          <span>Moderate (4-6)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span>Severe (7-10)</span>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-sm text-gray-500 text-center max-w-md">
        Tap on any muscle to mark pain. Left and right sides can be marked separately.
      </p>

      {/* Marker count */}
      {markers.length > 0 && (
        <p className="text-sm text-gray-600">
          {markers.length} pain point{markers.length !== 1 ? 's' : ''} marked on {currentView === 'anterior' ? 'front' : 'back'} view
        </p>
      )}
    </div>
  );
}
