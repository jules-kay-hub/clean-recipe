// src/components/JuliennedIcon.tsx
// Julienned app icon - diagonal knife cut lines on forest green gradient

import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Line,
  G,
} from 'react-native-svg';

interface JuliennedIconProps {
  size?: number;
}

export function JuliennedIcon({ size = 60 }: JuliennedIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Defs>
        <LinearGradient
          id="forestGreen"
          x1="0"
          y1="0"
          x2="60"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0%" stopColor="#2D6A4F" />
          <Stop offset="100%" stopColor="#1B4332" />
        </LinearGradient>
      </Defs>

      <Rect width="60" height="60" rx="13" fill="url(#forestGreen)" />

      <G transform="translate(13.5, 13.5) scale(0.55)">
        <G stroke="white" strokeWidth={3} strokeLinecap="round">
          <Line x1="4" y1="32" x2="32" y2="4" />
          <Line x1="8" y1="40" x2="40" y2="8" />
          <Line x1="12" y1="48" x2="48" y2="12" />
          <Line x1="20" y1="52" x2="52" y2="20" />
          <Line x1="28" y1="56" x2="56" y2="28" />
        </G>
      </G>
    </Svg>
  );
}
