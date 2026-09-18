import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReceiptIcon } from 'phosphor-react-native/lib/module/icons/Receipt';
import { ChartPieSliceIcon } from 'phosphor-react-native/lib/module/icons/ChartPieSlice';
import { ArrowDownLeftIcon } from 'phosphor-react-native/lib/module/icons/ArrowDownLeft';
import { UsersThreeIcon } from 'phosphor-react-native/lib/module/icons/UsersThree';
import { TargetIcon } from 'phosphor-react-native/lib/module/icons/Target';
import { ChatCenteredTextIcon } from 'phosphor-react-native/lib/module/icons/ChatCenteredText';
import AppText from '../components/AppText';
import Card from '../components/Card';
import GoldButton from '../components/GoldButton';
import IconChip from '../components/IconChip';
import ScreenHeader from '../components/ScreenHeader';
import { colors, radii, spacing } from '../theme';
import { showToast } from '../lib/toast';
import type { PhosphorIconProps } from '../components/IconChip';
import type { ComponentType } from 'react';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

interface NotificationItem {
  id: string;
  icon: ComponentType<PhosphorIconProps>;
  label: string;
  sub: string;
  go: string;
}

interface NotificationGroup {
  title: string;
  items: NotificationItem[];
}

// Reference-hardcoded sample notifications (screens-settings.jsx's
// NotificationsScreen) — this app has no real notification system yet,
// same status as HomeScreen's hardcoded balance/budget figures.
const GROUPS: NotificationGroup[] = [
  {
    title: 'Today',
    items: [
      { id: 'n1', icon: ReceiptIcon, label: 'Airtel Fiber due in 3 days', sub: '₹1,199 · auto-debit on Apr 26', go: 'bills' },
      { id: 'n2', icon: ChartPieSliceIcon, label: 'Wants budget 82% used', sub: '₹2,700 left of ₹15,000 this month', go: 'budget' },
      { id: 'n3', icon: ArrowDownLeftIcon, label: 'Salary credited', sub: '₹82,500 from Acme Co · HDFC ••4521', go: 'txn' },
    ],
  },
  {
    title: 'Earlier',
    items: [
      { id: 'n4', icon: UsersThreeIcon, label: 'Rahul Sharma settled ₹450', sub: 'Dinner at Indigo · via UPI', go: 'splits' },
      { id: 'n5', icon: TargetIcon, label: 'Emergency fund on track', sub: '₹1,20,000 of ₹3,00,000 saved', go: 'goals' },
      { id: 'n6', icon: ChatCenteredTextIcon, label: '3 transactions need a category', sub: 'Tap to categorise them', go: 'txn' },
    ],
  },
];

// Every notification's own destination (bills, budget, txn, splits, goals)
// is a screen this app hasn't built yet.
const stubNav = (dest: string) => {
  // eslint-disable-next-line no-console
  console.log('[NotificationsScreen] nav ->', dest);
};

function NotificationsScreen({ navigation }: Props) {
  const [read, setRead] = useState<Set<string>>(new Set());

  const markAll = () => {
    setRead(new Set(GROUPS.flatMap(g => g.items.map(x => x.id))));
    showToast('All marked read');
  };

  const open = (item: NotificationItem) => {
    setRead(prev => new Set(prev).add(item.id));
    stubNav(item.go);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface }} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        right={<GoldButton onPress={markAll}>Mark all</GoldButton>}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6 }}>
        {GROUPS.map(group => (
          <View key={group.title} style={{ marginBottom: spacing.s4 }}>
            <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.11, marginHorizontal: 4, marginBottom: spacing.s2 }}>
              {group.title}
            </AppText>
            <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0 }}>
              {group.items.map((item, i, arr) => {
                const unread = !read.has(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => open(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.s4,
                      paddingVertical: spacing.s4,
                      borderBottomWidth: i === arr.length - 1 ? 0 : 1,
                      borderBottomColor: colors.borderSubtle,
                    }}
                  >
                    <IconChip icon={item.icon} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <AppText weight={unread ? 'medium' : 'regular'} style={{ fontSize: 14, color: colors.fg2 }}>
                        {item.label}
                      </AppText>
                      <AppText style={{ fontSize: 12, color: colors.fg3, marginTop: 2 }}>{item.sub}</AppText>
                    </View>
                    <View style={{ width: 8, height: 8, borderRadius: radii.pill, backgroundColor: unread ? colors.gold : 'transparent' }} />
                  </Pressable>
                );
              })}
            </Card>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default NotificationsScreen;
