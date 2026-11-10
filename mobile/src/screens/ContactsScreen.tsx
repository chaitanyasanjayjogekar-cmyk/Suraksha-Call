import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
  TextInput, Modal, ActivityIndicator, Linking, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Radius, Shadow } from '../theme';

export default function ContactsScreen() {
  const { user, isGuest } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchContacts = () => {
    if (isGuest) return;
    setLoading(true);
    authAPI.getContacts()
      .then((res) => setContacts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchContacts, []);

  const addContact = async () => {
    if (!name.trim() || !phone.trim() || !relation.trim()) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    setSaving(true);
    try {
      await authAPI.addContact({ name: name.trim(), phone: phone.trim(), relation: relation.trim() });
      setModalVisible(false);
      setName(''); setPhone(''); setRelation('');
      fetchContacts();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = (id: number, name: string) => {
    Alert.alert('Remove Contact', `Remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await authAPI.deleteContact(id);
          fetchContacts();
        } catch {}
      }},
    ]);
  };

  const sendWhatsAppAlert = (phone: string, name: string) => {
    const msg = encodeURIComponent(`🚨 Suraksha Call Alert: ${user?.name || 'Your family member'} may be on a suspicious scam call right now. Please check on them immediately!\n\nCyber Crime Helpline: 1930`);
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${msg}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp not installed.'));
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={56} color={Colors.border} />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptyText}>Create an account to save emergency contacts and send real alerts.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
          <Text style={styles.headerSub}>Send WhatsApp alerts when scam detected</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : contacts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyTitle}>No contacts yet</Text>
          <Text style={styles.emptyText}>Add family members to alert them when a scam is detected</Text>
          <TouchableOpacity style={styles.addBtnLarge} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.addBtnText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, Shadow.card]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.cName}>{item.name}</Text>
                <Text style={styles.cPhone}>{item.phone}</Text>
                <View style={styles.relationBadge}>
                  <Text style={styles.relationText}>{item.relation}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.waBtn}
                  onPress={() => sendWhatsAppAlert(item.phone, item.name)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-whatsapp" size={16} color={Colors.white} />
                  <Text style={styles.waBtnText}>Alert</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteContact(item.id, item.name)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Contact Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Emergency Contact</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.primaryText} />
              </TouchableOpacity>
            </View>
            {[
              { label: 'Name', value: name, setter: setName, placeholder: 'e.g. Mom', icon: 'person-outline' },
              { label: 'Phone (+91...)', value: phone, setter: setPhone, placeholder: '+919876543210', icon: 'call-outline', type: 'phone-pad' as const },
              { label: 'Relation', value: relation, setter: setRelation, placeholder: 'e.g. Mother / Son', icon: 'heart-outline' },
            ].map((f) => (
              <View key={f.label} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={f.icon as any} size={16} color={Colors.secondaryText} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    value={f.value}
                    onChangeText={f.setter}
                    keyboardType={f.type}
                    placeholderTextColor={Colors.secondaryText}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={addContact}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>Save Contact</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primaryText },
  headerSub: { fontSize: 12, color: Colors.secondaryText, marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  info: { flex: 1 },
  cName: { fontSize: 15, fontWeight: '700', color: Colors.primaryText },
  cPhone: { fontSize: 13, color: Colors.secondaryText, marginTop: 2 },
  relationBadge: { backgroundColor: Colors.inputBg, borderRadius: 10, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, marginTop: 4, borderWidth: 1, borderColor: Colors.border },
  relationText: { fontSize: 11, fontWeight: '600', color: Colors.secondaryText },
  actions: { gap: 8, alignItems: 'center' },
  waBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#16A34A', borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  waBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.primaryText },
  emptyText: { fontSize: 14, color: Colors.secondaryText, textAlign: 'center', lineHeight: 20 },
  addBtnLarge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: Colors.primary, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, gap: Spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.primaryText },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: Colors.secondaryText, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBg, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 46 },
  input: { flex: 1, fontSize: 15, color: Colors.primaryText },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, height: 50, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});

