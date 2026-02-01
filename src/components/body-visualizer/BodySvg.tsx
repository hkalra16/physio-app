'use client';

import { BodyView } from '@/lib/types';

interface BodySvgProps {
  view: BodyView;
  onRegionClick: (regionId: string, x: number, y: number) => void;
  highlightedRegions?: string[];
  className?: string;
}

// Body region paths - anatomical muscular style
const anteriorRegions = [
  // Head
  { id: 'head', name: 'Head', path: 'M150,10 C180,10 200,30 200,60 C200,90 180,110 150,110 C120,110 100,90 100,60 C100,30 120,10 150,10' },

  // Neck
  { id: 'neck-anterior', name: 'Neck', path: 'M130,110 L170,110 L175,140 L125,140 Z' },

  // Shoulders
  { id: 'shoulder-left-anterior', name: 'Left Shoulder', path: 'M60,140 C40,145 25,160 25,180 L60,180 L80,155 L80,140 Z' },
  { id: 'shoulder-right-anterior', name: 'Right Shoulder', path: 'M240,140 C260,145 275,160 275,180 L240,180 L220,155 L220,140 Z' },

  // Chest
  { id: 'chest-left', name: 'Left Chest', path: 'M80,140 L125,140 L125,200 L80,220 L60,180 Z' },
  { id: 'chest-center', name: 'Center Chest', path: 'M125,140 L175,140 L175,200 L150,210 L125,200 Z' },
  { id: 'chest-right', name: 'Right Chest', path: 'M175,140 L220,140 L240,180 L220,220 L175,200 Z' },

  // Upper Arms
  { id: 'upper-arm-left-anterior', name: 'Left Upper Arm', path: 'M25,180 L60,180 L55,260 L20,260 Z' },
  { id: 'upper-arm-right-anterior', name: 'Right Upper Arm', path: 'M240,180 L275,180 L280,260 L245,260 Z' },

  // Forearms
  { id: 'forearm-left-anterior', name: 'Left Forearm', path: 'M20,260 L55,260 L50,350 L15,350 Z' },
  { id: 'forearm-right-anterior', name: 'Right Forearm', path: 'M245,260 L280,260 L285,350 L250,350 Z' },

  // Hands
  { id: 'hand-left', name: 'Left Hand', path: 'M15,350 L50,350 L55,400 L10,400 Z' },
  { id: 'hand-right', name: 'Right Hand', path: 'M250,350 L285,350 L290,400 L245,400 Z' },

  // Abdomen
  { id: 'abdomen-upper', name: 'Upper Abdomen', path: 'M95,210 L205,210 L205,270 L95,270 Z' },
  { id: 'abdomen-left', name: 'Left Abdomen', path: 'M80,220 L95,210 L95,320 L80,320 Z' },
  { id: 'abdomen-right', name: 'Right Abdomen', path: 'M205,210 L220,220 L220,320 L205,320 Z' },
  { id: 'abdomen-lower', name: 'Lower Abdomen', path: 'M95,270 L205,270 L205,340 L95,340 Z' },

  // Hips
  { id: 'hip-left-anterior', name: 'Left Hip', path: 'M80,320 L125,340 L125,380 L70,380 Z' },
  { id: 'hip-right-anterior', name: 'Right Hip', path: 'M175,340 L220,320 L230,380 L175,380 Z' },

  // Thighs
  { id: 'thigh-left-anterior', name: 'Left Thigh', path: 'M70,380 L125,380 L120,500 L75,500 Z' },
  { id: 'thigh-left-inner', name: 'Left Inner Thigh', path: 'M125,380 L150,400 L145,500 L120,500 Z' },
  { id: 'thigh-right-inner', name: 'Right Inner Thigh', path: 'M150,400 L175,380 L180,500 L155,500 Z' },
  { id: 'thigh-right-anterior', name: 'Right Thigh', path: 'M175,380 L230,380 L225,500 L180,500 Z' },

  // Knees
  { id: 'knee-left-anterior', name: 'Left Knee', path: 'M75,500 L145,500 L140,550 L80,550 Z' },
  { id: 'knee-right-anterior', name: 'Right Knee', path: 'M155,500 L225,500 L220,550 L160,550 Z' },

  // Lower Legs
  { id: 'shin-left', name: 'Left Shin', path: 'M80,550 L140,550 L135,680 L85,680 Z' },
  { id: 'shin-right', name: 'Right Shin', path: 'M160,550 L220,550 L215,680 L165,680 Z' },

  // Ankles
  { id: 'ankle-left', name: 'Left Ankle', path: 'M85,680 L135,680 L130,710 L90,710 Z' },
  { id: 'ankle-right', name: 'Right Ankle', path: 'M165,680 L215,680 L210,710 L170,710 Z' },

  // Feet
  { id: 'foot-left', name: 'Left Foot', path: 'M90,710 L130,710 L135,750 L85,750 Z' },
  { id: 'foot-right', name: 'Right Foot', path: 'M170,710 L210,710 L215,750 L165,750 Z' }
];

