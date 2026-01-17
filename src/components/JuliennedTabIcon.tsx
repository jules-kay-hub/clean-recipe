// src/components/JuliennedTabIcon.tsx
// Stroke-based brand icon for tab bar - simplified diagonal knife cuts

import React from 'react';
import Svg, { Line, G } from 'react-native-svg';

interface JuliennedTabIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function JuliennedTabIcon({
  size = 22,
  color = '#000',
  strokeWidth = 1.5
}: JuliennedTabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
        <Line x1="6" y1="18" x2="18" y2="6" />
        <Line x1="4" y1="14" x2="14" y2="4" />
        <Line x1="10" y1="20" x2="20" y2="10" />
      </G>
    </Svg>
  );
}
