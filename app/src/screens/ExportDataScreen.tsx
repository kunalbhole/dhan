import { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FileCsvIcon } from 'phosphor-react-native/lib/module/icons/FileCsv';
import { FilePdfIcon } from 'phosphor-react-native/lib/module/icons/FilePdf';
import { DownloadSimpleIcon } from 'phosphor-react-native/lib/module/icons/DownloadSimple';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import RadioRow from '../components/RadioRow';
import SettingsSubScreen from '../components/SettingsSubScreen';
import { colors, spacing } from '../theme';
import { getAllTransactions } from '../lib/db';
import { buildTransactionsCsv, filterForExport, fullDateLabel, shareTransactionsCsv, type ExportRangeId } from '../lib/exportData';
import { parseShortDate } from '../lib/dateRange';
import { showToast } from '../lib/toast';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ExportData'>;

const RANGES: { id: ExportRangeId; label: string }[] = [
  { id: 'month', label: 'This month' },
  { id: 'quarter', label: 'Last 3 months' },
  { id: 'year', label: 'This year' },
  { id: 'custom', label: 'Custom' },
];

const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

function ExportDataScreen({ navigation }: Props) {
  const [fmt, setFmt] = useState<'csv' | 'pdf'>('csv');
  const [range, setRange] = useState<ExportRangeId>('month');
  const [from, setFrom] = useState(fullDateLabel(monthStart));
  const [to, setTo] = useState(fullDateLabel(now.getTime()));
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (fmt === 'pdf') {
      // No PDF-generation library in this app — honest about not doing
      // anything rather than faking an export.
      showToast("PDF export isn't available yet");
      return;
    }
    setExporting(true);
    try {
      const txns = await getAllTransactions();
      const customFrom = range === 'custom' ? parseShortDate(from) : null;
      const customTo = range === 'custom' ? parseShortDate(to) : null;
      const filtered = filterForExport(txns, range, customFrom, customTo);
      if (!filtered.length) {
        showToast('No transactions in that range');
        return;
      }
      const csv = buildTransactionsCsv(filtered);
      await shareTransactionsCsv(csv);
      showToast('Export ready: CSV generated');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SettingsSubScreen title="Export data" onBack={() => navigation.goBack()}>
      <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
        Format
      </AppText>
      <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s4 }}>
        <RadioRow icon={FileCsvIcon} label="CSV" sub="Spreadsheet-ready rows" on={fmt === 'csv'} onPress={() => setFmt('csv')} />
        <RadioRow icon={FilePdfIcon} label="PDF" sub="Formatted statement with charts" on={fmt === 'pdf'} last onPress={() => setFmt('pdf')} />
      </Card>

      <AppText weight="medium" style={{ fontSize: 11, color: colors.fg3, letterSpacing: 0.1, marginHorizontal: 4, marginBottom: spacing.s2 }}>
        Date range
      </AppText>
      <Card style={{ paddingHorizontal: spacing.s4, paddingVertical: 0, marginBottom: spacing.s4 }}>
        {RANGES.map((r, i) => (
          <RadioRow key={r.id} label={r.label} on={range === r.id} last={i === RANGES.length - 1} onPress={() => setRange(r.id)} />
        ))}
      </Card>

      {range === 'custom' ? (
        <View style={{ flexDirection: 'row', gap: spacing.s2, marginBottom: spacing.s2 }}>
          <View style={{ flex: 1 }}>
            <Field label="From" value={from} onChangeText={setFrom} placeholder="1 Sep 2026" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="To" value={to} onChangeText={setTo} placeholder="18 Sep 2026" />
          </View>
        </View>
      ) : null}

      <Button variant="primary" size="lg" full icon={DownloadSimpleIcon} disabled={exporting} onPress={handleExport}>
        {exporting ? 'Exporting…' : 'Export'}
      </Button>
    </SettingsSubScreen>
  );
}

export default ExportDataScreen;