const posteriorRegions = [
  // Head
  { id: 'head', name: 'Head', path: 'M150,10 C180,10 200,30 200,60 C200,90 180,110 150,110 C120,110 100,90 100,60 C100,30 120,10 150,10' },

  // Neck
  { id: 'neck-posterior', name: 'Neck', path: 'M130,110 L170,110 L175,140 L125,140 Z' },

  // Shoulders
  { id: 'shoulder-left-posterior', name: 'Left Shoulder', path: 'M60,140 C40,145 25,160 25,180 L60,180 L80,155 L80,140 Z' },
  { id: 'shoulder-right-posterior', name: 'Right Shoulder', path: 'M240,140 C260,145 275,160 275,180 L240,180 L220,155 L220,140 Z' },

  // Upper Back
  { id: 'upper-back-left', name: 'Left Upper Back', path: 'M80,140 L125,140 L125,220 L80,220 L60,180 Z' },
  { id: 'upper-back-center', name: 'Center Upper Back', path: 'M125,140 L175,140 L175,220 L125,220 Z' },
  { id: 'upper-back-right', name: 'Right Upper Back', path: 'M175,140 L220,140 L240,180 L220,220 L175,220 Z' },

  // Upper Arms
  { id: 'upper-arm-left-posterior', name: 'Left Upper Arm', path: 'M25,180 L60,180 L55,260 L20,260 Z' },
  { id: 'upper-arm-right-posterior', name: 'Right Upper Arm', path: 'M240,180 L275,180 L280,260 L245,260 Z' },

  // Forearms
  { id: 'forearm-left-posterior', name: 'Left Forearm', path: 'M20,260 L55,260 L50,350 L15,350 Z' },
  { id: 'forearm-right-posterior', name: 'Right Forearm', path: 'M245,260 L280,260 L285,350 L250,350 Z' },

  // Hands
  { id: 'hand-left', name: 'Left Hand', path: 'M15,350 L50,350 L55,400 L10,400 Z' },
  { id: 'hand-right', name: 'Right Hand', path: 'M250,350 L285,350 L290,400 L245,400 Z' },

  // Lower Back
  { id: 'lower-back-left', name: 'Left Lower Back', path: 'M80,220 L125,220 L125,320 L80,320 Z' },
  { id: 'lower-back-center', name: 'Center Lower Back', path: 'M125,220 L175,220 L175,320 L125,320 Z' },
  { id: 'lower-back-right', name: 'Right Lower Back', path: 'M175,220 L220,220 L220,320 L175,320 Z' },

  // Glutes
  { id: 'glute-left', name: 'Left Glute', path: 'M80,320 L150,340 L150,400 L70,400 Z' },
  { id: 'glute-right', name: 'Right Glute', path: 'M150,340 L220,320 L230,400 L150,400 Z' },

  // Thighs
  { id: 'thigh-left-posterior', name: 'Left Hamstring', path: 'M70,400 L150,400 L145,520 L75,520 Z' },
  { id: 'thigh-right-posterior', name: 'Right Hamstring', path: 'M150,400 L230,400 L225,520 L155,520 Z' },

  // Knees
  { id: 'knee-left-posterior', name: 'Left Knee', path: 'M75,520 L145,520 L140,560 L80,560 Z' },
  { id: 'knee-right-posterior', name: 'Right Knee', path: 'M155,520 L225,520 L220,560 L160,560 Z' },

  // Calves
  { id: 'calf-left', name: 'Left Calf', path: 'M80,560 L140,560 L135,680 L85,680 Z' },
  { id: 'calf-right', name: 'Right Calf', path: 'M160,560 L220,560 L215,680 L165,680 Z' },

  // Ankles
  { id: 'ankle-left', name: 'Left Ankle', path: 'M85,680 L135,680 L130,710 L90,710 Z' },
  { id: 'ankle-right', name: 'Right Ankle', path: 'M165,680 L215,680 L210,710 L170,710 Z' },

  // Feet
  { id: 'foot-left', name: 'Left Foot', path: 'M90,710 L130,710 L135,750 L85,750 Z' },
  { id: 'foot-right', name: 'Right Foot', path: 'M170,710 L210,710 L215,750 L165,750 Z' }
];

// Muscle detail paths for visual effect
const muscleDetails = {
  anterior: [
    // Pec lines
    'M90,160 Q110,180 125,185',
    'M210,160 Q190,180 175,185',
    // Ab lines
    'M150,220 L150,330',
    'M120,230 L120,320',
    'M180,230 L180,320',
    'M100,250 L200,250',
    'M105,280 L195,280',
    'M110,310 L190,310',
    // Quad lines
    'M100,400 Q110,450 100,490',
    'M200,400 Q190,450 200,490',
  ],
  posterior: [
    // Trap lines
    'M125,150 Q150,170 175,150',
    // Lat lines
    'M90,180 Q100,200 95,220',
    'M210,180 Q200,200 205,220',
    // Spine line
    'M150,150 L150,320',
    // Glute lines
    'M100,350 Q120,380 110,400',
    'M200,350 Q180,380 190,400',
    // Hamstring lines
    'M110,420 L110,500',
    'M190,420 L190,500',
  ]
};

export default function BodySvg({ view, onRegionClick, highlightedRegions = [], className }: BodySvgProps) {
  const regions = view === 'anterior' ? anteriorRegions : posteriorRegions;
  const details = view === 'anterior' ? muscleDetails.anterior : muscleDetails.posterior;

  const handleClick = (e: React.MouseEvent<SVGPathElement>, regionId: string) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    onRegionClick(regionId, svgPoint.x, svgPoint.y);
  };

  return (
    <svg
      viewBox="0 0 300 760"
      className={className}
      style={{ maxHeight: '80vh' }}
    >
      {/* Background body outline */}
      <defs>
        <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fce4d6" />
          <stop offset="100%" stopColor="#e8d4c4" />
        </linearGradient>
        <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a5a5" />
          <stop offset="100%" stopColor="#c49494" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Muscle detail lines */}
      <g className="muscle-details" stroke="#b88888" strokeWidth="1" fill="none" opacity="0.4">
        {details.map((d, i) => (
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
                ? 'fill-red-300 stroke-red-500'
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

      {/* View label */}
      <text x="150" y="770" textAnchor="middle" className="fill-gray-500 text-sm font-medium">
        {view === 'anterior' ? 'Front View' : 'Back View'}
      </text>
    </svg>
  );
}
