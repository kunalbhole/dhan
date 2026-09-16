import type { ComponentType } from 'react';
import { HouseIcon } from 'phosphor-react-native/lib/module/icons/House';
import { WifiHighIcon } from 'phosphor-react-native/lib/module/icons/WifiHigh';
import { SpotifyLogoIcon } from 'phosphor-react-native/lib/module/icons/SpotifyLogo';
import { TelevisionSimpleIcon } from 'phosphor-react-native/lib/module/icons/TelevisionSimple';
import { LightningIcon } from 'phosphor-react-native/lib/module/icons/Lightning';
import { FlameIcon } from 'phosphor-react-native/lib/module/icons/Flame';
import { BarbellIcon } from 'phosphor-react-native/lib/module/icons/Barbell';
import type { PhosphorIconProps } from '../components/IconChip';

// 1:1 with src/lib/sampleData.ts's UPCOMING_BILLS `icon` slugs.
export const BILL_ICONS: Record<string, ComponentType<PhosphorIconProps>> = {
  house: HouseIcon,
  'wifi-high': WifiHighIcon,
  'spotify-logo': SpotifyLogoIcon,
  'television-simple': TelevisionSimpleIcon,
  lightning: LightningIcon,
  flame: FlameIcon,
  barbell: BarbellIcon,
};
