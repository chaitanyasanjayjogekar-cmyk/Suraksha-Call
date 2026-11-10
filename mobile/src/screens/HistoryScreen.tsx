import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { analysisAPI } from '../services/api';
import { Colors, Spacing, Radius, Shadow } from '../theme';
import { getRiskColor, getRiskLabel } from '../theme';

export default function HistoryScreen() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analysisAPI.recentAnalyses()
      .then((res) => setAnalyses(res.data.analyses || []))
      .catch(() => setAnalyses([]))
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const { primary, light, border } = getRiskColor(item.risk_score);
    const ts = item.timestamp ? new Date(item.timestamp + 'Z') : new Date();
    return (
      <View style={[styles.card, Shadow.card, { borderLeftColor: primary, borderLeftWidth: 4 }]}>
        <View style={styles.row}>
          <View style={[styles.scoreBadge, { backgroundColor: light }]}>
            <Text style={[styles.score, { color: primary }]}>{item.risk_score}%</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.status, { color: primary }]}>{item.status?.replace('_', ' ')}</Text>
            {item.scam_type ? <Text style={styles.scamType}>{item.scam_type}</Text> : null}
            {item.transcript_preview ? (
              <Text style={styles.preview} numberOfLines={2}>{item.transcript_preview}</Text>
            ) : null}
          </View>
          <View style={styles.meta}>
            {item.is_demo ? (
              <View style={styles.demoBadge}><Text style={styles.demoText}>DEMO</Text></View>
            ) : (
              <Text style={styles.time}>{ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Ionicons name="time-outline" size={20} color={Colors.primaryText} />
        <Text style={styles.headerTitle}>Analysis History</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : analyses.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>No analyses yet</Text>
          <Text style={styles.emptyHint}>Run a demo or analyze a call to see history</Text>
        </View>
      ) : (
        <FlatList
          data={analyses}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primaryText },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  scoreBadge: { width: 48, height: 48, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  score: { fontSize: 16, fontWeight: '800' },
  info: { flex: 1 },
  status: { fontSize: 14, fontWeight: '700' },
  scamType: { fontSize: 12, color: Colors.secondaryText, marginTop: 2 },
  preview: { fontSize: 12, color: Colors.secondaryText, marginTop: 4, lineHeight: 16 },
  meta: { alignItems: 'flex-end' },
  time: { fontSize: 11, color: Colors.secondaryText },
  demoBadge: { backgroundColor: Colors.inputBg, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: Colors.border },
  demoText: { fontSize: 10, fontWeight: '700', color: Colors.secondaryText },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.primaryText },
  emptyHint: { fontSize: 14, color: Colors.secondaryText, textAlign: 'center' },
});

