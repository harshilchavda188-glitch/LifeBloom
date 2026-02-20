import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { getTasks, updateTask, deleteTask, Task, getToday } from '@/lib/storage';

const CATEGORIES = [
  { key: 'all', label: 'All', color: Colors.primary },
  { key: 'office', label: 'Office', color: Colors.categories.office },
  { key: 'home', label: 'Home', color: Colors.categories.home },
  { key: 'kids', label: 'Kids', color: Colors.categories.kids },
  { key: 'personal', label: 'Personal', color: Colors.categories.personal },
  { key: 'health', label: 'Health', color: Colors.categories.health },
];

const VIEWS = ['Today', 'Week', 'All'] as const;

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedView, setSelectedView] = useState<typeof VIEWS[number]>('Today');
  const today = getToday();

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  async function loadTasks() {
    const t = await getTasks();
    setTasks(t);
  }

  async function toggleTask(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
      loadTasks();
    }
  }

  async function removeTask(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteTask(id);
    loadTasks();
  }

  const filteredTasks = tasks.filter(t => {
    if (selectedCat !== 'all' && t.category !== selectedCat) return false;
    if (selectedView === 'Today') return t.dueDate === today;
    if (selectedView === 'Week') {
      const taskDate = new Date(t.dueDate);
      const todayDate = new Date(today);
      const weekEnd = new Date(todayDate);
      weekEnd.setDate(todayDate.getDate() + 7);
      return taskDate >= todayDate && taskDate <= weekEnd;
    }
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority) {
      const pOrder = { high: 0, medium: 1, low: 2 };
      return pOrder[a.priority] - pOrder[b.priority];
    }
    return 0;
  });

  const completedCount = filteredTasks.filter(t => t.completed).length;
  const totalCount = filteredTasks.length;
  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Pressable
          onPress={() => router.push('/add-task')}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {totalCount > 0 && (
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }]} />
          </View>
          <Text style={styles.progressText}>{completedCount}/{totalCount}</Text>
        </View>
      )}

      <View style={styles.viewTabs}>
        {VIEWS.map(v => (
          <Pressable
            key={v}
            onPress={() => setSelectedView(v)}
            style={[styles.viewTab, selectedView === v && styles.viewTabActive]}
          >
            <Text style={[styles.viewTabText, selectedView === v && styles.viewTabTextActive]}>{v}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedCat(item.key)}
            style={[
              styles.catChip,
              selectedCat === item.key && { backgroundColor: item.color + '20', borderColor: item.color },
            ]}
          >
            <View style={[styles.catDot, { backgroundColor: item.color }]} />
            <Text style={[styles.catChipText, selectedCat === item.key && { color: item.color }]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.taskList}
        scrollEnabled={!!filteredTasks.length}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkbox-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to create your first task</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
            <Pressable
              onPress={() => toggleTask(item.id)}
              onLongPress={() => removeTask(item.id)}
              style={({ pressed }) => [styles.taskCard, pressed && { opacity: 0.9 }]}
            >
              <View style={[styles.taskCatLine, { backgroundColor: Colors.categories[item.category] || Colors.primary }]} />
              <View style={styles.taskContent}>
                <View style={styles.taskTop}>
                  <Pressable onPress={() => toggleTask(item.id)} style={styles.checkbox}>
                    <Ionicons
                      name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={item.completed ? Colors.success : Colors.textMuted}
                    />
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.taskTitle, item.completed && styles.taskCompleted]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.taskMeta}>
                      <Text style={styles.taskCatLabel}>{item.category}</Text>
                      {item.recurring !== 'none' && (
                        <View style={styles.recurBadge}>
                          <Ionicons name="repeat" size={10} color={Colors.info} />
                          <Text style={styles.recurText}>{item.recurring}</Text>
                        </View>
                      )}
                      {item.priority === 'high' && (
                        <View style={[styles.priBadge, { backgroundColor: Colors.danger + '18' }]}>
                          <Ionicons name="flag" size={10} color={Colors.danger} />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.inputBg,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  viewTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewTabActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  viewTabText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textMuted,
  },
  viewTabTextActive: {
    color: Colors.primary,
  },
  catList: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catChipText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  taskList: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 8,
  },
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  taskCatLine: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: 14,
  },
  taskTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    padding: 2,
  },
  taskTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  taskCatLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  recurBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  recurText: {
    fontSize: 10,
    fontFamily: 'Nunito_500Medium',
    color: Colors.info,
    textTransform: 'capitalize',
  },
  priBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
