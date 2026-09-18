import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TranslateIcon } from 'phosphor-react-native/lib/module/icons/Translate';
import Card from '../components/Card';
import RadioRow from '../components/RadioRow';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { spacing } from '../theme';
import { getLanguage, setLanguage, subscribeToLanguage, type LanguageId } from '../lib/languageStore';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Language'>;

const LANGUAGES: { id: LanguageId; label: string; sub: string; disabled?: boolean }[] = [
  { id: 'en', label: 'English', sub: 'Default' },
  { id: 'hi', label: 'हिंदी', sub: 'Hindi' },
  { id: 'mr', label: 'मराठी', sub: 'Marathi · coming soon', disabled: true },
  { id: 'ta', label: 'தமிழ்', sub: 'Tamil · coming soon', disabled: true },
];

function LanguageScreen({ navigation }: Props) {
  const [language, setLanguageState] = useState(getLanguage());

  useEffect(() => subscribeToLanguage(() => setLanguageState(getLanguage())), []);

  return (
    <SettingsSubScreen
      title="Language"
      onBack={() => navigation.goBack()}
      note="More Indian languages are on the way. Your data stays on-device either way."
    >
      <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
        {LANGUAGES.map((l, i) => (
          <RadioRow
            key={l.id}
            icon={TranslateIcon}
            label={l.label}
            sub={l.sub}
            on={language === l.id}
            last={i === LANGUAGES.length - 1}
            disabled={l.disabled}
            onPress={() => setLanguage(l.id)}
          />
        ))}
      </Card>
    </SettingsSubScreen>
  );
}

export default LanguageScreen;
