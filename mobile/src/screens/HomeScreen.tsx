import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, StatusBar, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { analysisAPI } from '../services/api';
import { Colors, Spacing, Radius, Shadow } from '../theme';
import { getRiskColor, getRiskLabel } from '../theme';
import RiskMeterSVG from '../components/RiskMeter';
import TranscriptPanel from '../components/TranscriptPanel';
import EvidencePanel from '../components/EvidencePanel';
import WarningBanner from '../components/WarningBanner';

type AnalysisResult = {
  risk_score: number;
  status: string;
  scam_type?: string;
  evidence: string[];
  warning: boolean;
  explanation: string;
  transcript?: string;
  is_demo: boolean;
};

type TranscriptData = {
  segments: Array<{ speaker: string; text: string; timestamp: number; is_suspicious: boolean; suspicious_words: string[] }>;
  full_text: string;
  is_demo: boolean;
};

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const processResult = useCallback((data: any) => {
    const a = data.analysis as AnalysisResult;
    setAnalysis(a);
    setTranscript(data.transcript);
    if (a.risk_score >= 80) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  // ── Recording ─────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow microphone access in settings.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      setAnalysis(null);
      setTranscript(null);
      timerRef.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000);
    } catch (err) {
      Alert.alert('Error', 'Could not start recording. Please try again.');
    }
  };

  const stopAndAnalyze = async () => {
    if (!recordingRef.current) return;
    clearInterval(timerRef.current!);
    setIsRecording(false);
    setIsAnalyzing(true);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (!uri) throw new Error('No audio recorded');

      const form = new FormData();
      form.append('file', { uri, name: 'recording.m4a', type: 'audio/m4a' } as any);
      const res = await analysisAPI.uploadAudio(form);
      processResult(res.data);
    } catch (err: any) {
      Alert.alert('Analysis Failed', err.message || 'Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── File Upload ───────────────────────────────────────────
  const pickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setIsAnalyzing(true);
      setAnalysis(null);
      setTranscript(null);
      const form = new FormData();
      form.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'audio/mpeg' } as any);
      const res = await analysisAPI.uploadAudio(form);
      processResult(res.data);
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Demo ──────────────────────────────────────────────────
  const runDemo = async (type: 'normal' | 'scam') => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setTranscript(null);
    try {
      const res = await analysisAPI.demo(type);
      processResult(res.data);
    } catch {
      Alert.alert('Error', 'Demo unavailable. Is the backend running?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fmtDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const riskColors = analysis ? getRiskColor(analysis.risk_score) : getRiskColor(0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.white} />
          </View>
          <Text style={styles.appName}>Suraksha Call</Text>
        </View>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLanguage((l) => l === 'hi' ? 'en' : 'hi')}
        >
          <Text style={styles.langText}>{language === 'hi' ? '🇮🇳 HI' : '🇬🇧 EN'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Warning Banner */}
        {analysis?.warning && <WarningBanner analysis={analysis} warningAudio={null} />}

        {/* Risk Meter */}
        <View style={[styles.card, Shadow.card]}>
          <RiskMeterSVG score={analysis?.risk_score || 0} />
          {analysis && (
            <>
              <Text style={[styles.statusText, { color: riskColors.primary }]}>
                {getRiskLabel(analysis.risk_score)}
              </Text>
              {analysis.scam_type && (
                <Text style={styles.scamType}>{analysis.scam_type}</Text>
              )}
              <Text style={styles.explanation} numberOfLines={4}>
                {analysis.explanation}
              </Text>
            </>
          )}
          {!analysis && !isAnalyzing && (
            <Text style={styles.idleText}>
              {language === 'hi'
                ? 'Record karein ya demo chalayein'
                : 'Start recording or run a demo'}
            </Text>
          )}
          {isAnalyzing && (
            <View style={styles.analyzingRow}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.analyzingText}>Analyzing call...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={[styles.card, Shadow.card]}>
          <Text style={styles.sectionTitle}>
            {language === 'hi' ? 'Call Input' : 'Call Input'}
          </Text>

          {/* Record button */}
          {!isRecording ? (
            <TouchableOpacity
              style={[styles.bigBtn, { backgroundColor: Colors.danger }]}
              onPress={startRecording}
              disabled={isAnalyzing}
              activeOpacity={0.85}
            >
              <Ionicons name="mic" size={22} color={Colors.white} />
              <Text style={styles.bigBtnText}>
                {language === 'hi' ? 'Recording Shuru Karein' : 'Start Recording'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View>
              <View style={styles.recordingBadge}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTime}>{fmtDuration(recordingDuration)}</Text>
                <Text style={styles.recordingLabel}>Recording...</Text>
              </View>
              <TouchableOpacity
                style={[styles.bigBtn, { backgroundColor: Colors.primary }]}
                onPress={stopAndAnalyze}
                activeOpacity={0.85}
              >
                <Ionicons name="stop-circle" size={22} color={Colors.white} />
                <Text style={styles.bigBtnText}>Stop &amp; Analyze</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Upload */}
          <TouchableOpacity
            style={[styles.outlineBtn, { marginTop: Spacing.sm }]}
            onPress={pickAndUpload}
            disabled={isRecording || isAnalyzing}
            activeOpacity={0.8}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={Colors.primary} />
            <Text style={styles.outlineBtnText}>
              {language === 'hi' ? 'Audio Upload Karein' : 'Upload Audio File'}
            </Text>
          </TouchableOpacity>

          {/* Demo buttons */}
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={[styles.demoBtn, { backgroundColor: Colors.safe }]}
              onPress={() => runDemo('normal')}
              disabled={isRecording || isAnalyzing}
            >
              <Ionicons name="checkmark-circle" size={15} color={Colors.white} />
              <Text style={styles.demoBtnText}>Normal Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.demoBtn, { backgroundColor: '#EA580C' }]}
              onPress={() => runDemo('scam')}
              disabled={isRecording || isAnalyzing}
            >
              <Ionicons name="warning" size={15} color={Colors.white} />
              <Text style={styles.demoBtnText}>Scam Demo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transcript */}
        {transcript && transcript.segments.length > 0 && (
          <TranscriptPanel segments={transcript.segments} />
        )}

        {/* Evidence */}
        {analysis && analysis.evidence.length > 0 && (
          <EvidencePanel evidence={analysis.evidence} status={analysis.status} scamType={analysis.scam_type} />
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          AI advisory only · Not a legal guarantee · Helpline: 1930
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  appName: { fontSize: 17, fontWeight: '700', color: Colors.primaryText },
  langBtn: { backgroundColor: Colors.inputBg, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.border },
  langText: { fontSize: 12, fontWeight: '600', color: Colors.primaryText },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  statusText: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: Spacing.sm },
  scamType: { fontSize: 14, color: Colors.secondaryText, textAlign: 'center', marginTop: 4 },
  explanation: { fontSize: 14, color: Colors.primaryText, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  idleText: { fontSize: 14, color: Colors.secondaryText, textAlign: 'center', marginTop: Spacing.sm },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: Spacing.sm },
  analyzingText: { color: Colors.primary, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.primaryText, marginBottom: Spacing.md },
  bigBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: Radius.md, height: 52,
  },
  bigBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  outlineBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: Radius.md, height: 48,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  outlineBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  demoRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  demoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, height: 42, borderRadius: Radius.sm,
  },
  demoBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  recordingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: Radius.sm, padding: 10, marginBottom: 10,
    borderWidth: 1, borderColor: '#FECACA',
  },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  recordingTime: { fontFamily: 'monospace', fontSize: 16, fontWeight: '700', color: Colors.danger },
  recordingLabel: { fontSize: 13, color: '#DC2626', flex: 1 },
  disclaimer: { textAlign: 'center', color: Colors.secondaryText, fontSize: 11, marginTop: Spacing.sm },
});

