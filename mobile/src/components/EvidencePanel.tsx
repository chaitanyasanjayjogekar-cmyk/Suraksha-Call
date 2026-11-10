import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';

interface Props {
  evidence: string[];
  status: string;
  scamType?: string;
}

export default function EvidencePanel({ evidence, status, scamType }: Props) {
  const isSafe = status === 'SAFE';
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Evidence Analysis</Text>
        {scamType && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{scamType}</Text>
          </View>
        )}
      </View>
      {evidence.map((item, i) => (
        <View key={i} style={[styles.item, isSafe ? styles.itemSafe : styles.itemDanger]}>
          <Ionicons
            name={isSafe ? 'checkmark-circle' : 'shield-half'}
            size={16}
            color={isSafe ? Colors.safe : Colors.danger}
            style={{ marginTop: 2 }}
          />
          <Text style={[styles.itemText, { color: isSafe ? '#14532D' : '#7F1D1D' }]}>
            {item}
          </Text>
        </View>
      ))}
      {!isSafe && (
        <View style={styles.tip}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.warning} />
          <Text style={styles.tipText}>Hang up and call 1930 to report fraud.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  title: { fontSize: 15, fontWeight: '700', color: Colors.primaryText },
  badge: { backgroundColor: '#FEF2F2', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#FECACA' },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.danger },
  item: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: Radius.sm, alignItems: 'flex-start' },
  itemSafe: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  itemDanger: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  itemText: { fontSize: 13, flex: 1, lineHeight: 18 },
  tip: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#FFFBEB', borderRadius: Radius.sm, padding: 8, borderWidth: 1, borderColor: '#FDE68A' },
  tipText: { fontSize: 12, color: '#78350F', flex: 1 },
});

