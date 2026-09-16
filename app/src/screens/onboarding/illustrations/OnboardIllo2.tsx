import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { colors, typography } from '../../../theme';

// Ported from Dhan App 2/screens-onboarding.jsx's OnboardIllo2 — the
// 50/30/20 donut. Arc paths and geometry are unchanged; colors and the
// Poppins weight come from the theme instead of CSS custom properties /
// fontWeight (the RN font is loaded as distinct weight files — see
// src/theme/index.ts).
const VIEWBOX_WIDTH = 300;
const VIEWBOX_HEIGHT = 260;

const SOFT_NAVY = colors.navy80; // 50% — needs
const SOFT_GOLD = colors.goldSoft; // 30% — wants
const SAGE = colors.income; // 20% — savings

export interface IlloProps {
  width: number;
}

function OnboardIllo2({ width }: IlloProps) {
  const height = width * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}>
      <Circle cx={150} cy={130} r={90} fill={colors.bgSurface} />
      <Circle cx={150} cy={130} r={70} fill="none" stroke={colors.borderSubtle} strokeWidth={18} />

      {/* 50% — soft navy */}
      <Path d="M150 60 A70 70 0 1 1 150 200" fill="none" stroke={SOFT_NAVY} strokeWidth={18} strokeLinecap="butt" />
      {/* 30% — soft gold */}
      <Path
        d="M150 200 A70 70 0 0 1 83.42 108.37"
        fill="none"
        stroke={SOFT_GOLD}
        strokeWidth={18}
        strokeLinecap="butt"
      />
      {/* 20% — sage */}
      <Path d="M83.42 108.37 A70 70 0 0 1 150 60" fill="none" stroke={SAGE} strokeWidth={18} strokeLinecap="butt" />

      {/* Centre label */}
      <SvgText
        x={150}
        y={128}
        textAnchor="middle"
        fontFamily={typography.family.semibold}
        fontSize={20}
        fill={colors.navy}
        letterSpacing={-0.4}
      >
        50/30/20
      </SvgText>
      <SvgText
        x={150}
        y={148}
        textAnchor="middle"
        fontFamily={typography.family.semibold}
        fontSize={11}
        fill={colors.fg3}
        letterSpacing={0.88}
      >
        BUDGET
      </SvgText>

      {/* Legend chips */}
      <G fontFamily={typography.family.semibold} fontSize={11}>
        <Circle cx={52} cy={240} r={5} fill={SOFT_NAVY} />
        <SvgText x={62} y={244} fill={colors.navy}>
          Needs 50%
        </SvgText>
        <Circle cx={140} cy={240} r={5} fill={SOFT_GOLD} />
        <SvgText x={150} y={244} fill={colors.navy}>
          Wants 30%
        </SvgText>
        <Circle cx={222} cy={240} r={5} fill={SAGE} />
        <SvgText x={232} y={244} fill={colors.navy}>
          Save 20%
        </SvgText>
      </G>
    </Svg>
  );
}

export default OnboardIllo2;
