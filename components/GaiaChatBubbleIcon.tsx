import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { colors } from '../constants/theme';

type Props = {
  size?: number;
};

/**
 * Smiling sun (from logo) + chat/speech bubble below — for the AI buddy FAB.
 * Replaces the calendar-with-check motif with a chat icon.
 */
const WHITE = colors.onPrimary;

export default function GaiaChatBubbleIcon({ size = 48 }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        {/* Sun circle */}
        <Circle cx={24} cy={18} r={9} fill={WHITE} stroke={WHITE} strokeWidth={1} />
        {/* Smile */}
        <G stroke={WHITE} strokeWidth={1.2} strokeLinecap="round" fill="none">
          <Path d="M 18 20 Q 24 26 30 20" />
        </G>
        {/* Chat bubble below: rounded rect with small tail */}
        <Path
          d="M 14 30 H 34 A 4 4 0 0 1 38 34 V 40 A 4 4 0 0 1 34 44 H 26 L 24 46 L 22 44 H 14 A 4 4 0 0 1 10 40 V 34 A 4 4 0 0 1 14 30 Z"
          fill={WHITE}
          stroke={WHITE}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}
