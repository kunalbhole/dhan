import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppText from '../components/AppText';
import Card from '../components/Card';
import ScreenHeader from '../components/ScreenHeader';
import { CATEGORIES } from '../lib/categories';
import { getAllTransactions, subscribeToTransactionsChanged, type StoredTransaction } from '../lib/db';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryTxns'>;

function CategoryTxnsScreen({ navigation, route }: Props) {
  const categoryKey = route.params?.category ?? 'other';
  const categoryName = CATEGORIES[categoryKey]?.name ?? 'Category';

  const [items, setItems] = useState<StoredTransaction[]>([]);

  const reload = async () => {
    const all = await getAllTransactions();
    setItems(all.filter(t => t.category === categoryKey));
  };

  useEffect(() => {
    reload();
    return subscribeToTransactionsChanged(reload);
  }, [categoryKey]);

  const total = items.reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgBase }} edges={['top', 'bottom']}>
      <ScreenHeader title={categoryName} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s5, paddingBottom: spacing.s6 }}>
        {/* Total Header Card */}
        <Card style={{ padding: spacing.s4, marginBottom: spacing.s4 }}>
          <AppText style={{ fontSize: 12, color: colors.fg3 }}>
            Total spent in {categoryName}
          </AppText>
          <AppText weight="bold" style={{ fontSize: 24, color: colors.fg1, marginTop: 4 }}>
            ₹{total.toLocaleString('en-IN')}
          </AppText>
          <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
            {items.length} transaction{items.length === 1 ? '' : 's'}
          </AppText>
        </Card>

        {items.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <AppText style={{ fontSize: 14, color: colors.fg3 }}>
              No transactions in {categoryName} yet.
            </AppText>
          </View>
        ) : (
          items.map(t => (
            <Card key={t.id} style={{ padding: spacing.s3, marginBottom: spacing.s2 }}>
              <Pressable
                onPress={() => navigation.navigate('TxnDetail', { transaction: t })}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <View>
                  <AppText weight="semibold" style={{ fontSize: 14, color: colors.fg1 }}>
                    {t.merchant || 'Transaction'}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
                    {new Date(t.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </AppText>
                </View>
                <AppText weight="bold" style={{ fontSize: 15, color: colors.fg1 }}>
                  ₹{Math.abs(t.amount).toLocaleString('en-IN')}
                </AppText>
              </Pressable>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default CategoryTxnsScreen;
