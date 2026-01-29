import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export type WeatherIconKind =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'showers'
  | 'snow-showers'
  | 'thunderstorm'
  | 'unknown';

/** Map WMO weather code to icon kind for vector rendering. */
export function weatherCodeToIconKind(code: number): WeatherIconKind {
  if (code === 0) return 'clear';
  if (code === 1) return 'partly-cloudy';
  if (code === 2) return 'partly-cloudy';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 55) return 'drizzle';
  if (code >= 61 && code <= 65) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'showers';
  if (code >= 85 && code <= 86) return 'snow-showers';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return 'unknown';
}

interface WeatherIconProps {
  code: number | null;
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 32;
const VIEW_SIZE = 24;

export default function WeatherIcon({ code, size = DEFAULT_SIZE, color = '#333' }: WeatherIconProps) {
  const kind = code != null ? weatherCodeToIconKind(code) : 'unknown';

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}>
      {kind === 'clear' && <IconClear color={color} />}
      {kind === 'partly-cloudy' && <IconPartlyCloudy color={color} />}
      {kind === 'cloudy' && <IconCloud color={color} />}
      {kind === 'overcast' && <IconOvercast color={color} />}
      {kind === 'fog' && <IconFog color={color} />}
      {kind === 'drizzle' && <IconDrizzle color={color} />}
      {kind === 'rain' && <IconRain color={color} />}
      {kind === 'snow' && <IconSnow color={color} />}
      {kind === 'showers' && <IconShowers color={color} />}
      {kind === 'snow-showers' && <IconSnowShowers color={color} />}
      {kind === 'thunderstorm' && <IconThunderstorm color={color} />}
      {kind === 'unknown' && <IconUnknown color={color} />}
    </Svg>
  );
}

function IconClear({ color }: { color: string }) {
  return (
    <>
      <Circle cx={12} cy={10} r={4} fill={color} />
      <Path d="M12 2v2M12 18v2M4 10H2M22 10h-2M6.34 4.34l1.42 1.42M16.24 16.24l1.42 1.42M4.34 15.66l1.42-1.42M16.24 5.76l1.42-1.42" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </>
  );
}

function IconPartlyCloudy({ color }: { color: string }) {
  return (
    <>
      <Circle cx={8} cy={8} r={3} fill={color} />
      <Path d="M8 3v1.5M8 12.5v1M4.5 6.5H3M13 6.5h-1.5M5.76 4.24l1.06 1.06M10.18 8.66l1.06 1.06M4.24 7.76l1.06-1.06M10.18 2.32l1.06-1.06" stroke={color} strokeWidth={1} strokeLinecap="round" />
      <Path d="M18 14a4 4 0 0 0-6.5-3.2 3 3 0 0 0-4 2.7 2.5 2.5 0 0 0 1.5 4.5h9a2.5 2.5 0 0 0 0-5z" fill={color} opacity={0.9} />
    </>
  );
}

function IconCloud({ color }: { color: string }) {
  return (
    <Path d="M19 14a5 5 0 0 0-8.5-3.5 4 4 0 0 0-5.5 3 3.5 3.5 0 0 0 2 6.5h11a3.5 3.5 0 0 0 1-6.5z" fill={color} />
  );
}

function IconOvercast({ color }: { color: string }) {
  return (
    <Path d="M20 14a6 6 0 0 0-10-4.5 5 5 0 0 0-6.5 4 4 4 0 0 0 2.5 7.5h14a4 4 0 0 0 0-7z" fill={color} opacity={0.95} />
  );
}

function IconFog({ color }: { color: string }) {
  return (
    <>
      <Path d="M4 14h16M4 10h16M4 18h12" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />
      <Path d="M18 8a5 5 0 0 0-9-2 4 4 0 0 0-5 3h14a3 3 0 0 0 0-6z" fill={color} opacity={0.5} />
    </>
  );
}

function IconDrizzle({ color }: { color: string }) {
  return (
    <>
      <Path d="M19 12a5 5 0 0 0-8.5-3.5 4 4 0 0 0-5.5 3 3.5 3.5 0 0 0 2 6.5h11a3.5 3.5 0 0 0 1-6.5z" fill={color} opacity={0.9} />
      <Path d="M8 18v3M12 18v3M16 18v3" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </>
  );
}

function IconRain({ color }: { color: string }) {
  return (
    <>
      <Path d="M19 12a5 5 0 0 0-8.5-3.5 4 4 0 0 0-5.5 3 3.5 3.5 0 0 0 2 6.5h11a3.5 3.5 0 0 0 1-6.5z" fill={color} opacity={0.9} />
      <Path d="M7 17v4M11 19v4M15 17v4M19 19v4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </>
  );
}

function IconSnow({ color }: { color: string }) {
  return (
    <>
      <Path d="M19 11a5 5 0 0 0-8.5-3.5 4 4 0 0 0-5.5 3 3.5 3.5 0 0 0 2 6.5h11a3.5 3.5 0 0 0 1-6.5z" fill={color} opacity={0.9} />
      <Path d="M12 15l-1 2M12 15l1 2M12 15v-3M10 14l-2 1M14 14l2 1M10 16l-2-1M14 16l2-1" stroke={color} strokeWidth={1} strokeLinecap="round" />
    </>
  );
}

function IconShowers({ color }: { color: string }) {
  return (
    <>
      <Path d="M19 11a5 5 0 0 0-8.5-3.5 4 4 0 0 0-5.5 3 3.5 3.5 0 0 0 2 6.5h11a3.5 3.5 0 0 0 1-6.5z" fill={color} opacity={0.9} />
      <Path d="M6 18v3M10 17v4M14 18v3M18 17v4" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </>
  );
}

function IconSnowShowers({ color }: { color: string }) {
  return (
    <>
      <Path d="M19 11a5 5 0 0 0-8.5-3.5 4 4 0 0 0-5.5 3 3.5 3.5 0 0 0 2 6.5h11a3.5 3.5 0 0 0 1-6.5z" fill={color} opacity={0.9} />
      <Path d="M8 17l-0.5 1.5M12 16l0.5 1.5M16 17l-0.5 1.5M10 15l-1.5 0.5M14 15l1.5 0.5" stroke={color} strokeWidth={1} strokeLinecap="round" />
    </>
  );
}

function IconThunderstorm({ color }: { color: string }) {
  return (
    <>
      <Path d="M19 11a5 5 0 0 0-8.5-3.5 4 4 0 0 0-5.5 3 3.5 3.5 0 0 0 2 6.5h11a3.5 3.5 0 0 0 1-6.5z" fill={color} opacity={0.9} />
      <Path d="M13 11L10 16h3l-2 5 5-6h-3l2-5z" fill={color} />
    </>
  );
}

function IconUnknown({ color }: { color: string }) {
  return (
    <>
      <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={1.5} fill="none" />
      <Path d="M12 9v4M12 15.5v.5" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </>
  );
}
