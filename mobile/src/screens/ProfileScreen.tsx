import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Radius } from '../theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, isGuest, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of Suraksha Call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err: any) {
              console.error('Logout error:', err);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons
            name={isGuest ? 'person-circle-outline' : 'shield-checkmark'}
            size={56}
            color={Colors.primary}
          />
        </View>
        <Text style={styles.name}>{isGuest ? 'Guest User' : user?.name || 'Suraksha User'}</Text>
        <Text style={styles.identifier}>
          {isGuest
            ? 'Demo Mode Active'
            : user?.email || user?.phone || 'Protected Member'}
        </Text>
        {isGuest && (
          <View style={styles.guestBadge}>
            <Text style={styles.guestBadgeText}>Guest Account</Text>
          </View>
        )}
      </View>

      {/* Account Info / Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <Text style={[styles.rowValue, { color: isGuest ? Colors.warning : Colors.safe }]}>
            {isGuest ? 'Guest Access' : 'Verified & Secure'}
          </Text>
        </View>
        {user?.email && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user.email}</Text>
          </View>
        )}
        {user?.phone && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Phone</Text>
            <Text style={styles.rowValue}>{user.phone}</Text>
          </View>
        )}
        {user?.created_at && (
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Member Since</Text>
            <Text style={styles.rowValue}>
              {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* App Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About Suraksha Call</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Application</Text>
          <Text style={styles.rowValue}>Suraksha Call Mobile</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>2.0.0 (Production)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>AI Engine</Text>
          <Text style={styles.rowValue}>Gnani AI Prisma + Evon</Text>
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={styles.rowLabel}>Lead Engineer</Text>
          <Text style={styles.rowValue}>Chaitanya Sanjay Jogekar</Text>
        </View>
      </View>

      {/* Tagline Card */}
      <View style={styles.taglineCard}>
        <Ionicons name="shield" size={24} color={Colors.primary} style={{ marginBottom: 6 }} />
        <Text style={styles.tagline}>"Scam ko number se nahi, baaton se pehchano."</Text>
        <Text style={styles.taglineSub}>
          Real-time Hinglish scam call intelligence powered by AI speech & semantic analysis.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionSection}>
        {isGuest ? (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={async () => {
              await logout();
            }}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.loginButtonText}>Sign In / Register</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  identifier: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  guestBadge: {
    marginTop: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  guestBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.secondaryText,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  taglineCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  taglineSub: {
    fontSize: 12,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 4,
  },
  actionSection: {
    marginTop: Spacing.sm,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.danger,
  },
});

