// src/components/AppIcon.tsx
// Julienned app icon - Chef Knight Crest

import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface AppIconProps {
  size?: number;
}

export function AppIcon({ size = 32 }: AppIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Background circle - Linen */}
      <Circle cx="50" cy="50" r="48" fill="#F5F0EB" />

      {/* Shield shape - Forest Green */}
      <Path
        d="M50 8 Q72 8, 88 18 L88 52 Q88 75, 70 88 L50 98 L30 88 Q12 75, 12 52 L12 18 Q28 8, 50 8 Z"
        fill="#2D4A3E"
      />

      {/* Inner shield highlight */}
      <Path
        d="M50 14 Q68 14, 82 22 L82 50 Q82 70, 66 82 L50 90 L34 82 Q18 70, 18 50 L18 22 Q32 14, 50 14 Z"
        fill="none"
        stroke="#4A7A6A"
        strokeWidth={2}
      />

      {/* Simplified knife blade */}
      <Path
        d="M50 20 L56 26 L56 62 L50 68 L44 62 L44 26 Z"
        fill="#E8E8E8"
      />
      <Path
        d="M50 20 L53 24 L53 60 L50 65 L50 20Z"
        fill="#F8F8F8"
      />

      {/* Knife handle */}
      <Rect x="46" y="68" width="8" height="18" rx="2" fill="#2D4A3E" />

      {/* Copper rivet */}
      <Circle cx="50" cy="77" r="2" fill="#B87333" />

      {/* Copper banner accent at bottom */}
      <Path
        d="M25 82 Q38 78, 50 80 Q62 78, 75 82 L75 88 Q62 84, 50 86 Q38 84, 25 88 Z"
        fill="#B87333"
      />
    </Svg>
  );
}
