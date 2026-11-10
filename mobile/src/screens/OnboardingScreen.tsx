import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, StatusBar, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Radius } from '../theme';
import { ONBOARDING_SLIDES } from '../utils/constants';

export default function OnboardingScreen({ navigation }: any) {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const { width } = useWindowDimensions();
  const { continueAsGuest } = useAuth();

  const goNext = () => {
    if (current < ONBOARDING_SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <FlatList
        ref={flatRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.emojiBox, { backgroundColor: item.color + '15' }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {ONBOARDING_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === current ? Colors.primary : Colors.border }]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnPrimary} onPress={goNext} activeOpacity={0.8}>
          <Text style={styles.btnPrimaryText}>
            {current === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnGuest}
          onPress={continueAsGuest}
          activeOpacity={0.7}
        >
          <Text style={styles.btnGuestText}>Continue as Guest (Demo only)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emojiBox: {
    width: 120, height: 120, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
  },
  emoji: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.primaryText, textAlign: 'center', marginBottom: Spacing.md },
  subtitle: { fontSize: 16, color: Colors.secondaryText, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.lg, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  footer: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.xl },
  btnPrimary: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  btnGuest: { alignItems: 'center', paddingVertical: Spacing.sm },
  btnGuestText: { color: Colors.secondaryText, fontSize: 14 },
});

