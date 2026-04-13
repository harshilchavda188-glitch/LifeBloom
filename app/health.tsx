import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import {
  getWaterLog,
  saveWaterLog,
  getMoodEntries,
  saveMoodEntries,
  getToday,
  MoodEntry,
} from '@/lib/storage';
import * as Crypto from 'expo-crypto';

const MOODS = [
  { value: 5, icon: 'happy', label: 'Great', color: '#4CAF82' },
  { value: 4, icon: 'happy-outline', label: 'Good', color: '#8BC34A' },
  { value: 3, icon: 'remove-circle-outline', label: 'Okay', color: '#FFC107' },
  { value: 2, icon: 'sad-outline', label: 'Low', color: '#FF9800' },
  { value: 1, icon: 'sad', label: 'Bad', color: '#E74C3C' },
];

export default function HealthScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const today = getToday();
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  const isLargeScreen = width > 768;
  const contentWidth = isLargeScreen ? 720 : width;
  const horizontalPadding = isLargeScreen ? (width - contentWidth) / 2 : 0;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const [w, m] = await Promise.all([getWaterLog(today), getMoodEntries()]);
    setWaterGlasses(w.glasses);
    setMoodEntries(m);
    const todayEntry = m.find(e => e.date === today);
    if (todayEntry) setTodayMood(todayEntry.mood);
  }

  async function addWater() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCount = Math.min(waterGlasses + 1, 12);
    setWaterGlasses(newCount);
    await saveWaterLog({ date: today, glasses: newCount });
  }

  async function removeWater() {
    if (waterGlasses <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCount = waterGlasses - 1;
    setWaterGlasses(newCount);
    await saveWaterLog({ date: today, glasses: newCount });
  }

  async function setMood(value: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTodayMood(value);
    const existing = moodEntries.filter(e => e.date !== today);
    const entry: MoodEntry = {
      id: Crypto.randomUUID(),
      date: today,
      mood: value,
      note: '',
    };
    const updated = [...existing, entry];
    setMoodEntries(updated);
    await saveMoodEntries(updated);
  }

  const waterProgress = (waterGlasses / 8) * 100;
  const last7 = moodEntries
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad, paddingHorizontal: horizontalPadding }]}>
      <View style={isLargeScreen ? { alignSelf: 'center', width: contentWidth } : { width: '100%' }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Health & Wellness</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(500) : undefined}>
            <LinearGradient
              colors={['#4CAF82', '#2E8B6A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.waterCard}
            >
              <View style={styles.waterHeader}>
                <Ionicons name="water" size={32} color="#fff" />
                <View>
                  <Text style={styles.waterTitle}>Water Tracker</Text>
                  <Text style={styles.waterSubtitle}>Goal: 8 Glasses</Text>
                </View>
              </View>
              <View style={styles.waterControls}>
                <Pressable onPress={removeWater} style={styles.waterBtn}>
                  <Ionicons name="remove" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.waterCount}>{waterGlasses}</Text>
                <Pressable onPress={addWater} style={styles.waterBtn}>
                  <Ionicons name="add" size={24} color="#fff" />
                </Pressable>
              </View>
              <View style={styles.waterProgress}>
                <View style={[styles.waterFill, { width: `${Math.min(waterProgress, 100)}%` }]} />
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(500) : undefined}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {MOODS.map(m => (
                <Pressable
                  key={m.value}
                  onPress={() => setMood(m.value)}
                  style={[styles.moodBtn, todayMood === m.value && { backgroundColor: m.color + '20', borderColor: m.color }]}
                >
                  <Ionicons name={m.icon as any} size={28} color={todayMood === m.value ? m.color : Colors.textMuted} />
                  <Text style={[styles.moodLabel, todayMood === m.value && { color: m.color }]}>{m.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(300).duration(500) : undefined}>
            <Text style={styles.sectionTitle}>Mood History</Text>
            {moodEntries.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="calendar-outline" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No entries yet</Text>
              </View>
            ) : (
              <View style={styles.history}>
                {last7.map((entry, idx) => {
                  const mood = MOODS.find(m => m.value === entry.mood);
                  return (
                    <View key={entry.id} style={[styles.historyItem, idx === last7.length - 1 && { borderBottomWidth: 0 }]}>
                      <Text style={styles.historyDate}>
                        {new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
                      </Text>
                      <View style={[styles.historyMood, { backgroundColor: (mood?.color || Colors.primary) + '18' }]}>
                        <Ionicons name={mood?.icon as any || 'happy'} size={18} color={mood?.color || Colors.primary} />
                        <Text style={[styles.historyMoodText, { color: mood?.color || Colors.primary }]}>{mood?.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>
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
  waterCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  waterTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  waterSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  waterCount: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
    marginBottom: 12,
  },
  waterBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  waterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassGrid: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  glass: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassFilled: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  moodSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  moodLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textMuted,
  },
  historySection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  historyList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  historyDate: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
  },
  historyMood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipsCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.accent + '10',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  waterProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  waterFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  history: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginHorizontal: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  historyDate: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
  },
  historyMood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyMoodText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textMuted,
  },
});
