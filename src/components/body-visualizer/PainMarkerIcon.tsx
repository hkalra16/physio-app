'use client';

import { PainMarker, PainType } from '@/lib/types';

interface PainMarkerIconProps {
  marker: PainMarker;
  onClick?: () => void;
  isSelected?: boolean;
}

const painTypeColors: Record<PainType, { bg: string; border: string; pulse: string }> = {
  point: { bg: '#ef4444', border: '#dc2626', pulse: '#fecaca' },
  radiating: { bg: '#f97316', border: '#ea580c', pulse: '#fed7aa' },
  diffuse: { bg: '#eab308', border: '#ca8a04', pulse: '#fef08a' },
  referred: { bg: '#8b5cf6', border: '#7c3aed', pulse: '#ddd6fe' }
};

const intensityToSize = (intensity: number): number => {
  // Scale from 12 to 24 based on intensity 1-10
  return 12 + (intensity / 10) * 12;
};

export default function PainMarkerIcon({ marker, onClick, isSelected }: PainMarkerIconProps) {
  const colors = painTypeColors[marker.painType];
  const size = intensityToSize(marker.intensity);
  const halfSize = size / 2;

  return (
    <g
      transform={`translate(${marker.position.x}, ${marker.position.y})`}
      onClick={onClick}
      className="cursor-pointer"
      style={{ pointerEvents: 'all' }}
    >
      {/* Pulse animation for high intensity */}
      {marker.intensity >= 7 && (
        <circle
          r={halfSize + 8}
          fill={colors.pulse}
          opacity="0.5"
          className="animate-ping"
        />
      )}

      {/* Spread area for diffuse/radiating pain */}
      {(marker.painType === 'diffuse' || marker.painType === 'radiating') && marker.spreadArea && (
        <ellipse
          rx={(marker.spreadArea.radiusX || 30)}
          ry={(marker.spreadArea.radiusY || 20)}
          fill={colors.bg}
          opacity="0.3"
          stroke={colors.border}
          strokeWidth="1"
          strokeDasharray="4 2"
        />
      )}

      {/* Main marker */}
      <circle
        r={halfSize}
        fill={colors.bg}
        stroke={isSelected ? '#1f2937' : colors.border}
        strokeWidth={isSelected ? 3 : 2}
      />

      {/* Radiating lines for radiating pain */}
      {marker.painType === 'radiating' && (
        <g stroke={colors.border} strokeWidth="1.5" opacity="0.7">
          <line x1="0" y1={-halfSize - 5} x2="0" y2={-halfSize - 15} />
          <line x1={halfSize + 5} y1="0" x2={halfSize + 15} y2="0" />
          <line x1="0" y1={halfSize + 5} x2="0" y2={halfSize + 15} />
          <line x1={-halfSize - 5} y1="0" x2={-halfSize - 15} y2="0" />
        </g>
      )}

      {/* Referred pain arrow */}
      {marker.painType === 'referred' && (
        <path
          d={`M ${halfSize + 5} 0 L ${halfSize + 15} -5 L ${halfSize + 15} 5 Z`}
          fill={colors.border}
        />
      )}

      {/* Intensity number */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={size * 0.5}
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {marker.intensity}
      </text>
    </g>
  );
}
