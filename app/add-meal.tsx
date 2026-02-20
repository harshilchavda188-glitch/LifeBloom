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
import { addMeal, getToday, getWeekDates, getDayName } from '@/lib/storage';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: 'sunny' },
  { key: 'lunch', label: 'Lunch', icon: 'restaurant' },
  { key: 'dinner', label: 'Dinner', icon: 'moon' },
  { key: 'snack', label: 'Snack', icon: 'cafe' },
] as const;

export default function AddMealSheet() {
  const weekDates = getWeekDates();
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]['key']>('lunch');
  const [day, setDay] = useState(getToday());
  const [ingredientsText, setIngredientsText] = useState('');

  async function handleSave() {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const ingredients = ingredientsText
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);
    await addMeal({ name: name.trim(), mealType, day, ingredients });
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sheetTitle}>Plan a Meal</Text>

      <TextInput
        style={styles.input}
        placeholder="Meal name (e.g., Paneer Tikka)"
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text style={styles.label}>Meal Type</Text>
      <View style={styles.chipRow}>
        {MEAL_TYPES.map(m => (
          <Pressable
            key={m.key}
            onPress={() => setMealType(m.key)}
            style={[
              styles.chip,
              mealType === m.key && { backgroundColor: Colors.accent + '20', borderColor: Colors.accent },
            ]}
          >
            <Ionicons name={m.icon as any} size={14} color={mealType === m.key ? Colors.accent : Colors.textMuted} />
            <Text style={[styles.chipText, mealType === m.key && { color: Colors.accent }]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Day</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.dayRow}>
          {weekDates.map(d => (
            <Pressable
              key={d}
              onPress={() => setDay(d)}
              style={[
                styles.dayChip,
                day === d && { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
              ]}
            >
              <Text style={[styles.dayText, day === d && { color: Colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                {getDayName(d)}
              </Text>
              <Text style={[styles.dayNum, day === d && { color: Colors.primary }]}>
                {new Date(d).getDate()}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.label}>Ingredients (comma separated)</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Rice, Dal, Ghee, Veggies..."
        placeholderTextColor={Colors.textMuted}
        value={ingredientsText}
        onChangeText={setIngredientsText}
        multiline
      />

      <Pressable
        onPress={handleSave}
        disabled={!name.trim()}
        style={({ pressed }) => [
          styles.saveBtn,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          !name.trim() && { opacity: 0.5 },
        ]}
      >
        <Text style={styles.saveBtnText}>Add Meal</Text>
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
  chipText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayChip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  dayNum: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
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
