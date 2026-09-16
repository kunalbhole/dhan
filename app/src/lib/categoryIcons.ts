import type { ComponentType } from 'react';
import { ForkKnifeIcon } from 'phosphor-react-native/lib/module/icons/ForkKnife';
import { CarSimpleIcon } from 'phosphor-react-native/lib/module/icons/CarSimple';
import { ShoppingBagIcon } from 'phosphor-react-native/lib/module/icons/ShoppingBag';
import { ReceiptIcon } from 'phosphor-react-native/lib/module/icons/Receipt';
import { FilmStripIcon } from 'phosphor-react-native/lib/module/icons/FilmStrip';
import { HeartbeatIcon } from 'phosphor-react-native/lib/module/icons/Heartbeat';
import { GraduationCapIcon } from 'phosphor-react-native/lib/module/icons/GraduationCap';
import { BasketIcon } from 'phosphor-react-native/lib/module/icons/Basket';
import { HouseIcon } from 'phosphor-react-native/lib/module/icons/House';
import { AirplaneTakeoffIcon } from 'phosphor-react-native/lib/module/icons/AirplaneTakeoff';
import { ArrowDownLeftIcon } from 'phosphor-react-native/lib/module/icons/ArrowDownLeft';
import { CreditCardIcon } from 'phosphor-react-native/lib/module/icons/CreditCard';
import { BankIcon } from 'phosphor-react-native/lib/module/icons/Bank';
import { HandCoinsIcon } from 'phosphor-react-native/lib/module/icons/HandCoins';
import { TrendUpIcon } from 'phosphor-react-native/lib/module/icons/TrendUp';
import { CurrencyCircleDollarIcon } from 'phosphor-react-native/lib/module/icons/CurrencyCircleDollar';
import { DotsThreeIcon } from 'phosphor-react-native/lib/module/icons/DotsThree';
import type { PhosphorIconProps } from '../components/IconChip';

// 1:1 with src/lib/categories.ts's CATEGORIES keys — the reference renders
// each category's `icon` slug through a CSS class (`ph ph-${icon}`); RN
// needs an actual component per the deep-import pattern, so this registry
// is the icon-slug -> component mapping for every CATEGORIES entry.
export const CATEGORY_ICONS: Record<string, ComponentType<PhosphorIconProps>> = {
  food: ForkKnifeIcon,
  transport: CarSimpleIcon,
  shopping: ShoppingBagIcon,
  bills: ReceiptIcon,
  ent: FilmStripIcon,
  health: HeartbeatIcon,
  edu: GraduationCapIcon,
  groceries: BasketIcon,
  rent: HouseIcon,
  travel: AirplaneTakeoffIcon,
  income: ArrowDownLeftIcon,
  cc: CreditCardIcon,
  emi: BankIcon,
  ploan: HandCoinsIcon,
  invest: TrendUpIcon,
  'forex-fee': CurrencyCircleDollarIcon,
  other: DotsThreeIcon,
};
