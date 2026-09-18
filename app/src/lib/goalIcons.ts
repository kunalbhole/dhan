import { ShieldCheckIcon } from 'phosphor-react-native/lib/module/icons/ShieldCheck';
import { AirplaneTiltIcon } from 'phosphor-react-native/lib/module/icons/AirplaneTilt';
import { LaptopIcon } from 'phosphor-react-native/lib/module/icons/Laptop';
import { GiftIcon } from 'phosphor-react-native/lib/module/icons/Gift';
import { HouseLineIcon } from 'phosphor-react-native/lib/module/icons/HouseLine';
import { GraduationCapIcon } from 'phosphor-react-native/lib/module/icons/GraduationCap';
import { CarIcon } from 'phosphor-react-native/lib/module/icons/Car';
import { TargetIcon } from 'phosphor-react-native/lib/module/icons/Target';
import type { GoalIconId } from './goals';
import type { PhosphorIconProps } from '../components/IconChip';
import type { ComponentType } from 'react';

// One real Phosphor component per GOAL_ICON_IDS slug — same pattern as
// categoryIcons.ts.
export const GOAL_ICONS: Record<GoalIconId, ComponentType<PhosphorIconProps>> = {
  'shield-check': ShieldCheckIcon,
  'airplane-tilt': AirplaneTiltIcon,
  laptop: LaptopIcon,
  gift: GiftIcon,
  'house-line': HouseLineIcon,
  'graduation-cap': GraduationCapIcon,
  car: CarIcon,
  target: TargetIcon,
};
