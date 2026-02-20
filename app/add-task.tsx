import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { addTask, getToday } from '@/lib/storage';

const CATEGORIES = [
  { key: 'office', label: 'Office', color: Colors.categories.office },
  { key: 'home', label: 'Home', color: Colors.categories.home },
  { key: 'kids', label: 'Kids', color: Colors.categories.kids },
  { key: 'personal', label: 'Personal', color: Colors.categories.personal },
  { key: 'health', label: 'Health', color: Colors.categories.health },
] as const;

const PRIORITIES = ['low', 'medium', 'high'] as const;
const RECURRING = ['none', 'daily', 'weekly', 'monthly'] as const;

export default function AddTaskSheet() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]['key']>('personal');
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>('medium');
  const [recurring, setRecurring] = useState<typeof RECURRING[number]>('none');
  const [dueDate, setDueDate] = useState(getToday());

  async function handleSave() {
    if (!title.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTask({
      title: title.trim(),
      category,
      completed: false,
      dueDate,
      recurring,
      priority,
    });
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sheetTitle}>New Task</Text>

      <TextInput
        style={styles.input}
        placeholder="What needs to be done?"
        placeholderTextColor={Colors.textMuted}
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map(c => (
          <Pressable
            key={c.key}
            onPress={() => setCategory(c.key)}
            style={[
              styles.chip,
              category === c.key && { backgroundColor: c.color + '20', borderColor: c.color },
            ]}
          >
            <View style={[styles.chipDot, { backgroundColor: c.color }]} />
            <Text style={[styles.chipText, category === c.key && { color: c.color }]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Priority</Text>
      <View style={styles.chipRow}>
        {PRIORITIES.map(p => (
          <Pressable
            key={p}
            onPress={() => setPriority(p)}
            style={[
              styles.chip,
              priority === p && {
                backgroundColor: (p === 'high' ? Colors.danger : p === 'medium' ? Colors.warning : Colors.success) + '20',
                borderColor: p === 'high' ? Colors.danger : p === 'medium' ? Colors.warning : Colors.success,
              },
            ]}
          >
            <Text style={[styles.chipText, priority === p && {
              color: p === 'high' ? Colors.danger : p === 'medium' ? Colors.warning : Colors.success,
            }]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Repeat</Text>
      <View style={styles.chipRow}>
        {RECURRING.map(r => (
          <Pressable
            key={r}
            onPress={() => setRecurring(r)}
            style={[
              styles.chip,
              recurring === r && { backgroundColor: Colors.info + '20', borderColor: Colors.info },
            ]}
          >
            {r !== 'none' && <Ionicons name="repeat" size={12} color={recurring === r ? Colors.info : Colors.textMuted} />}
            <Text style={[styles.chipText, recurring === r && { color: Colors.info }]}>
              {r === 'none' ? 'Once' : r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Due Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={Colors.textMuted}
        value={dueDate}
        onChangeText={setDueDate}
      />

      <Pressable
        onPress={handleSave}
        disabled={!title.trim()}
        style={({ pressed }) => [
          styles.saveBtn,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          !title.trim() && { opacity: 0.5 },
        ]}
      >
        <Text style={styles.saveBtnText}>Add Task</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 12,
    gap: 14,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Nunito_500Medium',
    color: Colors.text,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
});
