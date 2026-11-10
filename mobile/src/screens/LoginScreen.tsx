import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Radius, Typography, Shadow } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const { login, continueAsGuest } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email/phone and password.');
      return;
    }
    setLoading(true);
    try {
      await login(identifier.trim(), password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Ionicons name="shield-checkmark" size={32} color={Colors.white} />
          </View>
          <Text style={styles.appName}>Suraksha Call</Text>
          <Text style={styles.tagline}>Welcome back</Text>
        </View>

        {/* Form Card */}
        <View style={[styles.card, Shadow.card]}>
          <Text style={styles.cardTitle}>Sign In</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email or Phone</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.secondaryText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter email or phone"
                placeholderTextColor={Colors.secondaryText}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.secondaryText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter password"
                placeholderTextColor={Colors.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPwd((v) => !v)} style={{ padding: 4 }}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.btnPrimaryText}>Sign In</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnOutlineText}>Create New Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest} activeOpacity={0.7}>
            <Ionicons name="eye-outline" size={15} color={Colors.secondaryText} />
            <Text style={styles.guestText}>Continue as Guest (Demo only)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          AI analysis only. Not a legal guarantee.{'\n'}Helpline: 1930
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: { fontSize: 24, fontWeight: '700', color: Colors.primaryText },
  tagline: { fontSize: 15, color: Colors.secondaryText, marginTop: 4 },
  card: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Colors.primaryText, marginBottom: Spacing.lg },
  fieldGroup: { marginBottom: Spacing.md },
  fieldLabel: { ...Typography.label, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.inputBg, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: Colors.primaryText },
  btnPrimary: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    height: 50, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: Spacing.sm, color: Colors.secondaryText, fontSize: 13 },
  btnOutline: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.sm,
    height: 50, alignItems: 'center', justifyContent: 'center',
  },
  btnOutlineText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  guestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: Spacing.md },
  guestText: { color: Colors.secondaryText, fontSize: 13 },
  disclaimer: { textAlign: 'center', color: Colors.secondaryText, fontSize: 12, marginTop: Spacing.xl, lineHeight: 18 },
});

