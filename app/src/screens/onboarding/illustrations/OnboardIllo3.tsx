import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../../theme';

// Ported from Dhan App 2/screens-onboarding.jsx's OnboardIllo3 — mock
// bill/reminder rows + a bell.
const VIEWBOX_WIDTH = 300;
const VIEWBOX_HEIGHT = 260;

export interface IlloProps {
  width: number;
}

function OnboardIllo3({ width }: IlloProps) {
  const height = width * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}>
      <Rect x={60} y={40} width={180} height={180} rx={22} fill={colors.bgSurface} />

      <Rect x={80} y={62} width={140} height={36} rx={10} fill={colors.bgBase} stroke={colors.borderDefault} />
      <Circle cx={96} cy={80} r={8} fill={colors.warning} />
      <Rect x={112} y={74} width={68} height={5} rx={2.5} fill={colors.navy} />
      <Rect x={112} y={84} width={48} height={4} rx={2} fill={colors.fg4} />

      <Rect x={80} y={106} width={140} height={36} rx={10} fill={colors.bgBase} stroke={colors.borderDefault} />
      <Circle cx={96} cy={124} r={8} fill={colors.expense} />
      <Rect x={112} y={118} width={80} height={5} rx={2.5} fill={colors.navy} />
      <Rect x={112} y={128} width={56} height={4} rx={2} fill={colors.fg4} />

      <Rect x={80} y={150} width={140} height={36} rx={10} fill={colors.bgBase} stroke={colors.borderDefault} />
      <Circle cx={96} cy={168} r={8} fill={colors.income} />
      <Rect x={112} y={162} width={60} height={5} rx={2.5} fill={colors.navy} />
      <Rect x={112} y={172} width={74} height={4} rx={2} fill={colors.fg4} />

      {/* bell */}
      <Circle cx={232} cy={56} r={20} fill={colors.gold} />
      <Path d="M225 52 q7 -10 14 0 v8 h-14 z M229 64 q3 4 6 0" fill={colors.navy} />
    </Svg>
  );
}

export default OnboardIllo3;
