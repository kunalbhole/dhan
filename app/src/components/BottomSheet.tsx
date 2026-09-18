import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XIcon } from 'phosphor-react-native/lib/module/icons/X';
import AppText from './AppText';
import { colors, radii, shadows, spacing } from '../theme';

// Ported from Dhan App 2/components.jsx's BottomSheet — scrim + sheet
// sliding up from the bottom, drag-handle bar, optional title row with a
// close button. The reference renders this absolutely inside its "Phone"
// frame; here the frame is the device screen, so it's a real RN Modal.
export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.bgOverlay }}
        />
        <View
          style={[
            {
              backgroundColor: colors.bgElevated,
              borderTopLeftRadius: radii.sheet,
              borderTopRightRadius: radii.sheet,
              paddingTop: 10,
              paddingHorizontal: spacing.s5,
              paddingBottom: Math.max(insets.bottom, spacing.s6) + 4,
              maxHeight: '88%',
            },
            shadows.lg,
          ]}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.borderStrong,
              alignSelf: 'center',
              marginTop: 4,
              marginBottom: 10,
            }}
          />
          {title ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.s3 }}>
              <AppText weight="bold" style={{ fontSize: 17 }}>
                {title}
              </AppText>
              <Pressable
                onPress={onClose}
                accessibilityLabel="Close"
                style={{ width: 32, height: 32, borderRadius: radii.pill, backgroundColor: colors.bgSurface, alignItems: 'center', justifyContent: 'center' }}
              >
                <XIcon size={16} color={colors.fg1} />
              </Pressable>
            </View>
          ) : null}
          <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default BottomSheet;
