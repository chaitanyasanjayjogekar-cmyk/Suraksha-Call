import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark" size={64} color={Colors.white} />
      </View>
      <Text style={styles.title}>Suraksha Call</Text>
      <Text style={styles.tagline}>"Scam ko number se nahi,{'\n'}baaton se pehchano."</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconWrap: {
    width: 112,
    height: 112,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

