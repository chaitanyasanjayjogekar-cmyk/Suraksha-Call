import React from 'react';
import Svg, { Circle, G } from 'react-native-svg';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, getRiskColor, getRiskLabel } from '../theme';

interface Props { score: number }

const SIZE = 160;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RiskMeterSVG({ score }: Props) {
  const { primary } = getRiskColor(score);
  const filled = CIRCUMFERENCE * 0.75 * (score / 100);
  const offset = CIRCUMFERENCE - filled;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <G rotation="-135" origin={`${SIZE / 2}, ${SIZE / 2}`}>
          {/* Background track */}
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none" stroke={Colors.border}
            strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE * 0.75} ${CIRCUMFERENCE * 0.25}`}
          />
          {/* Score arc */}
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none" stroke={primary}
            strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRCUMFERENCE - filled}`}
            strokeDashoffset={0}
          />
        </G>
      </Svg>
      {/* Center text */}
      <View style={styles.center}>
        <Text style={[styles.score, { color: primary }]}>{score}</Text>
        <Text style={styles.outOf}>/100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  score: { fontSize: 36, fontWeight: '800' },
  outOf: { fontSize: 12, color: Colors.secondaryText, marginTop: -2 },
});

