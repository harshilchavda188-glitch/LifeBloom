import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { getCleaningTasks, saveCleaningTasks, CleaningTask, getToday } from '@/lib/storage';
import * as Crypto from 'expo-crypto';

const ROOMS = ['Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Balcony', 'Other'];
const FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;

export default function HomeManageScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState('Kitchen');
  const [frequency, setFrequency] = useState<typeof FREQUENCIES[number]>('weekly');
  const today = getToday();
  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  async function loadTasks() {
    const t = await getCleaningTasks();
    setTasks(t);
  }

  async function addCleaningTask() {
    if (!title.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const nextDue = new Date();
    if (frequency === 'daily') nextDue.setDate(nextDue.getDate() + 1);
    else if (frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
    else nextDue.setMonth(nextDue.getMonth() + 1);

    const newTask: CleaningTask = {
      id: Crypto.randomUUID(),
      title: title.trim(),
      room,
      frequency,
      lastDone: null,
      nextDue: nextDue.toISOString().split('T')[0],
    };
    const updated = [...tasks, newTask];
    await saveCleaningTasks(updated);
    setTasks(updated);
    setTitle('');
    setShowAdd(false);
  }

  async function markDone(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = tasks.map(t => {
      if (t.id !== id) return t;
      const nextDue = new Date();
      if (t.frequency === 'daily') nextDue.setDate(nextDue.getDate() + 1);
      else if (t.frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
      else nextDue.setMonth(nextDue.getMonth() + 1);
      return { ...t, lastDone: today, nextDue: nextDue.toISOString().split('T')[0] };
    });
    await saveCleaningTasks(updated);
    setTasks(updated);
  }

  async function removeTask(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = tasks.filter(t => t.id !== id);
    await saveCleaningTasks(updated);
    setTasks(updated);
  }

  const dueTasks = tasks.filter(t => t.nextDue <= today);
  const upcomingTasks = tasks.filter(t => t.nextDue > today);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Home</Text>
        <Pressable onPress={() => setShowAdd(!showAdd)}>
          <Ionicons name={showAdd ? "close" : "add-circle"} size={28} color={Colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={[...dueTasks, ...upcomingTasks]}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!tasks.length || showAdd}
        ListHeaderComponent={
          <>
            {showAdd && (
              <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.duration(300) : undefined} style={styles.addForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Task name (e.g., Clean kitchen shelves)"
                  placeholderTextColor={Colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />
                <Text style={styles.label}>Room</Text>
                <View style={styles.chipRow}>
                  {ROOMS.map(r => (
                    <Pressable
                      key={r}
                      onPress={() => setRoom(r)}
                      style={[styles.chip, room === r && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, room === r && styles.chipTextActive]}>{r}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.chipRow}>
                  {FREQUENCIES.map(f => (
                    <Pressable
                      key={f}
                      onPress={() => setFrequency(f)}
                      style={[styles.chip, frequency === f && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, frequency === f && styles.chipTextActive]}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable
                  onPress={addCleaningTask}
                  disabled={!title.trim()}
                  style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.9 }, !title.trim() && { opacity: 0.5 }]}
                >
                  <Text style={styles.addBtnText}>Add Task</Text>
                </Pressable>
              </Animated.View>
            )}

            {dueTasks.length > 0 && (
              <Text style={styles.sectionLabel}>Due Today</Text>
            )}
          </>
        }
        ListEmptyComponent={
          !showAdd ? (
            <View style={styles.empty}>
              <Ionicons name="home-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No cleaning tasks</Text>
              <Text style={styles.emptySubtitle}>Create your cleaning schedule</Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const isDue = item.nextDue <= today;
          return (
            <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(index * 50).duration(300) : undefined}>
              {index === dueTasks.length && upcomingTasks.length > 0 && (
                <Text style={styles.sectionLabel}>Upcoming</Text>
              )}
              <Pressable
                onLongPress={() => removeTask(item.id)}
                style={({ pressed }) => [styles.taskCard, pressed && { opacity: 0.9 }]}
              >
                <Pressable onPress={() => markDone(item.id)} style={styles.checkBtn}>
                  <Ionicons
                    name={isDue ? "alert-circle" : "ellipse-outline"}
                    size={24}
                    color={isDue ? Colors.warning : Colors.textMuted}
                  />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskMeta}>
                    {item.room} {'\u00B7'} {item.frequency} {item.lastDone ? `${'\u00B7'} Last: ${item.lastDone}` : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() => markDone(item.id)}
                  style={[styles.doneBtn, { backgroundColor: Colors.success + '18' }]}
                >
                  <Ionicons name="checkmark" size={18} color={Colors.success} />
                </Pressable>
              </Pressable>
            </Animated.View>
          );
        }}
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
  addForm: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: Colors.text,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
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
  sectionLabel: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  checkBtn: {
    padding: 2,
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  taskMeta: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  doneBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textMuted,
  },
});
