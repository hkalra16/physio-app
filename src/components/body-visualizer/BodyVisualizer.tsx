'use client';

import { useState, useEffect } from 'react';
import { usePainStore } from '@/store/painStore';
import BodySvg from './BodySvg';
import PainMarkerIcon from './PainMarkerIcon';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function BodyVisualizer() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Subscribe to the store with individual selectors for better reactivity
  const currentView = usePainStore((state) => state.currentView);
  const setCurrentView = usePainStore((state) => state.setCurrentView);
  const currentSession = usePainStore((state) => state.currentSession);
  const selectedMarkerId = usePainStore((state) => state.selectedMarkerId);
  const selectMarker = usePainStore((state) => state.selectMarker);
  const startAnnotation = usePainStore((state) => state.startAnnotation);
  const isAnnotating = usePainStore((state) => state.isAnnotating);
  const pendingMarkerPosition = usePainStore((state) => state.pendingMarkerPosition);

  // Handle hydration for Zustand persist
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Get markers for current view - ensure we re-render when session changes
  const markers = isHydrated && currentSession?.painMarkers
    ? currentSession.painMarkers.filter(m => m.bodyView === currentView)
    : [];
  const highlightedRegions = markers.map(m => m.region);

  // Debug logging
  useEffect(() => {
    console.log('BodyVisualizer render:', {
      isHydrated,
      currentView,
      painMarkersCount: currentSession?.painMarkers?.length || 0,
      filteredMarkersCount: markers.length,
      markers: markers.map(m => ({ id: m.id, region: m.region, position: m.position }))
    });
  }, [isHydrated, currentView, currentSession?.painMarkers, markers]);

  const handleRegionClick = (regionId: string, x: number, y: number) => {
    startAnnotation(x, y, regionId);
  };

  const handleMarkerClick = (markerId: string) => {
    selectMarker(markerId === selectedMarkerId ? null : markerId);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* View Toggle */}
      <div className="flex gap-2">
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

      {/* Body SVG with Markers */}
      <div className="relative">
        <svg viewBox="0 0 300 760" className="w-full max-w-md" style={{ maxHeight: '70vh' }}>
          {/* Background and regions from BodySvg */}
          <BodySvgContent
            view={currentView}
            onRegionClick={handleRegionClick}
            highlightedRegions={highlightedRegions}
          />

          {/* Pain markers overlay */}
          {markers.map((marker) => (
            <PainMarkerIcon
              key={marker.id}
              marker={marker}
              isSelected={marker.id === selectedMarkerId}
              onClick={() => handleMarkerClick(marker.id)}
            />
          ))}

          {/* Pending marker indicator - shows where user clicked before submitting */}
          {isAnnotating && pendingMarkerPosition && (
            <g transform={`translate(${pendingMarkerPosition.x}, ${pendingMarkerPosition.y})`}>
              {/* Outer pulsing ring */}
              <circle
                r="20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                opacity="0.5"
                className="animate-ping"
              />
              {/* Inner indicator */}
              <circle
                r="10"
                fill="#3b82f6"
                opacity="0.7"
                stroke="#1d4ed8"
                strokeWidth="2"
              />
              {/* Center dot */}
              <circle
                r="3"
                fill="white"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Instructions */}
      <p className="text-sm text-gray-500 text-center max-w-md">
        Click on any body region to mark where you feel pain.
        You can add multiple pain points and describe each one.
      </p>

      {/* Marker count */}
      {markers.length > 0 && (
        <p className="text-sm text-gray-600">
          {markers.length} pain point{markers.length !== 1 ? 's' : ''} marked on {currentView} view
        </p>
      )}
    </div>
  );
}

