import type { ComponentType } from 'react';
import { AirplaneTakeoffIcon } from 'phosphor-react-native/lib/module/icons/AirplaneTakeoff';
import { HouseIcon } from 'phosphor-react-native/lib/module/icons/House';
import { ConfettiIcon } from 'phosphor-react-native/lib/module/icons/Confetti';
import { ForkKnifeIcon } from 'phosphor-react-native/lib/module/icons/ForkKnife';
import { CarSimpleIcon } from 'phosphor-react-native/lib/module/icons/CarSimple';
import { GiftIcon } from 'phosphor-react-native/lib/module/icons/Gift';
import type { PhosphorIconProps } from '../components/IconChip';

// 1:1 with screens-split.jsx's GROUP_ICONS — the picker offered in
// CreateGroupSheet / GroupDetailScreen's edit sheet.
export const GROUP_ICON_IDS = ['airplane-takeoff', 'house', 'confetti', 'fork-knife', 'car-simple', 'gift'];

export const GROUP_ICONS: Record<string, ComponentType<PhosphorIconProps>> = {
  'airplane-takeoff': AirplaneTakeoffIcon,
  house: HouseIcon,
  confetti: ConfettiIcon,
  'fork-knife': ForkKnifeIcon,
  'car-simple': CarSimpleIcon,
  gift: GiftIcon,
};
