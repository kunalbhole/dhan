import { ElementRef, useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputKeyPressEvent, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth, signInWithPhoneNumber, type ConfirmationResult } from '@react-native-firebase/auth';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import Field from '../../components/Field';
import ScreenHeader from '../../components/ScreenHeader';
import GoogleIcon from '../../assets/GoogleIcon';
import { colors, radii, spacing, typography } from '../../theme';
import { setProfileNameIfEmpty } from '../../lib/profileStore';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const OTP_LENGTH = 4;

// Firebase's own error.message is developer-facing ("An internal error has
// occurred...[ APP_NOT_AUTHORIZED ]"); map the codes worth distinguishing
// for a user to plain copy and fall back to one generic line for the rest.
function authErrorMessage(err: unknown): string {
  const code = err instanceof Error && 'code' in err ? String((err as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/invalid-phone-number':
      return "That doesn't look like a valid number.";
    case 'auth/too-many-requests':
      return 'Too many attempts — try again in a bit.';
    case 'auth/invalid-verification-code':
      return "That code isn't right. Check and try again.";
    case 'auth/code-expired':
      return 'That code expired — resend and try again.';
    default:
      return "Something went wrong. Check your connection and try again.";
  }
}

function SignUpScreen({ navigation }: Props) {
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState('Priya Sharma');
  const [phone, setPhone] = useState('98210 45678');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const otpRefs = useRef<Array<ElementRef<typeof TextInput> | null>>([]);
  const full = otp.every(d => d !== '');

  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = useCallback(() => navigation.navigate('Permissions'), [navigation]);

  const sendCode = useCallback(async () => {
    setError(null);
    setSending(true);
    try {
      const e164Phone = `+91${phone.replace(/\s/g, '')}`;
      const result = await signInWithPhoneNumber(getAuth(), e164Phone);
      setConfirmation(result);
      setStep(1);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSending(false);
    }
  }, [phone]);

  // Shared by the OTP step's back arrow and its "Edit" link — a stale
  // confirmation object shouldn't be confirmed against a since-edited number.
  const backToPhoneStep = useCallback(() => {
    setConfirmation(null);
    setError(null);
    setOtp(Array(OTP_LENGTH).fill(''));
    setStep(0);
  }, []);

  const confirmCode = useCallback(async () => {
    if (!confirmation) return;
    setError(null);
    setConfirming(true);
    try {
      await confirmation.confirm(otp.join(''));
      // The one field this app's onboarding actually collects for real —
      // ProfileScreen reads it back via profileStore instead of a
      // hardcoded "Priya Sharma".
      await setProfileNameIfEmpty(name.trim());
      goNext();
    } catch (err) {
      setError(authErrorMessage(err));
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } finally {
      setConfirming(false);
    }
  }, [confirmation, otp, goNext, name]);

  const onOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  };

  // Backspace on an empty box steps back and clears the previous digit.
  const onOtpKeyPress = (i: number, e: TextInputKeyPressEvent) => {
    if (e.nativeEvent.key !== 'Backspace' || otp[i] || i === 0) return;
    const next = [...otp];
    next[i - 1] = '';
    setOtp(next);
    otpRefs.current[i - 1]?.focus();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title={step === 0 ? 'Your account' : 'Verify number'}
        onBack={() => (step === 0 ? navigation.goBack() : backToPhoneStep())}
      />
      <View style={styles.body}>
        {step === 0 ? (
          <>
            <AppText weight="bold" style={styles.title}>
              Let&apos;s get you set up.
            </AppText>
            <AppText style={styles.formSubtitle}>We&apos;ll send a 4-digit code to verify your number.</AppText>
            <Field label="Your name" value={name} onChangeText={setName} placeholder="First + last" />
            <Field
              label="Mobile number"
              value={phone}
              onChangeText={setPhone}
              placeholder="98xxx xxxxx"
              prefix="+91"
              keyboardType="phone-pad"
            />
            <View style={styles.spacer} />
            {error && (
              <AppText weight="medium" style={styles.errorText}>
                {error}
              </AppText>
            )}
            <AppText style={styles.legal}>
              By continuing, you agree to Dhan&apos;s Terms of Service and Privacy Policy.
            </AppText>
            <Button variant="primary" full size="lg" disabled={!name || !phone || sending} onPress={sendCode}>
              {sending ? 'Sending…' : 'Continue'}
            </Button>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText weight="semibold" style={styles.dividerLabel}>
                OR
              </AppText>
              <View style={styles.dividerLine} />
            </View>
            <Button variant="outline" full size="lg" icon={GoogleIcon} onPress={goNext}>
              Continue with Google
            </Button>
          </>
        ) : (
          <>
            <AppText weight="bold" style={styles.title}>
              Enter the 4-digit code
            </AppText>
            <View style={styles.sentRow}>
              <AppText style={styles.subtitle}>
                Sent to <AppText weight="semibold" style={styles.sentPhone}>+91 {phone}</AppText>
              </AppText>
              <Pressable onPress={backToPhoneStep} hitSlop={8}>
                <AppText weight="semibold" style={styles.editLink}>
                  Edit
                </AppText>
              </Pressable>
            </View>
            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={el => {
                    otpRefs.current[i] = el;
                  }}
                  value={digit}
                  onChangeText={v => onOtpChange(i, v)}
                  onKeyPress={e => onOtpKeyPress(i, e)}
                  maxLength={1}
                  keyboardType="number-pad"
                  accessibilityLabel={`Digit ${i + 1} of ${OTP_LENGTH}`}
                  style={[styles.otpBox, { borderColor: digit ? colors.navy : colors.borderDefault }]}
                />
              ))}
            </View>
            <View style={styles.resendRow}>
              <AppText style={styles.resendText}>Didn&apos;t get it? </AppText>
              <Pressable hitSlop={8}>
                <AppText weight="semibold" style={styles.resendLink}>
                  Resend in 24s
                </AppText>
              </Pressable>
            </View>
            {error && (
              <AppText weight="medium" style={[styles.errorText, styles.otpError]}>
                {error}
              </AppText>
            )}
            <View style={styles.spacer} />
            <Button variant="primary" full size="lg" disabled={!full || confirming} onPress={confirmCode}>
              {confirming ? 'Verifying…' : 'Your account'}
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.s5,
    paddingBottom: spacing.s5,
  },
  title: {
    fontSize: typography.scale.h1.fontSize,
    letterSpacing: -0.24,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.fg2,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.fg2,
    marginBottom: spacing.s5,
  },
  errorText: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.expense,
    textAlign: 'center',
    marginBottom: spacing.s3,
  },
  otpError: {
    marginTop: spacing.s2,
    marginBottom: 0,
  },
  spacer: {
    flex: 1,
  },
  legal: {
    fontSize: typography.scale.label.fontSize,
    color: colors.fg3,
    textAlign: 'center',
    marginBottom: spacing.s3,
    lineHeight: 16.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: spacing.s4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  dividerLabel: {
    fontSize: typography.scale.label.fontSize,
    color: colors.fg3,
  },
  sentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s6,
    flexWrap: 'wrap',
  },
  sentPhone: {
    fontSize: 14,
    color: colors.fg1,
  },
  editLink: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.navy,
    marginLeft: 6,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.s4,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 64,
    borderRadius: radii.control,
    borderWidth: 1.5,
    textAlign: 'center',
    fontFamily: typography.family.bold,
    fontSize: 26,
    color: colors.navy,
    backgroundColor: colors.bgBase,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.fg3,
  },
  resendLink: {
    fontSize: typography.scale.bodySm.fontSize,
    color: colors.navy,
  },
});

export default SignUpScreen;
