import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckIcon } from 'phosphor-react-native/lib/module/icons/Check';
import { PlusIcon } from 'phosphor-react-native/lib/module/icons/Plus';
import { TrashIcon } from 'phosphor-react-native/lib/module/icons/Trash';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import ScreenHeader from '../components/ScreenHeader';
import { colors, radii, spacing } from '../theme';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetEdit'>;

interface BucketCategory {
  id: string;
  name: string;
  target: number;
}

const DEFAULT_NEEDS: BucketCategory[] = [
  { id: 'bills', name: 'Bills & Utilities', target: 20000 },
  { id: 'groceries', name: 'Groceries', target: 10000 },
  { id: 'transport', name: 'Transport', target: 7500 },
];

const DEFAULT_WANTS: BucketCategory[] = [
  { id: 'food', name: 'Dining & Swiggy', target: 12000 },
  { id: 'shopping', name: 'Shopping', target: 8000 },
  { id: 'ent', name: 'Entertainment', target: 2500 },
];

const DEFAULT_SAVINGS: BucketCategory[] = [
  { id: 'invest', name: 'SIP & Stocks', target: 10000 },
  { id: 'emergency', name: 'Emergency Fund', target: 5000 },
];

function BudgetEditScreen({ navigation }: Props) {
  const [needs, setNeeds] = useState<BucketCategory[]>(DEFAULT_NEEDS);
  const [wants, setWants] = useState<BucketCategory[]>(DEFAULT_WANTS);
  const [savings, setSavings] = useState<BucketCategory[]>(DEFAULT_SAVINGS);

  const [addingTo, setAddingTo] = useState<'needs' | 'wants' | 'savings' | null>(null);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewNameTarget] = useState('');

  const handleAddCategory = () => {
    if (!addingTo || !newName.trim()) return;
    const cat: BucketCategory = {
      id: `cat-${Date.now()}`,
      name: newName.trim(),
      target: parseInt(newTarget, 10) || 5000,
    };
    if (addingTo === 'needs') setNeeds([...needs, cat]);
    else if (addingTo === 'wants') setWants([...wants, cat]);
    else setSavings([...savings, cat]);

    setAddingTo(null);
    setNewName('');
    setNewNameTarget('');
    showToast(`Added ${cat.name}`);
  };

  const handleRemoveCategory = (bucket: 'needs' | 'wants' | 'savings', id: string) => {
    if (bucket === 'needs') setNeeds(needs.filter(c => c.id !== id));
    else if (bucket === 'wants') setWants(wants.filter(c => c.id !== id));
    else setSavings(savings.filter(c => c.id !== id));
    showToast('Category removed');
  };

  const handleSave = () => {
    showToast('Budget allocations saved!');
    navigation.goBack();
  };

  const renderBucketSection = (
    title: string,
    bucketKey: 'needs' | 'wants' | 'savings',
    items: BucketCategory[],
  ) => {
    const sum = items.reduce((s, c) => s + c.target, 0);
    return (
      <View style={{ marginBottom: spacing.s5 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s2 }}>
          <AppText weight="bold" style={{ fontSize: 15, color: colors.fg1 }}>
            {title}
          </AppText>
          <AppText weight="semibold" style={{ fontSize: 13, color: colors.gold }}>
            ₹{sum.toLocaleString('en-IN')}
          </AppText>
        </View>

        <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: spacing.s2 }}>
          {items.map((cat, idx) => (
            <View
              key={cat.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.s3,
                borderBottomWidth: idx === items.length - 1 ? 0 : 1,
                borderBottomColor: colors.borderSubtle,
              }}
            >
              <View style={{ flex: 1 }}>
                <AppText weight="semibold" style={{ fontSize: 14, color: colors.fg1 }}>
                  {cat.name}
                </AppText>
                <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>
                  Monthly target: ₹{cat.target.toLocaleString('en-IN')}
                </AppText>
              </View>
              <Pressable onPress={() => handleRemoveCategory(bucketKey, cat.id)} style={{ padding: 6 }}>
                <TrashIcon size={16} color={colors.expense} />
              </Pressable>
            </View>
          ))}

          {addingTo === bucketKey ? (
            <View style={{ gap: spacing.s2, marginTop: spacing.s3, paddingTop: spacing.s3, borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
              <Field placeholder="Category name" value={newName} onChangeText={setNewName} />
              <Field placeholder="Monthly target (₹)" value={newTarget} keyboardType="numeric" onChangeText={setNewNameTarget} />
              <View style={{ flexDirection: 'row', gap: spacing.s2, marginTop: 4 }}>
                <View style={{ flex: 1 }}>
                  <Button variant="secondary" size="md" onPress={() => setAddingTo(null)}>
                    Cancel
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button variant="primary" size="md" onPress={handleAddCategory}>
                    Add
                  </Button>
                </View>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setAddingTo(bucketKey)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.s2,
                paddingVertical: spacing.s3,
                borderTopWidth: items.length ? 1 : 0,
                borderTopColor: colors.borderSubtle,
              }}
            >
              <PlusIcon size={16} color={colors.navy} />
              <AppText weight="semibold" style={{ fontSize: 13, color: colors.navy }}>
                Add category to {title}
              </AppText>
            </Pressable>
          )}
        </Card>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgBase }} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Edit Budget"
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={handleSave} style={{ paddingHorizontal: spacing.s3, paddingVertical: 6, backgroundColor: colors.navy, borderRadius: radii.pill }}>
            <AppText weight="semibold" style={{ fontSize: 13, color: colors.fgOnDark }}>
              Done
            </AppText>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s5, paddingBottom: spacing.s6 }}>
        {renderBucketSection('Needs (50%)', 'needs', needs)}
        {renderBucketSection('Wants (30%)', 'wants', wants)}
        {renderBucketSection('Savings (20%)', 'savings', savings)}

        <Button variant="primary" full size="lg" onPress={handleSave}>
          Save budget changes
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

export default BudgetEditScreen;
