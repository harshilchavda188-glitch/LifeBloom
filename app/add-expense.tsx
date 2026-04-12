import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { addExpense, getToday, isValidDate } from '@/lib/storage';

const EXPENSE_CATS = [
  { key: 'food', label: 'Food', icon: 'restaurant', color: '#F4A261' },
  { key: 'transport', label: 'Transport', icon: 'car', color: '#5B9BD5' },
  { key: 'shopping', label: 'Shopping', icon: 'bag', color: '#A78BFA' },
  { key: 'bills', label: 'Bills', icon: 'receipt', color: '#F59E0B' },
  { key: 'health', label: 'Health', icon: 'heart', color: '#4CAF82' },
  { key: 'education', label: 'Education', icon: 'school', color: '#6366F1' },
  { key: 'entertainment', label: 'Fun', icon: 'game-controller', color: '#EC4899' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

export default function AddExpenseSheet() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [status, setStatus] = useState<'completed' | 'pending'>('completed');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(getToday());
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    const num = parseFloat(amount);
    
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    if (isNaN(num) || num <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (!isValidDate(date)) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    setIsSubmitting(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await addExpense({
        title: title.trim(),
        amount: num,
        category,
        type,
        status,
        date,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sheetTitle}>Add Transaction</Text>

      <View style={styles.typeRow}>
        <Pressable
          onPress={() => setType('expense')}
          style={[styles.typeBtn, type === 'expense' && { backgroundColor: Colors.danger + '18', borderColor: Colors.danger }]}
        >
          <Ionicons name="arrow-down-circle" size={18} color={type === 'expense' ? Colors.danger : Colors.textMuted} />
          <Text style={[styles.typeText, type === 'expense' && { color: Colors.danger }]}>Expense</Text>
        </Pressable>
        <Pressable
          onPress={() => setType('income')}
          style={[styles.typeBtn, type === 'income' && { backgroundColor: Colors.success + '18', borderColor: Colors.success }]}
        >
          <Ionicons name="arrow-up-circle" size={18} color={type === 'income' ? Colors.success : Colors.textMuted} />
          <Text style={[styles.typeText, type === 'income' && { color: Colors.success }]}>Income</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.typeRow}>
        <Pressable
          onPress={() => setStatus('completed')}
          style={[styles.typeBtn, status === 'completed' && { backgroundColor: Colors.info + '18', borderColor: Colors.info }]}
        >
          <Ionicons name="checkmark-circle" size={18} color={status === 'completed' ? Colors.info : Colors.textMuted} />
          <Text style={[styles.typeText, status === 'completed' && { color: Colors.info }]}>Received/Paid</Text>
        </Pressable>
        <Pressable
          onPress={() => setStatus('pending')}
          style={[styles.typeBtn, status === 'pending' && { backgroundColor: Colors.warning + '18', borderColor: Colors.warning }]}
        >
          <Ionicons name="time" size={18} color={status === 'pending' ? Colors.warning : Colors.textMuted} />
          <Text style={[styles.typeText, status === 'pending' && { color: Colors.warning }]}>Pending</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor={Colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      <View style={styles.amountRow}>
        <Text style={styles.rupee}>{'\u20B9'}</Text>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Amount"
          placeholderTextColor={Colors.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>

      {type === 'expense' && (
        <>
          <Text style={styles.label}>Category</Text>
          <View style={styles.catGrid}>
            {EXPENSE_CATS.map(c => (
              <Pressable
                key={c.key}
                onPress={() => setCategory(c.key)}
                style={[
                  styles.catItem,
                  category === c.key && { backgroundColor: c.color + '18', borderColor: c.color },
                ]}
              >
                <Ionicons name={c.icon as any} size={18} color={category === c.key ? c.color : Colors.textMuted} />
                <Text style={[styles.catText, category === c.key && { color: c.color }]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={Colors.textMuted}
        value={date}
        onChangeText={setDate}
      />

      <Pressable
        onPress={handleSave}
        disabled={!title.trim() || !amount || isSubmitting}
        style={({ pressed }) => [
          styles.saveBtn,
          { backgroundColor: type === 'income' ? Colors.success : Colors.primary },
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          (!title.trim() || !amount || isSubmitting) && { opacity: 0.5 },
        ]}
      >
        <Text style={styles.saveBtnText}>
          {isSubmitting ? 'Saving...' : type === 'income' ? 'Add Income' : 'Add Expense'}
        </Text>
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
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textMuted,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Nunito_500Medium',
    color: Colors.text,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rupee: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  catText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  saveBtn: {
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