// Inline SVG content component to avoid nesting SVGs
function BodySvgContent({
  view,
  onRegionClick,
  highlightedRegions = []
}: {
  view: 'anterior' | 'posterior';
  onRegionClick: (regionId: string, x: number, y: number) => void;
  highlightedRegions?: string[];
}) {
  // ANTERIOR (Front) VIEW - Mirror image convention
  // When looking at someone from the front, THEIR right side appears on YOUR left
  // Screen left (x < 150) = Patient's RIGHT side
  // Screen right (x > 150) = Patient's LEFT side
  const anteriorRegions = [
    { id: 'head', name: 'Head', path: 'M150,10 C180,10 200,30 200,60 C200,90 180,110 150,110 C120,110 100,90 100,60 C100,30 120,10 150,10' },
    { id: 'neck-anterior', name: 'Neck', path: 'M130,110 L170,110 L175,140 L125,140 Z' },
    // Screen left = Patient's RIGHT shoulder
    { id: 'shoulder-right-anterior', name: 'Right Shoulder', path: 'M60,140 C40,145 25,160 25,180 L60,180 L80,155 L80,140 Z' },
    // Screen right = Patient's LEFT shoulder
    { id: 'shoulder-left-anterior', name: 'Left Shoulder', path: 'M240,140 C260,145 275,160 275,180 L240,180 L220,155 L220,140 Z' },
    { id: 'chest-right', name: 'Right Chest', path: 'M80,140 L125,140 L125,200 L80,220 L60,180 Z' },
    { id: 'chest-center', name: 'Center Chest', path: 'M125,140 L175,140 L175,200 L150,210 L125,200 Z' },
    { id: 'chest-left', name: 'Left Chest', path: 'M175,140 L220,140 L240,180 L220,220 L175,200 Z' },
    { id: 'upper-arm-right-anterior', name: 'Right Upper Arm', path: 'M25,180 L60,180 L55,260 L20,260 Z' },
    { id: 'upper-arm-left-anterior', name: 'Left Upper Arm', path: 'M240,180 L275,180 L280,260 L245,260 Z' },
    { id: 'forearm-right-anterior', name: 'Right Forearm', path: 'M20,260 L55,260 L50,350 L15,350 Z' },
    { id: 'forearm-left-anterior', name: 'Left Forearm', path: 'M245,260 L280,260 L285,350 L250,350 Z' },
    { id: 'hand-right', name: 'Right Hand', path: 'M15,350 L50,350 L55,400 L10,400 Z' },
    { id: 'hand-left', name: 'Left Hand', path: 'M250,350 L285,350 L290,400 L245,400 Z' },
    { id: 'abdomen-upper', name: 'Upper Abdomen', path: 'M95,210 L205,210 L205,270 L95,270 Z' },
    { id: 'abdomen-right', name: 'Right Abdomen', path: 'M80,220 L95,210 L95,320 L80,320 Z' },
    { id: 'abdomen-left', name: 'Left Abdomen', path: 'M205,210 L220,220 L220,320 L205,320 Z' },
    { id: 'abdomen-lower', name: 'Lower Abdomen', path: 'M95,270 L205,270 L205,340 L95,340 Z' },
    { id: 'hip-right-anterior', name: 'Right Hip', path: 'M80,320 L125,340 L125,380 L70,380 Z' },
    { id: 'hip-left-anterior', name: 'Left Hip', path: 'M175,340 L220,320 L230,380 L175,380 Z' },
    { id: 'thigh-right-anterior', name: 'Right Thigh', path: 'M70,380 L125,380 L120,500 L75,500 Z' },
    { id: 'thigh-right-inner', name: 'Right Inner Thigh', path: 'M125,380 L150,400 L145,500 L120,500 Z' },
    { id: 'thigh-left-inner', name: 'Left Inner Thigh', path: 'M150,400 L175,380 L180,500 L155,500 Z' },
    { id: 'thigh-left-anterior', name: 'Left Thigh', path: 'M175,380 L230,380 L225,500 L180,500 Z' },
    { id: 'knee-right-anterior', name: 'Right Knee', path: 'M75,500 L145,500 L140,550 L80,550 Z' },
    { id: 'knee-left-anterior', name: 'Left Knee', path: 'M155,500 L225,500 L220,550 L160,550 Z' },
    { id: 'shin-right', name: 'Right Shin', path: 'M80,550 L140,550 L135,680 L85,680 Z' },
    { id: 'shin-left', name: 'Left Shin', path: 'M160,550 L220,550 L215,680 L165,680 Z' },
    { id: 'ankle-right', name: 'Right Ankle', path: 'M85,680 L135,680 L130,710 L90,710 Z' },
    { id: 'ankle-left', name: 'Left Ankle', path: 'M165,680 L215,680 L210,710 L170,710 Z' },
    { id: 'foot-right', name: 'Right Foot', path: 'M90,710 L130,710 L135,750 L85,750 Z' },
    { id: 'foot-left', name: 'Left Foot', path: 'M170,710 L210,710 L215,750 L165,750 Z' }
  ];

  // POSTERIOR (Back) VIEW - Looking at someone's back
  // Their left side is on YOUR left, their right side is on YOUR right
  // Screen left (x < 150) = Patient's LEFT side
  // Screen right (x > 150) = Patient's RIGHT side
  const posteriorRegions = [
    { id: 'head', name: 'Head', path: 'M150,10 C180,10 200,30 200,60 C200,90 180,110 150,110 C120,110 100,90 100,60 C100,30 120,10 150,10' },
    { id: 'neck-posterior', name: 'Neck', path: 'M130,110 L170,110 L175,140 L125,140 Z' },
    // Screen left = Patient's LEFT shoulder (back view)
    { id: 'shoulder-left-posterior', name: 'Left Shoulder', path: 'M60,140 C40,145 25,160 25,180 L60,180 L80,155 L80,140 Z' },
    // Screen right = Patient's RIGHT shoulder (back view)
    { id: 'shoulder-right-posterior', name: 'Right Shoulder', path: 'M240,140 C260,145 275,160 275,180 L240,180 L220,155 L220,140 Z' },
    { id: 'upper-back-left', name: 'Left Upper Back', path: 'M80,140 L125,140 L125,220 L80,220 L60,180 Z' },
    { id: 'upper-back-center', name: 'Center Upper Back', path: 'M125,140 L175,140 L175,220 L125,220 Z' },
    { id: 'upper-back-right', name: 'Right Upper Back', path: 'M175,140 L220,140 L240,180 L220,220 L175,220 Z' },
    { id: 'upper-arm-left-posterior', name: 'Left Upper Arm', path: 'M25,180 L60,180 L55,260 L20,260 Z' },
    { id: 'upper-arm-right-posterior', name: 'Right Upper Arm', path: 'M240,180 L275,180 L280,260 L245,260 Z' },
    { id: 'forearm-left-posterior', name: 'Left Forearm', path: 'M20,260 L55,260 L50,350 L15,350 Z' },
    { id: 'forearm-right-posterior', name: 'Right Forearm', path: 'M245,260 L280,260 L285,350 L250,350 Z' },
    { id: 'hand-left', name: 'Left Hand', path: 'M15,350 L50,350 L55,400 L10,400 Z' },
    { id: 'hand-right', name: 'Right Hand', path: 'M250,350 L285,350 L290,400 L245,400 Z' },
    { id: 'lower-back-left', name: 'Left Lower Back', path: 'M80,220 L125,220 L125,320 L80,320 Z' },
    { id: 'lower-back-center', name: 'Center Lower Back', path: 'M125,220 L175,220 L175,320 L125,320 Z' },
    { id: 'lower-back-right', name: 'Right Lower Back', path: 'M175,220 L220,220 L220,320 L175,320 Z' },
    { id: 'glute-left', name: 'Left Glute', path: 'M80,320 L150,340 L150,400 L70,400 Z' },
    { id: 'glute-right', name: 'Right Glute', path: 'M150,340 L220,320 L230,400 L150,400 Z' },
    { id: 'thigh-left-posterior', name: 'Left Hamstring', path: 'M70,400 L150,400 L145,520 L75,520 Z' },
    { id: 'thigh-right-posterior', name: 'Right Hamstring', path: 'M150,400 L230,400 L225,520 L155,520 Z' },
    { id: 'knee-left-posterior', name: 'Left Knee', path: 'M75,520 L145,520 L140,560 L80,560 Z' },
    { id: 'knee-right-posterior', name: 'Right Knee', path: 'M155,520 L225,520 L220,560 L160,560 Z' },
    { id: 'calf-left', name: 'Left Calf', path: 'M80,560 L140,560 L135,680 L85,680 Z' },
    { id: 'calf-right', name: 'Right Calf', path: 'M160,560 L220,560 L215,680 L165,680 Z' },
    { id: 'ankle-left', name: 'Left Ankle', path: 'M85,680 L135,680 L130,710 L90,710 Z' },
    { id: 'ankle-right', name: 'Right Ankle', path: 'M165,680 L215,680 L210,710 L170,710 Z' },
    { id: 'foot-left', name: 'Left Foot', path: 'M90,710 L130,710 L135,750 L85,750 Z' },
    { id: 'foot-right', name: 'Right Foot', path: 'M170,710 L210,710 L215,750 L165,750 Z' }
  ];

  const regions = view === 'anterior' ? anteriorRegions : posteriorRegions;

  const muscleDetails = view === 'anterior'
    ? [
        'M90,160 Q110,180 125,185',
        'M210,160 Q190,180 175,185',
        'M150,220 L150,330',
        'M120,230 L120,320',
        'M180,230 L180,320',
        'M100,250 L200,250',
        'M105,280 L195,280',
        'M110,310 L190,310',
        'M100,400 Q110,450 100,490',
        'M200,400 Q190,450 200,490',
      ]
    : [
        'M125,150 Q150,170 175,150',
        'M90,180 Q100,200 95,220',
        'M210,180 Q200,200 205,220',
        'M150,150 L150,320',
        'M100,350 Q120,380 110,400',
        'M200,350 Q180,380 190,400',
        'M110,420 L110,500',
        'M190,420 L190,500',
      ];

  const handleClick = (e: React.MouseEvent<SVGPathElement>, regionId: string) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const svgPoint = point.matrixTransform(ctm.inverse());
    onRegionClick(regionId, svgPoint.x, svgPoint.y);
  };

  return (
    <>
      {/* Defs */}
      <defs>
        <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fce4d6" />
          <stop offset="100%" stopColor="#e8d4c4" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Muscle detail lines */}
      <g className="muscle-details" stroke="#b88888" strokeWidth="1" fill="none" opacity="0.4">
        {muscleDetails.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* Clickable regions */}
      {regions.map((region) => {
        const isHighlighted = highlightedRegions.includes(region.id);
        return (
          <path
            key={region.id}
            d={region.path}
            className={`cursor-pointer transition-all duration-200 ${
              isHighlighted
                ? 'fill-red-200 stroke-red-400'
                : 'fill-[#e8d4c4] hover:fill-[#d4c4b4] stroke-[#c4b4a4]'
            }`}
            strokeWidth="1"
            onClick={(e) => handleClick(e, region.id)}
            filter="url(#shadow)"
          >
            <title>{region.name}</title>
          </path>
        );
      })}

      {/* Left/Right Labels */}
      {/* Note: For anterior (front) view, left side of body appears on RIGHT side of screen (mirror view) */}
      {/* For posterior (back) view, left side of body appears on LEFT side of screen */}
      <g className="side-labels">
        {view === 'anterior' ? (
          <>
            {/* Front view - mirror image (patient facing you) */}
            <text x="35" y="130" textAnchor="middle" className="fill-blue-600 text-xs font-bold">
              R
            </text>
            <text x="265" y="130" textAnchor="middle" className="fill-blue-600 text-xs font-bold">
              L
            </text>
            {/* Additional labels near hands for clarity */}
            <text x="30" y="420" textAnchor="middle" className="fill-blue-500 text-[10px] font-medium">
              Right
            </text>
            <text x="270" y="420" textAnchor="middle" className="fill-blue-500 text-[10px] font-medium">
              Left
            </text>
          </>
        ) : (
          <>
            {/* Back view - as if looking at someone's back */}
            <text x="35" y="130" textAnchor="middle" className="fill-blue-600 text-xs font-bold">
              L
            </text>
            <text x="265" y="130" textAnchor="middle" className="fill-blue-600 text-xs font-bold">
              R
            </text>
            {/* Additional labels near hands for clarity */}
            <text x="30" y="420" textAnchor="middle" className="fill-blue-500 text-[10px] font-medium">
              Left
            </text>
            <text x="270" y="420" textAnchor="middle" className="fill-blue-500 text-[10px] font-medium">
              Right
            </text>
          </>
        )}
      </g>

      {/* View label */}
      <text x="150" y="770" textAnchor="middle" className="fill-gray-500 text-xs font-medium">
        {view === 'anterior' ? 'Front View' : 'Back View'}
      </text>
    </>
  );
}
