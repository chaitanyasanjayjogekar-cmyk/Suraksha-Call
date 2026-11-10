import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Radius, Typography, Shadow } from '../theme';

export default function RegisterScreen({ navigation }: any) {
  const { register, continueAsGuest } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name is required.'); return; }
    if (!email.trim() && !phone.trim()) { Alert.alert('Error', 'Email or phone is required.'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password,
      });
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Please try again.');
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

        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.primaryText} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Ionicons name="shield-checkmark" size={28} color={Colors.white} />
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.tagline}>Suraksha Call — Stay safe from scams</Text>
        </View>

        <View style={[styles.card, Shadow.card]}>
          {/* Name */}
          {[
            { label: 'Full Name *', icon: 'person-outline', value: name, setter: setName, type: 'default' as const, placeholder: 'Chaitanya Jogekar' },
            { label: 'Email', icon: 'mail-outline', value: email, setter: setEmail, type: 'email-address' as const, placeholder: 'your@email.com' },
            { label: 'Phone', icon: 'call-outline', value: phone, setter: setPhone, type: 'phone-pad' as const, placeholder: '+91 98765 43210' },
          ].map((f) => (
            <View key={f.label} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name={f.icon as any} size={17} color={Colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.secondaryText}
                  value={f.value}
                  onChangeText={f.setter}
                  keyboardType={f.type}
                  autoCapitalize={f.type === 'default' ? 'words' : 'none'}
                  editable={!loading}
                />
              </View>
            </View>
          ))}

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={17} color={Colors.secondaryText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min. 6 characters"
                placeholderTextColor={Colors.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPwd((v) => !v)} style={{ padding: 4 }}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={17} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.btnPrimaryText}>Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.signInLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInText}>Already have an account? <Text style={{ color: Colors.primary, fontWeight: '600' }}>Sign In</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest}>
            <Text style={styles.guestText}>Continue as Guest (Demo only)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingTop: 50 },
  back: { marginBottom: Spacing.md, alignSelf: 'flex-start' },
  header: { alignItems: 'center', marginBottom: Spacing.lg },
  logoBox: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  appName: { fontSize: 22, fontWeight: '700', color: Colors.primaryText },
  tagline: { fontSize: 13, color: Colors.secondaryText, marginTop: 4 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  fieldGroup: { marginBottom: Spacing.md },
  fieldLabel: { ...Typography.label, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBg,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: Colors.primaryText },
  btnPrimary: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    height: 50, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  signInLink: { alignItems: 'center', marginTop: Spacing.md },
  signInText: { fontSize: 14, color: Colors.secondaryText },
  guestBtn: { alignItems: 'center', marginTop: Spacing.sm },
  guestText: { color: Colors.secondaryText, fontSize: 13 },
});

