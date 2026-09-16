import type { ReactNode } from 'react';
import { View } from 'react-native';
import AppText from './AppText';
import { colors, radii } from '../theme';

export type StatusPillTone = 'info' | 'income' | 'expense' | 'warning' | 'neutral';

const TONES: Record<StatusPillTone, { bg: string; fg: string }> = {
  info: { bg: colors.infoBg, fg: colors.info },
  income: { bg: colors.incomeBg, fg: colors.income },
  expense: { bg: colors.expenseBg, fg: colors.expense },
  warning: { bg: colors.warningBg, fg: colors.warning },
  neutral: { bg: colors.bgSurface, fg: colors.fg2 },
};

export interface StatusPillProps {
  tone?: StatusPillTone;
  children: ReactNode;
}

function StatusPill({ tone = 'info', children }: StatusPillProps) {
  const t = TONES[tone];
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 2, borderRadius: radii.pill, backgroundColor: t.bg, alignSelf: 'flex-start' }}>
      <AppText weight="medium" style={{ fontSize: 10.5, color: t.fg, letterSpacing: 0.2 }}>
        {children}
      </AppText>
    </View>
  );
}

export default StatusPill;
