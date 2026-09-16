import { ReactNode, useState } from 'react';
import { KeyboardTypeOptions, StyleSheet, TextInput, View } from 'react-native';
import AppText from './AppText';
import { colors, radii, spacing, typography } from '../theme';

// Ported from Dhan App 2/components.jsx's Field.
export interface FieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  prefix?: string;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  editable?: boolean;
  right?: ReactNode;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  prefix,
  keyboardType = 'default',
  autoFocus,
  editable,
  right,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label && (
        <AppText weight="semibold" style={styles.label}>
          {label}
        </AppText>
      )}
      <View style={[styles.inputRow, { borderColor: focused ? colors.navy : colors.borderDefault }]}>
        {prefix && (
          <AppText weight="semibold" style={styles.prefix}>
            {prefix}
          </AppText>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.fg3}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          editable={editable}
          style={styles.input}
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
    minWidth: 0,
  },
  label: {
    fontSize: 12,
    color: colors.fg2,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s2,
    borderWidth: 1,
    borderRadius: radii.input,
    paddingHorizontal: spacing.s3,
    height: 52,
    backgroundColor: colors.bgBase,
  },
  prefix: {
    color: colors.fg2,
  },
  input: {
    flex: 1,
    fontFamily: typography.family.medium,
    fontSize: typography.scale.body.fontSize,
    color: colors.fg1,
    padding: 0,
  },
});

export default Field;
