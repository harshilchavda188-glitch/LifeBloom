import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { 
  getContentWidth, 
  getHorizontalPadding, 
  getWebTopPadding,
  getGridColumns,
  isDesktop,
  responsiveFontSize,
  responsiveSpacing,
} from '@/lib/responsive';

const createShadow = (opacity: number = 0.08, radius: number = 4, offsetY: number = 1) => Platform.select({
  web: { boxShadow: `0px ${offsetY}px ${radius}px rgba(0,0,0,${opacity})` },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.ceil(radius / 2),
  },
}) as any;
import { useAuth } from '@/lib/auth-context';
import { getTasks, getExpenses, getWaterLog, getToday, formatINR, Task, Expense } from '@/lib/storage';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const today = getToday();

  // Enhanced responsive calculations
  const contentWidth = getContentWidth();
  const horizontalPadding = getHorizontalPadding();
  const gridColumns = getGridColumns();
  const webTopPad = getWebTopPadding();
  const isLargeScreen = isDesktop;

  const loadData = useCallback(async () => {
    const [t, e, w] = await Promise.all([
      getTasks(),
      getExpenses(),
      getWaterLog(today),
    ]);
    setTasks(t);
    setExpenses(e);
    setWaterGlasses(w.glasses);
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const todayTasks = tasks.filter(t => t.dueDate === today);
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const pendingTasks = todayTasks.filter(t => !t.completed).length;

  const thisMonthExpenses = expenses.filter(e => {
    const expDate = e.date.substring(0, 7);
    const thisMonth = today.substring(0, 7);
    return expDate === thisMonth;
  });
  const totalIncome = thisMonthExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = thisMonthExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Dynamic responsive styles
  const dynamicStyles = StyleSheet.create({
    heroCard: {
      marginHorizontal: horizontalPadding,
      borderRadius: isLargeScreen ? 24 : 20,
      padding: isLargeScreen ? 28 : 20,
      marginBottom: responsiveSpacing(24),
    },
    modulesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: horizontalPadding / 2,
      gap: responsiveSpacing(12),
      marginBottom: responsiveSpacing(24),
    },
    moduleCard: {
      flex: 1,
      minWidth: isLargeScreen ? 180 : 150,
      maxWidth: isLargeScreen ? 220 : undefined,
      backgroundColor: Colors.surface,
      borderRadius: isLargeScreen ? 18 : 16,
      padding: isLargeScreen ? 20 : 16,
      borderWidth: 1,
      borderColor: Colors.cardBorder,
    },
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.background }]}
      contentContainerStyle={{ 
        paddingBottom: 120, 
        paddingTop: insets.top + webTopPad + responsiveSpacing(16),
        paddingHorizontal: horizontalPadding 
      }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={isLargeScreen ? { alignSelf: 'center', width: contentWidth } : { width: '100%' }}>
        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(500) : undefined}>
        <LinearGradient
          colors={['#D4637A', '#E8859A', '#F4A261']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dynamicStyles.heroCard}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/safety'); }}
              style={styles.sosBtn}
            >
              <Ionicons name="shield-checkmark" size={22} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{pendingTasks}</Text>
              <Text style={styles.heroStatLabel}>Pending</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{completedTasks}</Text>
              <Text style={styles.heroStatLabel}>Done</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{waterGlasses}/8</Text>
              <Text style={styles.heroStatLabel}>Water</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(500) : undefined}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          <QuickAction
            icon="add-circle"
            label="Add Task"
            color={Colors.categories.personal}
            onPress={() => router.push('/add-task')}
            isLargeScreen={isLargeScreen}
          />
          <QuickAction
            icon="cash"
            label="Add Expense"
            color={Colors.categories.finance}
            onPress={() => router.push('/add-expense')}
            isLargeScreen={isLargeScreen}
          />
          <QuickAction
            icon="restaurant"
            label="Plan Meal"
            color={Colors.categories.home}
            onPress={() => router.push('/add-meal')}
            isLargeScreen={isLargeScreen}
          />
          <QuickAction
            icon="water"
            label="Health"
            color={Colors.categories.health}
            onPress={() => router.push('/health')}
            isLargeScreen={isLargeScreen}
          />
          <QuickAction
            icon="timer"
            label="Focus"
            color={Colors.categories.office}
            onPress={() => router.push('/pomodoro')}
            isLargeScreen={isLargeScreen}
          />
        </ScrollView>
      </Animated.View>

      <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(300).duration(500) : undefined}>
        <Text style={styles.sectionTitle}>Budget Overview</Text>
        <View style={styles.budgetCard}>
          <View style={styles.budgetRow}>
            <View style={styles.budgetItem}>
              <View style={[styles.budgetDot, { backgroundColor: Colors.success }]} />
              <View>
                <Text style={styles.budgetLabel}>Income</Text>
                <Text style={styles.budgetAmount}>{formatINR(totalIncome)}</Text>
              </View>
            </View>
            <View style={styles.budgetItem}>
              <View style={[styles.budgetDot, { backgroundColor: Colors.danger }]} />
              <View>
                <Text style={styles.budgetLabel}>Expense</Text>
                <Text style={styles.budgetAmount}>{formatINR(totalExpense)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.budgetBar}>
            <View style={[styles.budgetBarFill, {
              width: totalIncome > 0 ? `${Math.min((totalExpense / totalIncome) * 100, 100)}%` : '0%',
              backgroundColor: totalExpense > totalIncome ? Colors.danger : Colors.success,
            }]} />
          </View>
          <Text style={styles.budgetBalance}>
            Balance: {formatINR(totalIncome - totalExpense)}
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(400).duration(500) : undefined}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        {todayTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkbox-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No tasks for today</Text>
            <Pressable
              onPress={() => router.push('/add-task')}
              style={styles.emptyBtn}
            >
              <Text style={styles.emptyBtnText}>Add a task</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {todayTasks.slice(0, 5).map(task => (
              <View key={task.id} style={styles.taskItem}>
                <View style={[styles.taskCat, { backgroundColor: Colors.categories[task.category] || Colors.primary }]} />
                <Text style={[styles.taskTitle, task.completed && styles.taskDone]} numberOfLines={1}>
                  {task.title}
                </Text>
                {task.completed && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                )}
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(500).duration(500) : undefined}>
        <Text style={styles.sectionTitle}>Modules</Text>
        <View style={dynamicStyles.modulesGrid}>
          {Array.from({ length: Math.ceil(4 / gridColumns) }).map((_, rowIndex) => (
            <View key={rowIndex} style={{ 
              flexDirection: 'row', 
              gap: responsiveSpacing(12),
              marginBottom: responsiveSpacing(12),
              width: '100%'
            }}>
              {[0, 1, 2, 3].slice(rowIndex * gridColumns, (rowIndex + 1) * gridColumns).map((colIndex) => {
                const modules = [
                  { icon: "home", label: "Home", color: "#F4A261", route: '/home-manage' },
                  { icon: "shield-checkmark", label: "Safety", color: "#E74C3C", route: '/safety' },
                  { icon: "heart", label: "Health", color: "#4CAF82", route: '/health' },
                  { icon: "timer", label: "Focus", color: "#5B9BD5", route: '/pomodoro' },
                ];
                const module = modules[rowIndex * gridColumns + colIndex];
                if (!module) return null;
                return (
                  <ModuleCard
                    key={module.label}
                    icon={module.icon}
                    label={module.label}
                    color={module.color}
                    onPress={() => router.push(module.route as any)}
                    isLargeScreen={isLargeScreen}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  </ScrollView>
  );
}

function QuickAction({ icon, label, color, onPress, isLargeScreen }: { 
  icon: string; 
  label: string; 
  color: string; 
  onPress: () => void;
  isLargeScreen: boolean;
}) {
  const actionSize = isLargeScreen ? 84 : 76;
  const iconSize = isLargeScreen ? 56 : 52;
  
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={({ pressed }) => [
        styles.quickAction, 
        { width: actionSize },
        pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }
      ]}
    >
      <View style={[
        styles.quickActionIcon, 
        { 
          backgroundColor: color + '18',
          width: iconSize,
          height: iconSize,
          borderRadius: isLargeScreen ? 18 : 16,
        }
      ]}>
        <Ionicons name={icon as any} size={isLargeScreen ? 24 : 22} color={color} />
      </View>
      <Text style={[
        styles.quickActionLabel,
        { fontSize: isLargeScreen ? 13 : 12 }
      ]}>{label}</Text>
    </Pressable>
  );
}

function ModuleCard({ icon, label, color, onPress, isLargeScreen }: { 
  icon: string; 
  label: string; 
  color: string; 
  onPress: () => void;
  isLargeScreen: boolean;
}) {
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={({ pressed }) => [
        styles.moduleCard,
        {
          minWidth: isLargeScreen ? 180 : 150,
          maxWidth: isLargeScreen ? 220 : undefined,
          borderRadius: isLargeScreen ? 18 : 16,
          padding: isLargeScreen ? 20 : 16,
        },
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }
      ]}
    >
      <View style={[styles.moduleIcon, { 
        backgroundColor: color + '18',
        width: isLargeScreen ? 48 : 44,
        height: isLargeScreen ? 48 : 44,
        borderRadius: isLargeScreen ? 16 : 14,
      }]}>
        <Ionicons name={icon as any} size={isLargeScreen ? 26 : 24} color={color} />
      </View>
      <Text style={[styles.moduleLabel, { 
        fontSize: isLargeScreen ? 15 : 14,
      }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
  },
  sosBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 14,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatNum: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
  },
  heroStatLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  quickActions: {
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
    width: 76,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  budgetCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  budgetLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
  },
  budgetAmount: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  budgetBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.inputBg,
    marginBottom: 8,
  },
  budgetBarFill: {
    height: 6,
    borderRadius: 3,
  },
  budgetBalance: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textMuted,
  },
  emptyBtn: {
    marginTop: 4,
  },
  emptyBtnText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.primary,
  },
  tasksList: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 24,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 10,
  },
  taskCat: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 24,
  },
  moduleCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
});
