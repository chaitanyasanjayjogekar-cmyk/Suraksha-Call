import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';
import { SUSPICIOUS_KEYWORDS } from '../utils/constants';

interface Segment {
  speaker: string;
  text: string;
  timestamp: number;
  is_suspicious: boolean;
  suspicious_words: string[];
}

function HighlightText({ text }: { text: string }) {
  const lower = text.toLowerCase();
  const parts: JSX.Element[] = [];
  let last = 0;

  const matches: { start: number; end: number }[] = [];
  for (const kw of SUSPICIOUS_KEYWORDS) {
    let idx = lower.indexOf(kw);
    while (idx !== -1) {
      matches.push({ start: idx, end: idx + kw.length });
      idx = lower.indexOf(kw, idx + 1);
    }
  }
  matches.sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const m of matches) {
    if (merged.length && m.start < merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, m.end);
    } else {
      merged.push({ ...m });
    }
  }

  for (const m of merged) {
    if (m.start > last) parts.push(<Text key={`t${last}`}>{text.slice(last, m.start)}</Text>);
    parts.push(
      <Text key={`h${m.start}`} style={styles.highlight}>{text.slice(m.start, m.end)}</Text>
    );
    last = m.end;
  }
  if (last < text.length) parts.push(<Text key={`t${last}`}>{text.slice(last)}</Text>);
  return <Text style={styles.segText}>{parts.length ? parts : text}</Text>;
}

export default function TranscriptPanel({ segments }: { segments: Segment[] }) {
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Live Transcript</Text>
      <Text style={styles.hint}><Text style={styles.highlight}>Highlighted</Text> = suspicious</Text>
      <ScrollView style={styles.scroll} nestedScrollEnabled>
        {segments.map((seg, i) => (
          <View key={i} style={[styles.seg, seg.is_suspicious && styles.segSuspicious]}>
            <View style={styles.meta}>
              <Text style={styles.speaker}>{seg.speaker}</Text>
              <Text style={styles.time}>{fmtTime(seg.timestamp)}</Text>
              {seg.is_suspicious && <Ionicons name="warning" size={12} color={Colors.danger} />}
            </View>
            <HighlightText text={seg.text} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card, borderRadius: 12,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  title: { fontSize: 15, fontWeight: '700', color: Colors.primaryText, marginBottom: 4 },
  hint: { fontSize: 12, color: Colors.secondaryText, marginBottom: Spacing.sm },
  scroll: { maxHeight: 220 },
  seg: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  segSuspicious: { backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 8, borderBottomWidth: 0, marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  speaker: { fontSize: 12, fontWeight: '700', color: Colors.primaryText },
  time: { fontSize: 11, color: Colors.secondaryText, fontFamily: 'monospace' },
  segText: { fontSize: 14, color: Colors.primaryText, lineHeight: 20 },
  highlight: { backgroundColor: '#FEE2E2', color: Colors.danger, fontWeight: '600', borderRadius: 3 },
});

