import type { ComponentType } from 'react';
import { Pressable, View } from 'react-native';
import { HouseIcon } from 'phosphor-react-native/lib/module/icons/House';
import { ListBulletsIcon } from 'phosphor-react-native/lib/module/icons/ListBullets';
import { ReceiptIcon } from 'phosphor-react-native/lib/module/icons/Receipt';
import { ChartPieSliceIcon } from 'phosphor-react-native/lib/module/icons/ChartPieSlice';
import { CalendarCheckIcon } from 'phosphor-react-native/lib/module/icons/CalendarCheck';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import AppText from './AppText';
import { colors } from '../theme';
import type { PhosphorIconProps } from './IconChip';

export type TabId = 'home' | 'txn' | 'budget' | 'bills' | 'split';

interface TabDef {
  id: TabId;
  iconR: ComponentType<PhosphorIconProps>;
  iconF: ComponentType<PhosphorIconProps>;
  label: string;
}

// Ported from components.jsx's TabBar. `iconR`/`iconF` are the phosphor
// regular/fill components for each tab (fill shown when active), following
// CLAUDE.md's "fill weight for active/selected states" rule.
const TABS: TabDef[] = [
  { id: 'home', iconR: HouseIcon, iconF: HouseIcon, label: 'Home' },
  { id: 'txn', iconR: ListBulletsIcon, iconF: ReceiptIcon, label: 'Txns' },
  { id: 'budget', iconR: ChartPieSliceIcon, iconF: ChartPieSliceIcon, label: 'Budget' },
  { id: 'bills', iconR: CalendarCheckIcon, iconF: CalendarCheckIcon, label: 'Bills' },
  { id: 'split', iconR: UsersThreeIcon, iconF: UsersThreeIcon, label: 'Split' },
];

export interface TabBarProps {
  active: TabId;
  onChange?: (id: TabId) => void;
}

function TabBar({ active, onChange }: TabBarProps) {
  return (
    <View
      style={{
        height: 76,
        backgroundColor: colors.bgElevated,
        borderTopWidth: 1,
        borderTopColor: colors.borderSubtle,
        flexDirection: 'row',
        paddingTop: 8,
        paddingBottom: 18,
        paddingHorizontal: 4,
      }}
    >
      {TABS.map(t => {
        const isActive = active === t.id;
        const Icon = isActive ? t.iconF : t.iconR;
        const color = isActive ? colors.navy : colors.fg3;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange?.(t.id)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 4 }}
          >
            <Icon size={24} color={color} weight={isActive ? 'fill' : 'regular'} />
            <AppText weight="semibold" style={{ fontSize: 10, color }}>
              {t.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default TabBar;
