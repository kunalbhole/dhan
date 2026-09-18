import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrashIcon } from 'phosphor-react-native/lib/module/icons/Trash';
import { HandCoinsIcon } from 'phosphor-react-native/lib/module/icons/HandCoins';
import { SlidersHorizontalIcon } from 'phosphor-react-native/lib/module/icons/SlidersHorizontal';
import { DownloadSimpleIcon } from 'phosphor-react-native/lib/module/icons/DownloadSimple';
import { StarIcon } from 'phosphor-react-native/lib/module/icons/Star';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import { LockKeyIcon } from 'phosphor-react-native/lib/module/icons/LockKey';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import AppText from './AppText';
import { colors, radii, spacing } from '../theme';
import { subscribeToToast } from '../lib/toast';
import type { PhosphorIconProps } from './IconChip';
import type { ComponentType } from 'react';

// Ported from app.jsx's toastIcon() — icon chosen by message content.
function toastIcon(msg: string): ComponentType<PhosphorIconProps> {
  const m = msg.toLowerCase();
  if (m.includes('delet') || m.includes('remov')) return TrashIcon;
  if (m.includes('paid') || m.includes('settl')) return HandCoinsIcon;
  if (m.includes('filter')) return SlidersHorizontalIcon;
  if (m.includes('export') || m.includes('download')) return DownloadSimpleIcon;
  if (m.includes('plus') || m.includes('upgrad')) return StarIcon;
  if (m.includes('split')) return UsersThreeIcon;
  if (m.includes('pin')) return LockKeyIcon;
  return CheckCircleIcon;
}

// Global success-feedback banner, one instance mounted at the app root
// (App.tsx) and fed by src/lib/toast.ts's showToast() from anywhere.
// Ported from app.jsx's own toast div — same cream banner just under the
// header, same auto-dismiss (src/lib/toast.ts's 2600ms), and matching its
// entrance-only animation: the reference has no exit transition either,
// its `{toast && (...)}` conditional just unmounts instantly on timeout.
const TOAST_BG = '#F7EFD8';
const TOAST_BORDER = 'rgba(201,168,76,.35)';

function Toast() {
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<string | null>(null);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(
    () =>
      subscribeToToast(next => {
        setMsg(next);
        if (next) {
          anim.setValue(0);
          Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
        }
      }),
    [anim],
  );

  if (!msg) return null;
  const Icon = toastIcon(msg);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top + 84,
        left: spacing.s4,
        right: spacing.s4,
        backgroundColor: TOAST_BG,
        borderWidth: 1,
        borderColor: TOAST_BORDER,
        borderRadius: radii.control,
        paddingVertical: 15,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        zIndex: 999,
        elevation: 8,
        shadowColor: colors.navy,
        shadowOpacity: 0.16,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 12 },
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
      }}
    >
      <Icon size={18} color={colors.navy} weight="fill" />
      <AppText weight="medium" style={{ flex: 1, fontSize: 13, lineHeight: 17.5, color: colors.navy }}>
        {msg}
      </AppText>
    </Animated.View>
  );
}

export default Toast;
