// phosphor-react-native's root barrel re-exports all ~1500 icons (and the
// package ships three full copies of them under src/, lib/commonjs/, and
// lib/module/), which is enough for Metro to stall indefinitely without
// Watchman installed. App code instead imports icons and IconContext from
// their individual compiled files — deep paths the package's "exports" map
// doesn't declare, so TypeScript can't resolve them on its own. These
// ambient declarations fill that gap without touching the package's raw
// .tsx sources (icon-base.tsx has an unrelated type error against the
// installed react-native-svg version that would otherwise surface here).
//
// Add one entry per icon subpath as new icons get used.

declare module 'phosphor-react-native/lib/module/lib' {
  import type { IconProps } from 'phosphor-react-native';
  import type { Context } from 'react';
  export const IconContext: Context<IconProps>;
}

declare module 'phosphor-react-native/lib/module/icons/ShieldCheck' {
  import type { Icon } from 'phosphor-react-native';
  export const ShieldCheck: Icon;
  export const ShieldCheckIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ArrowRight' {
  import type { Icon } from 'phosphor-react-native';
  export const ArrowRight: Icon;
  export const ArrowRightIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ArrowLeft' {
  import type { Icon } from 'phosphor-react-native';
  export const ArrowLeft: Icon;
  export const ArrowLeftIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ChatCenteredText' {
  import type { Icon } from 'phosphor-react-native';
  export const ChatCenteredText: Icon;
  export const ChatCenteredTextIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Bell' {
  import type { Icon } from 'phosphor-react-native';
  export const Bell: Icon;
  export const BellIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/AddressBook' {
  import type { Icon } from 'phosphor-react-native';
  export const AddressBook: Icon;
  export const AddressBookIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Check' {
  import type { Icon } from 'phosphor-react-native';
  export const Check: Icon;
  export const CheckIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Plus' {
  import type { Icon } from 'phosphor-react-native';
  export const Plus: Icon;
  export const PlusIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ArrowDownLeft' {
  import type { Icon } from 'phosphor-react-native';
  export const ArrowDownLeft: Icon;
  export const ArrowDownLeftIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ArrowUpRight' {
  import type { Icon } from 'phosphor-react-native';
  export const ArrowUpRight: Icon;
  export const ArrowUpRightIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/MinusCircle' {
  import type { Icon } from 'phosphor-react-native';
  export const MinusCircle: Icon;
  export const MinusCircleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/PlusCircle' {
  import type { Icon } from 'phosphor-react-native';
  export const PlusCircle: Icon;
  export const PlusCircleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ChartLineUp' {
  import type { Icon } from 'phosphor-react-native';
  export const ChartLineUp: Icon;
  export const ChartLineUpIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Tray' {
  import type { Icon } from 'phosphor-react-native';
  export const Tray: Icon;
  export const TrayIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CaretRight' {
  import type { Icon } from 'phosphor-react-native';
  export const CaretRight: Icon;
  export const CaretRightIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Target' {
  import type { Icon } from 'phosphor-react-native';
  export const Target: Icon;
  export const TargetIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/TrendDown' {
  import type { Icon } from 'phosphor-react-native';
  export const TrendDown: Icon;
  export const TrendDownIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ForkKnife' {
  import type { Icon } from 'phosphor-react-native';
  export const ForkKnife: Icon;
  export const ForkKnifeIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ShoppingBag' {
  import type { Icon } from 'phosphor-react-native';
  export const ShoppingBag: Icon;
  export const ShoppingBagIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/House' {
  import type { Icon } from 'phosphor-react-native';
  export const House: Icon;
  export const HouseIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/WifiHigh' {
  import type { Icon } from 'phosphor-react-native';
  export const WifiHigh: Icon;
  export const WifiHighIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/SpotifyLogo' {
  import type { Icon } from 'phosphor-react-native';
  export const SpotifyLogo: Icon;
  export const SpotifyLogoIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/TelevisionSimple' {
  import type { Icon } from 'phosphor-react-native';
  export const TelevisionSimple: Icon;
  export const TelevisionSimpleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ListBullets' {
  import type { Icon } from 'phosphor-react-native';
  export const ListBullets: Icon;
  export const ListBulletsIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Receipt' {
  import type { Icon } from 'phosphor-react-native';
  export const Receipt: Icon;
  export const ReceiptIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ChartPieSlice' {
  import type { Icon } from 'phosphor-react-native';
  export const ChartPieSlice: Icon;
  export const ChartPieSliceIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CalendarCheck' {
  import type { Icon } from 'phosphor-react-native';
  export const CalendarCheck: Icon;
  export const CalendarCheckIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/UsersThree' {
  import type { Icon } from 'phosphor-react-native';
  export const UsersThree: Icon;
  export const UsersThreeIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/MagnifyingGlass' {
  import type { Icon } from 'phosphor-react-native';
  export const MagnifyingGlass: Icon;
  export const MagnifyingGlassIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CarSimple' {
  import type { Icon } from 'phosphor-react-native';
  export const CarSimple: Icon;
  export const CarSimpleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/FilmStrip' {
  import type { Icon } from 'phosphor-react-native';
  export const FilmStrip: Icon;
  export const FilmStripIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Heartbeat' {
  import type { Icon } from 'phosphor-react-native';
  export const Heartbeat: Icon;
  export const HeartbeatIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/GraduationCap' {
  import type { Icon } from 'phosphor-react-native';
  export const GraduationCap: Icon;
  export const GraduationCapIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Basket' {
  import type { Icon } from 'phosphor-react-native';
  export const Basket: Icon;
  export const BasketIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/AirplaneTakeoff' {
  import type { Icon } from 'phosphor-react-native';
  export const AirplaneTakeoff: Icon;
  export const AirplaneTakeoffIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CreditCard' {
  import type { Icon } from 'phosphor-react-native';
  export const CreditCard: Icon;
  export const CreditCardIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Bank' {
  import type { Icon } from 'phosphor-react-native';
  export const Bank: Icon;
  export const BankIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/HandCoins' {
  import type { Icon } from 'phosphor-react-native';
  export const HandCoins: Icon;
  export const HandCoinsIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/TrendUp' {
  import type { Icon } from 'phosphor-react-native';
  export const TrendUp: Icon;
  export const TrendUpIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CurrencyCircleDollar' {
  import type { Icon } from 'phosphor-react-native';
  export const CurrencyCircleDollar: Icon;
  export const CurrencyCircleDollarIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/DotsThree' {
  import type { Icon } from 'phosphor-react-native';
  export const DotsThree: Icon;
  export const DotsThreeIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Lightning' {
  import type { Icon } from 'phosphor-react-native';
  export const Lightning: Icon;
  export const LightningIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Flame' {
  import type { Icon } from 'phosphor-react-native';
  export const Flame: Icon;
  export const FlameIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Barbell' {
  import type { Icon } from 'phosphor-react-native';
  export const Barbell: Icon;
  export const BarbellIcon: Icon;
}
