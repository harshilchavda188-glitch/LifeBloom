import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import {
  getEmergencyContacts,
  saveEmergencyContacts,
  EmergencyContact,
} from '@/lib/storage';
import * as Crypto from 'expo-crypto';

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [])
  );

  async function loadContacts() {
    const c = await getEmergencyContacts();
    setContacts(c);
  }

  async function addContact() {
    if (!name.trim() || !phone.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newContact: EmergencyContact = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
    };
    const updated = [...contacts, newContact];
    await saveEmergencyContacts(updated);
    setContacts(updated);
    setName('');
    setPhone('');
    setRelationship('');
    setShowAdd(false);
  }

  async function removeContact(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = contacts.filter(c => c.id !== id);
    await saveEmergencyContacts(updated);
    setContacts(updated);
  }

  function callContact(phoneNum: string) {
    Linking.openURL(`tel:${phoneNum}`);
  }

  function handleSOS() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (contacts.length === 0) {
      Alert.alert('No Emergency Contacts', 'Please add emergency contacts first.');
      return;
    }
    Alert.alert(
      'Emergency SOS',
      'This will call your first emergency contact. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => callContact(contacts[0].phone),
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Safety</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!contacts.length || showAdd}
        ListHeaderComponent={
          <>
            <Pressable onPress={handleSOS} style={({ pressed }) => [pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }]}>
              <LinearGradient
                colors={['#E74C3C', '#C0392B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sosCard}
              >
                <View style={styles.sosIcon}>
                  <Ionicons name="warning" size={36} color="#fff" />
                </View>
                <Text style={styles.sosTitle}>Emergency SOS</Text>
                <Text style={styles.sosSubtitle}>Tap to call your emergency contact</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={Colors.info} />
              <Text style={styles.infoText}>
                Add trusted contacts who can be reached in emergencies. Long press a contact to remove.
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              <Pressable onPress={() => setShowAdd(!showAdd)}>
                <Ionicons name={showAdd ? "close" : "add-circle"} size={24} color={Colors.primary} />
              </Pressable>
            </View>

            {showAdd && (
              <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.duration(300) : undefined} style={styles.addForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={Colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Relationship (e.g., Husband, Sister)"
                  placeholderTextColor={Colors.textMuted}
                  value={relationship}
                  onChangeText={setRelationship}
                />
                <Pressable
                  onPress={addContact}
                  disabled={!name.trim() || !phone.trim()}
                  style={({ pressed }) => [
                    styles.addBtn,
                    pressed && { opacity: 0.9 },
                    (!name.trim() || !phone.trim()) && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.addBtnText}>Add Contact</Text>
                </Pressable>
              </Animated.View>
            )}
          </>
        }
        ListEmptyComponent={
          !showAdd ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No emergency contacts yet</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => removeContact(item.id)}
            style={({ pressed }) => [styles.contactCard, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.contactAvatar}>
              <Text style={styles.contactInitial}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.relationship} {item.phone}</Text>
            </View>
            <Pressable onPress={() => callContact(item.phone)} style={styles.callBtn}>
              <Ionicons name="call" size={20} color={Colors.success} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
  },
  sosCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  sosIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sosTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
  },
  sosSubtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.info + '10',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  addForm: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: Colors.text,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  contactAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInitial: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.primary,
  },
  contactName: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  contactPhone: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textMuted,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.success + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textMuted,
  },
});
