import { Pressable, View } from 'react-native';
import { CaretRightIcon } from 'phosphor-react-native/lib/module/icons/CaretRight';
import AppText from './AppText';
import { colors } from '../theme';

export interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

// CLAUDE.md: section headings are 16px/weight 500. Home's "See all" links
// are plain navy Poppins Medium 12px + caret — explicitly NOT the
// gold-btn treatment (see GoldButton.tsx's own comment on that distinction).
function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginHorizontal: 4,
        marginBottom: 10,
      }}
    >
      <AppText weight="medium" style={{ fontSize: 16 }}>
        {title}
      </AppText>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, margin: -8 }}>
          <AppText weight="medium" style={{ fontSize: 12, color: colors.navy }}>
            See all
          </AppText>
          <CaretRightIcon size={12} color={colors.navy} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default SectionHeader;
