import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircleIcon } from 'phosphor-react-native/lib/module/icons/CheckCircle';
import { TrayIcon } from 'phosphor-react-native/lib/module/icons/Tray';
import AppText from '../components/AppText';
import Card from '../components/Card';
import IconChip from '../components/IconChip';
import ScreenHeader from '../components/ScreenHeader';
import { CATEGORIES } from '../lib/categories';
import { getAllTransactions, updateTransactionCategory, subscribeToTransactionsChanged, type StoredTransaction } from '../lib/db';
import { colors, radii, spacing } from '../theme';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Uncategorised'>;

function UncategorisedScreen({ navigation }: Props) {
  const [items, setItems] = useState<StoredTransaction[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const reload = async () => {
    const all = await getAllTransactions();
    setItems(all.filter(t => t.category === 'other'));
  };

  useEffect(() => {
    reload();
    return subscribeToTransactionsChanged(reload);
  }, []);

  const totalUncat = items.reduce((s, t) => s + Math.abs(t.amount), 0);

  const handleCategorise = async (id: number, catKey: string) => {
    await updateTransactionCategory(id, catKey);
    showToast(`Categorised as ${CATEGORIES[catKey]?.name || catKey}`);
    setExpandedId(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgBase }} edges={['top', 'bottom']}>
      <ScreenHeader title="Uncategorised" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s5, paddingBottom: spacing.s6 }}>
        {/* Total Banner */}
        <Card style={{ padding: spacing.s4, flexDirection: 'row', alignItems: 'center', gap: spacing.s4, marginBottom: spacing.s4 }}>
          <IconChip icon={TrayIcon} color={colors.gold} bg={colors.goldBg} />
          <View>
            <AppText weight="bold" style={{ fontSize: 20, color: colors.fg1 }}>
              ₹{totalUncat.toLocaleString('en-IN')}
            </AppText>
            <AppText style={{ fontSize: 12.5, color: colors.fg3, marginTop: 2 }}>
              {items.length} transaction{items.length === 1 ? '' : 's'} waiting for a category
            </AppText>
          </View>
        </Card>

        {items.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <IconChip icon={CheckCircleIcon} color={colors.income} bg={colors.incomeBg} />
            <AppText weight="bold" style={{ fontSize: 16, color: colors.fg1, marginTop: spacing.s3 }}>
              All sorted
            </AppText>
            <AppText style={{ fontSize: 13, color: colors.fg3, marginTop: 4 }}>
              Every transaction has a category.
            </AppText>
          </View>
        ) : (
          items.map(t => {
            const isExpanded = expandedId === t.id;
            return (
              <Card key={t.id} style={{ padding: spacing.s3, marginBottom: spacing.s2 }}>
                <Pressable
                  onPress={() => setExpandedId(isExpanded ? null : t.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3 }}
                >
                  <IconChip icon={TrayIcon} color={colors.fg2} bg={colors.bgSurface} />
                  <View style={{ flex: 1 }}>
                    <AppText weight="semibold" style={{ fontSize: 14, color: colors.fg1 }}>
                      {t.merchant || 'Unknown Merchant'}
                    </AppText>
                    <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
                      {t.subtitle}
                    </AppText>
                  </View>
                  <AppText weight="bold" style={{ fontSize: 15, color: colors.fg1 }}>
                    ₹{Math.abs(t.amount).toLocaleString('en-IN')}
                  </AppText>
                </Pressable>

                {isExpanded ? (
                  <View style={{ marginTop: spacing.s3, paddingTop: spacing.s3, borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
                    <AppText style={{ fontSize: 11, color: colors.fg3, marginBottom: spacing.s2 }}>
                      Choose category:
                    </AppText>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {Object.entries(CATEGORIES).map(([catKey, cat]) => (
                        <Pressable
                          key={catKey}
                          onPress={() => handleCategorise(t.id, catKey)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: radii.control,
                            backgroundColor: colors.bgSurface,
                            borderWidth: 1,
                            borderColor: colors.borderSubtle,
                          }}
                        >
                          <AppText style={{ fontSize: 12, color: colors.fg1 }}>
                            {cat.name}
                          </AppText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default UncategorisedScreen;
