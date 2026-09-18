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

declare module 'phosphor-react-native/lib/module/icons/CalendarBlank' {
  import type { Icon } from 'phosphor-react-native';
  export const CalendarBlank: Icon;
  export const CalendarBlankIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Wallet' {
  import type { Icon } from 'phosphor-react-native';
  export const Wallet: Icon;
  export const WalletIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Hash' {
  import type { Icon } from 'phosphor-react-native';
  export const Hash: Icon;
  export const HashIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CheckCircle' {
  import type { Icon } from 'phosphor-react-native';
  export const CheckCircle: Icon;
  export const CheckCircleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/NotePencil' {
  import type { Icon } from 'phosphor-react-native';
  export const NotePencil: Icon;
  export const NotePencilIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ShareNetwork' {
  import type { Icon } from 'phosphor-react-native';
  export const ShareNetwork: Icon;
  export const ShareNetworkIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Trash' {
  import type { Icon } from 'phosphor-react-native';
  export const Trash: Icon;
  export const TrashIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/X' {
  import type { Icon } from 'phosphor-react-native';
  export const X: Icon;
  export const XIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ArrowsLeftRight' {
  import type { Icon } from 'phosphor-react-native';
  export const ArrowsLeftRight: Icon;
  export const ArrowsLeftRightIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Info' {
  import type { Icon } from 'phosphor-react-native';
  export const Info: Icon;
  export const InfoIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Translate' {
  import type { Icon } from 'phosphor-react-native';
  export const Translate: Icon;
  export const TranslateIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Globe' {
  import type { Icon } from 'phosphor-react-native';
  export const Globe: Icon;
  export const GlobeIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Moon' {
  import type { Icon } from 'phosphor-react-native';
  export const Moon: Icon;
  export const MoonIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/DownloadSimple' {
  import type { Icon } from 'phosphor-react-native';
  export const DownloadSimple: Icon;
  export const DownloadSimpleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/LockKey' {
  import type { Icon } from 'phosphor-react-native';
  export const LockKey: Icon;
  export const LockKeyIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/SlidersHorizontal' {
  import type { Icon } from 'phosphor-react-native';
  export const SlidersHorizontal: Icon;
  export const SlidersHorizontalIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CloudArrowDown' {
  import type { Icon } from 'phosphor-react-native';
  export const CloudArrowDown: Icon;
  export const CloudArrowDownIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CloudArrowUp' {
  import type { Icon } from 'phosphor-react-native';
  export const CloudArrowUp: Icon;
  export const CloudArrowUpIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/GoogleLogo' {
  import type { Icon } from 'phosphor-react-native';
  export const GoogleLogo: Icon;
  export const GoogleLogoIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/UserCircle' {
  import type { Icon } from 'phosphor-react-native';
  export const UserCircle: Icon;
  export const UserCircleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Lifebuoy' {
  import type { Icon } from 'phosphor-react-native';
  export const Lifebuoy: Icon;
  export const LifebuoyIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/SignOut' {
  import type { Icon } from 'phosphor-react-native';
  export const SignOut: Icon;
  export const SignOutIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/FileText' {
  import type { Icon } from 'phosphor-react-native';
  export const FileText: Icon;
  export const FileTextIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Scroll' {
  import type { Icon } from 'phosphor-react-native';
  export const Scroll: Icon;
  export const ScrollIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Tag' {
  import type { Icon } from 'phosphor-react-native';
  export const Tag: Icon;
  export const TagIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Sparkle' {
  import type { Icon } from 'phosphor-react-native';
  export const Sparkle: Icon;
  export const SparkleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/XCircle' {
  import type { Icon } from 'phosphor-react-native';
  export const XCircle: Icon;
  export const XCircleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ClockCounterClockwise' {
  import type { Icon } from 'phosphor-react-native';
  export const ClockCounterClockwise: Icon;
  export const ClockCounterClockwiseIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/ArrowUpLeft' {
  import type { Icon } from 'phosphor-react-native';
  export const ArrowUpLeft: Icon;
  export const ArrowUpLeftIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/MagnifyingGlassMinus' {
  import type { Icon } from 'phosphor-react-native';
  export const MagnifyingGlassMinus: Icon;
  export const MagnifyingGlassMinusIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Funnel' {
  import type { Icon } from 'phosphor-react-native';
  export const Funnel: Icon;
  export const FunnelIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/PiggyBank' {
  import type { Icon } from 'phosphor-react-native';
  export const PiggyBank: Icon;
  export const PiggyBankIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/HouseLine' {
  import type { Icon } from 'phosphor-react-native';
  export const HouseLine: Icon;
  export const HouseLineIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Confetti' {
  import type { Icon } from 'phosphor-react-native';
  export const Confetti: Icon;
  export const ConfettiIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CaretLeft' {
  import type { Icon } from 'phosphor-react-native';
  export const CaretLeft: Icon;
  export const CaretLeftIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CaretDown' {
  import type { Icon } from 'phosphor-react-native';
  export const CaretDown: Icon;
  export const CaretDownIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/DotsThreeVertical' {
  import type { Icon } from 'phosphor-react-native';
  export const DotsThreeVertical: Icon;
  export const DotsThreeVerticalIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/PencilSimple' {
  import type { Icon } from 'phosphor-react-native';
  export const PencilSimple: Icon;
  export const PencilSimpleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/User' {
  import type { Icon } from 'phosphor-react-native';
  export const User: Icon;
  export const UserIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/LockSimple' {
  import type { Icon } from 'phosphor-react-native';
  export const LockSimple: Icon;
  export const LockSimpleIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Calendar' {
  import type { Icon } from 'phosphor-react-native';
  export const Calendar: Icon;
  export const CalendarIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Gift' {
  import type { Icon } from 'phosphor-react-native';
  export const Gift: Icon;
  export const GiftIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Handshake' {
  import type { Icon } from 'phosphor-react-native';
  export const Handshake: Icon;
  export const HandshakeIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/PaperPlaneTilt' {
  import type { Icon } from 'phosphor-react-native';
  export const PaperPlaneTilt: Icon;
  export const PaperPlaneTiltIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/QrCode' {
  import type { Icon } from 'phosphor-react-native';
  export const QrCode: Icon;
  export const QrCodeIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Money' {
  import type { Icon } from 'phosphor-react-native';
  export const Money: Icon;
  export const MoneyIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/UserPlus' {
  import type { Icon } from 'phosphor-react-native';
  export const UserPlus: Icon;
  export const UserPlusIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Star' {
  import type { Icon } from 'phosphor-react-native';
  export const Star: Icon;
  export const StarIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/Export' {
  import type { Icon } from 'phosphor-react-native';
  export const Export: Icon;
  export const ExportIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/FileCsv' {
  import type { Icon } from 'phosphor-react-native';
  export const FileCsv: Icon;
  export const FileCsvIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/BellRinging' {
  import type { Icon } from 'phosphor-react-native';
  export const BellRinging: Icon;
  export const BellRingingIcon: Icon;
}

declare module 'phosphor-react-native/lib/module/icons/CheckSquareOffset' {
  import type { Icon } from 'phosphor-react-native';
  export const CheckSquareOffset: Icon;
  export const CheckSquareOffsetIcon: Icon;
}
