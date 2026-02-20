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
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

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
import { getExpenses, deleteExpense, Expense, getToday, formatINR } from '@/lib/storage';

const EXPENSE_CATEGORIES = [
  { key: 'food', label: 'Food', icon: 'restaurant', color: '#F4A261' },
  { key: 'transport', label: 'Transport', icon: 'car', color: '#5B9BD5' },
  { key: 'shopping', label: 'Shopping', icon: 'bag', color: '#A78BFA' },
  { key: 'bills', label: 'Bills', icon: 'receipt', color: '#F59E0B' },
  { key: 'health', label: 'Health', icon: 'heart', color: '#4CAF82' },
  { key: 'education', label: 'Education', icon: 'school', color: '#6366F1' },
  { key: 'entertainment', label: 'Fun', icon: 'game-controller', color: '#EC4899' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'income' | 'expense'>('all');
  const today = getToday();

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  async function loadExpenses() {
    const e = await getExpenses();
    setExpenses(e);
  }

  async function removeExpense(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteExpense(id);
    loadExpenses();
  }

  const thisMonth = today.substring(0, 7);
  const monthExpenses = expenses.filter(e => e.date.substring(0, 7) === thisMonth);
  const totalIncome = monthExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = monthExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryTotals = EXPENSE_CATEGORIES.map(cat => {
    const total = monthExpenses
      .filter(e => e.type === 'expense' && e.category === cat.key)
      .reduce((s, e) => s + e.amount, 0);
    return { ...cat, total };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const filtered = expenses
    .filter(e => {
      if (viewMode === 'income') return e.type === 'income';
      if (viewMode === 'expense') return e.type === 'expense';
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget</Text>
        <Pressable
          onPress={() => router.push('/add-expense')}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={balance >= 0 ? ['#4CAF82', '#2E8B6A'] : ['#E74C3C', '#C0392B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}
            >
              <Text style={styles.balanceLabel}>Monthly Balance</Text>
              <Text style={styles.balanceAmount}>{formatINR(balance)}</Text>
              <View style={styles.balanceRow}>
                <View style={styles.balanceItem}>
                  <Ionicons name="arrow-up-circle" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.balanceItemText}>Income: {formatINR(totalIncome)}</Text>
                </View>
                <View style={styles.balanceItem}>
                  <Ionicons name="arrow-down-circle" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.balanceItemText}>Expense: {formatINR(totalExpense)}</Text>
                </View>
              </View>
            </LinearGradient>

            {categoryTotals.length > 0 && (
              <View style={styles.catSection}>
                <Text style={styles.sectionLabel}>Spending by Category</Text>
                <View style={styles.catGrid}>
                  {categoryTotals.slice(0, 4).map(cat => (
                    <View key={cat.key} style={styles.catCard}>
                      <View style={[styles.catIcon, { backgroundColor: cat.color + '18' }]}>
                        <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                      </View>
                      <Text style={styles.catLabel}>{cat.label}</Text>
                      <Text style={styles.catAmount}>{formatINR(cat.total)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.filterRow}>
              {(['all', 'income', 'expense'] as const).map(m => (
                <Pressable
                  key={m}
                  onPress={() => setViewMode(m)}
                  style={[styles.filterBtn, viewMode === m && styles.filterBtnActive]}
                >
                  <Text style={[styles.filterText, viewMode === m && styles.filterTextActive]}>
                    {m === 'all' ? 'All' : m === 'income' ? 'Income' : 'Expenses'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel2}>Transactions</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Start tracking your finances</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const catInfo = EXPENSE_CATEGORIES.find(c => c.key === item.category);
          return (
            <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(index * 30).duration(200) : undefined}>
              <Pressable
                onLongPress={() => removeExpense(item.id)}
                style={({ pressed }) => [styles.txCard, pressed && { opacity: 0.9 }]}
              >
                <View style={[styles.txIcon, { backgroundColor: (catInfo?.color || Colors.primary) + '18' }]}>
                  <Ionicons
                    name={(item.type === 'income' ? 'arrow-up-circle' : (catInfo?.icon || 'cash')) as any}
                    size={22}
                    color={item.type === 'income' ? Colors.success : (catInfo?.color || Colors.primary)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.txDate}>
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {catInfo ? ` \u00B7 ${catInfo.label}` : ''}
                  </Text>
                </View>
                <Text style={[styles.txAmount, { color: item.type === 'income' ? Colors.success : Colors.danger }]}>
                  {item.type === 'income' ? '+' : '-'}{formatINR(item.amount)}
                </Text>
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
  balanceCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
    marginVertical: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceItemText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.85)',
  },
  catSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  sectionLabel2: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  catGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  catCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
  },
  catAmount: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterBtnActive: {
    backgroundColor: Colors.surface,
    ...createShadow(0.06, 3, 1),
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textMuted,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  txCard: {
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
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  txDate: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
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
