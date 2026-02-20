import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';

const MENU_ITEMS = [
  {
    section: 'Life Management',
    items: [
      { key: 'home', icon: 'home', label: 'Home Management', color: '#F4A261', route: '/home-manage' },
      { key: 'safety', icon: 'shield-checkmark', label: 'Safety & SOS', color: '#E74C3C', route: '/safety' },
      { key: 'health', icon: 'heart', label: 'Health & Wellness', color: '#4CAF82', route: '/health' },
      { key: 'focus', icon: 'timer', label: 'Focus Timer', color: '#5B9BD5', route: '/pomodoro' },
    ],
  },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  async function handleLogout() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.background }]}
      contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + webTopPad + 12 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>More</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>
        </View>
      </View>

      {MENU_ITEMS.map(section => (
        <View key={section.section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, index) => (
              <Pressable
                key={item.key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(item.route as any);
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: Colors.inputBg },
                  index < section.items.length - 1 && styles.menuItemBorder,
                ]}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.version}>LifeBloom v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 24,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.danger + '0D',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.danger,
  },
  version: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
});
