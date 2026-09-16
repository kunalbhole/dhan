import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../../theme';

// Ported from Dhan App 2/screens-onboarding.jsx's OnboardIllo1 — a mock
// transaction list (var(--cat-*) swatches → theme colors, geometry as-is).
const VIEWBOX_WIDTH = 300;
const VIEWBOX_HEIGHT = 260;

export interface IlloProps {
  width: number;
}

function OnboardIllo1({ width }: IlloProps) {
  const height = width * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}>
      <Rect x={30} y={30} width={240} height={200} rx={20} fill={colors.bgSurface} />

      <Rect x={58} y={58} width={184} height={40} rx={10} fill={colors.bgBase} stroke={colors.borderDefault} />
      <Circle cx={78} cy={78} r={12} fill={colors.catFood} />
      <Rect x={98} y={70} width={70} height={6} rx={3} fill={colors.navy} />
      <Rect x={98} y={82} width={40} height={5} rx={2.5} fill={colors.fg4} />
      <Rect x={208} y={72} width={26} height={12} rx={3} fill={colors.navy} />

      <Rect x={58} y={108} width={184} height={40} rx={10} fill={colors.bgBase} stroke={colors.borderDefault} />
      <Circle cx={78} cy={128} r={12} fill={colors.catTransport} />
      <Rect x={98} y={120} width={50} height={6} rx={3} fill={colors.navy} />
      <Rect x={98} y={132} width={55} height={5} rx={2.5} fill={colors.fg4} />
      <Rect x={210} y={122} width={24} height={12} rx={3} fill={colors.navy} />

      <Rect x={58} y={158} width={184} height={40} rx={10} fill={colors.bgBase} stroke={colors.borderDefault} />
      <Circle cx={78} cy={178} r={12} fill={colors.income} />
      <Rect x={98} y={170} width={60} height={6} rx={3} fill={colors.navy} />
      <Rect x={98} y={182} width={45} height={5} rx={2.5} fill={colors.fg4} />
      <Rect x={204} y={172} width={30} height={12} rx={3} fill={colors.income} />

      {/* message bubble */}
      <Circle cx={240} cy={40} r={26} fill={colors.gold} />
      <Path d="M230 38 h20 M230 44 h14" stroke={colors.navy} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default OnboardIllo1;
