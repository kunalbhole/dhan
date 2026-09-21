import { ElementRef, useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, TextInputKeyPressEvent, View } from 'react-native';
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
import { signInToGoogle } from '../../lib/driveAuth';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 24;

function SignUpScreen({ navigation }: Props) {
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const otpRefs = useRef<Array<ElementRef<typeof TextInput> | null>>([]);
  const full = otp.every(d => d !== '');

  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real countdown, not the static "Resend in 24s" label the screen had
  // before — resendTick is a plain trigger to restart the interval on a
  // fresh resend without needing `step` to change.
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resendTick, setResendTick] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (step !== 1) return;
    setResendIn(RESEND_SECONDS);
    const id = setInterval(() => {
      setResendIn(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [step, resendTick]);

  const goNext = useCallback(() => navigation.navigate('Permissions'), [navigation]);

  const sendCode = useCallback(async () => {
    setError(null);
    setSending(true);
    try {
      const e164Phone = `+91${phone.replace(/\s/g, '')}`;
      const result = await signInWithPhoneNumber(getAuth(), e164Phone);
      setConfirmation(result);
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code. Please try again.');
    } finally {
      setSending(false);
    }
  }, [phone]);

  // Actually re-sends a real OTP (not just resetting the label) — same
  // Firebase call as sendCode, kept separate since this one doesn't
  // change `step`.
  const handleResend = useCallback(async () => {
    if (resendIn > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const e164Phone = `+91${phone.replace(/\s/g, '')}`;
      const result = await signInWithPhoneNumber(getAuth(), e164Phone);
      setConfirmation(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resend the code. Please try again.');
    } finally {
      setResending(false);
      setResendTick(t => t + 1);
    }
  }, [phone, resendIn, resending]);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    try {
      const driveAcc = await signInToGoogle();
      if (!driveAcc) return;
      if (driveAcc.name) {
        await setProfileNameIfEmpty(driveAcc.name);
      }
      goNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in with Google. Please try again.');
    }
  }, [goNext]);

  const backToPhoneStep = useCallback(() => {
    setConfirmation(null);
    setError(null);
    setOtp(Array(OTP_LENGTH).fill(''));
    setStep(0);
  }, []);

  const confirmCode = useCallback(async () => {
    if (!confirmation) {
      setError('No verification in progress. Please resend the code.');
      return;
    }
    setError(null);
    setConfirming(true);
    try {
      await confirmation.confirm(otp.join(''));
      await setProfileNameIfEmpty(name.trim() || 'Kunal Shankar');
      goNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Incorrect code. Please try again.');
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
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step === 0 ? (
            <>
              <AppText weight="bold" style={styles.title}>
                Let&apos;s get you set up.
              </AppText>
              <AppText style={styles.formSubtitle}>We&apos;ll send a 6-digit code to verify your number.</AppText>
              <Field label="Your name" value={name} onChangeText={setName} placeholder="First + last name" />
              <Field
                label="Mobile number"
                value={phone}
                onChangeText={setPhone}
                placeholder="98xxx xxxxx"
                prefix="+91"
                keyboardType="phone-pad"
              />
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
              <Button variant="outline" full size="lg" icon={GoogleIcon} onPress={handleGoogleSignIn}>
                Continue with Google
              </Button>
            </>
          ) : (
            <>
              <AppText weight="bold" style={styles.title}>
                Enter the 6-digit code
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
                <Pressable onPress={handleResend} disabled={resendIn > 0 || resending} hitSlop={8}>
                  <AppText weight="semibold" style={[styles.resendLink, resendIn > 0 && styles.resendLinkDisabled]}>
                    {resendIn > 0 ? `Resend in ${resendIn}s` : resending ? 'Sending…' : 'Resend'}
                  </AppText>
                </Pressable>
              </View>
              {error && (
                <AppText weight="medium" style={[styles.errorText, styles.otpError]}>
                  {error}
                </AppText>
              )}
              <View style={styles.gap} />
              <Button variant="primary" full size="lg" disabled={!full || confirming} onPress={confirmCode}>
                {confirming ? 'Verifying…' : 'Verify account'}
              </Button>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  body: {
    paddingHorizontal: spacing.s5,
    paddingBottom: spacing.s6,
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
  gap: {
    height: spacing.s6,
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
    gap: 8,
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
    fontSize: 22,
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
  resendLinkDisabled: {
    color: colors.fg3,
  },
});

export default SignUpScreen;
