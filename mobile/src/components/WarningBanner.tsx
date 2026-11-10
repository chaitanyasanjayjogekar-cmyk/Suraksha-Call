import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Colors, Spacing, Radius } from '../theme';

const WARNING_TEXT = 'Savdhaan! Yeh scam ho sakta hai. OTP mat dijiye. Abhi call kaat dein aur 1930 par call karein.';

export default function WarningBanner({ analysis, warningAudio }: { analysis: any; warningAudio: any }) {
  if (!analysis || analysis.risk_score < 80) return null;

  const playWarning = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Speech.speak(WARNING_TEXT, { language: 'hi-IN', rate: 0.85, pitch: 1.0 });
  };

  return (
    <View style={styles.banner}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="alert-circle" size={22} color={Colors.white} />
        </View>
        <View style={styles.textBox}>
          <Text style={styles.title}>⚠ HIGH RISK — Potential Scam</Text>
          {analysis.scam_type && <Text style={styles.type}>{analysis.scam_type}</Text>}
          <Text style={styles.msg}>OTP / PIN / Banking info share mat karein. Call kaatein!</Text>
          <Text style={styles.helpline}>Helpline: <Text style={styles.helplineNum}>1930</Text></Text>
        </View>
      </View>

      <TouchableOpacity style={styles.voiceBtn} onPress={playWarning} activeOpacity={0.8}>
        <Ionicons name="volume-high" size={16} color={Colors.white} />
        <Text style={styles.voiceBtnText}>Hindi Voice Warning</Text>
      </TouchableOpacity>

      <View style={styles.hindiBox}>
        <Text style={styles.hindiText}>
          🔊 "Ye scam ho sakta hai. OTP mat dijiye. Call kaat dijiye aur official source se verify kijiye."
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF2F2', borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: '#FECACA', padding: Spacing.md,
    gap: Spacing.sm,
  },
  row: { flexDirection: 'row', gap: Spacing.sm },
  iconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  textBox: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: Colors.danger },
  type: { fontSize: 12, color: '#B91C1C', marginTop: 2 },
  msg: { fontSize: 13, color: '#7F1D1D', marginTop: 4, lineHeight: 18 },
  helpline: { fontSize: 12, color: '#B91C1C', marginTop: 4 },
  helplineNum: { fontWeight: '800' },
  voiceBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.danger, borderRadius: Radius.sm,
    paddingVertical: 10,
  },
  voiceBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  hindiBox: { backgroundColor: '#FEE2E2', borderRadius: Radius.sm, padding: 10, borderWidth: 1, borderColor: '#FCA5A5' },
  hindiText: { fontSize: 13, color: '#7F1D1D', lineHeight: 18 },
});

