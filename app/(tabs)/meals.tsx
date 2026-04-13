import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  ScrollView,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { 
  getContentWidth, 
  getHorizontalPadding, 
  getWebTopPadding,
  isDesktop,
} from '@/lib/responsive';
import { getMeals, deleteMeal, getGroceryList, saveGroceryList, Meal, GroceryItem, getWeekDates, getDayName, saveMeals } from '@/lib/storage';
import * as Crypto from 'expo-crypto';

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

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_ICONS: Record<string, string> = {
  breakfast: 'sunny',
  lunch: 'restaurant',
  dinner: 'moon',
  snack: 'cafe',
};

export default function MealsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'planner' | 'grocery'>('planner');
  const weekDates = getWeekDates();

  // Enhanced responsive calculations
  const contentWidth = getContentWidth();
  const horizontalPadding = getHorizontalPadding();
  const webTopPad = getWebTopPadding();
  const isLargeScreen = isDesktop;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

async function loadData() {
    const [m, g] = await Promise.all([getMeals(), getGroceryList()]);
    setMeals(m);
    setGroceryList(g);
  }

  const loadMeals = async () => {
    const m = await getMeals();
    setMeals(m);
  };

  async function removeMeal(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteMeal(id);
    loadMeals();
  }

  async function clearPastMeals() {
    const today = new Date().toISOString().split('T')[0];
    const pastMeals = meals.filter(m => m.day < today);
    if (pastMeals.length === 0) return;

    Alert.alert(
      'Clear Past Meals',
      `Remove all ${pastMeals.length} meals from previous days?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const currentAndFuture = meals.filter(m => m.day >= today);
            await saveMeals(currentAndFuture);
            setMeals(currentAndFuture);
          }
        }
      ]
    );
  }

  async function generateGrocery() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const allIngredients = meals.flatMap(m => m.ingredients);
    const unique = [...new Set(allIngredients.map(i => i.toLowerCase().trim()))];
    const items: GroceryItem[] = unique.map(name => ({
      id: Crypto.randomUUID(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      checked: false,
      category: 'general',
    }));
    await saveGroceryList(items);
    setGroceryList(items);
    setActiveTab('grocery');
  }

  async function toggleGroceryItem(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = groceryList.map(g =>
      g.id === id ? { ...g, checked: !g.checked } : g
    );
    setGroceryList(updated);
    await saveGroceryList(updated);
  }

  async function clearCheckedGrocery() {
    const checked = groceryList.filter(g => g.checked);
    if (checked.length === 0) return;

    Alert.alert(
      'Clear Checked Items',
      `Are you sure you want to remove all ${checked.length} checked items from your grocery list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const remaining = groceryList.filter(g => !g.checked);
            await saveGroceryList(remaining);
            setGroceryList(remaining);
          }
        }
      ]
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad, paddingHorizontal: horizontalPadding }]}>
      <View style={isLargeScreen ? { alignSelf: 'center', width: contentWidth } : { width: '100%' }}>
        <View style={styles.header}>
          <Text style={styles.title}>Meals</Text>
          <View style={styles.headerActions}>
            {activeTab === 'planner' && meals.some(m => m.day < new Date().toISOString().split('T')[0]) && (
              <Pressable
                onPress={clearPastMeals}
                style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="calendar-clear-outline" size={24} color={Colors.primary} />
              </Pressable>
            )}
            {meals.length > 0 && (
              <Pressable
                onPress={generateGrocery}
                style={({ pressed }) => [styles.groceryBtn, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="cart" size={18} color={Colors.primary} />
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push('/add-meal')}
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setActiveTab('planner')}
            style={[styles.tab, activeTab === 'planner' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'planner' && styles.tabTextActive]}>Meal Plan</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('grocery')}
            style={[styles.tab, activeTab === 'grocery' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'grocery' && styles.tabTextActive]}>Grocery List</Text>
            {groceryList.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{groceryList.filter(g => !g.checked).length}</Text>
              </View>
            )}
          </Pressable>
          {activeTab === 'grocery' && groceryList.some(g => g.checked) && (
            <Pressable
              onPress={clearCheckedGrocery}
              style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.primary} />
            </Pressable>
          )}
        </View>

        {activeTab === 'planner' ? (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {meals.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="restaurant-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No meals planned</Text>
                <Text style={styles.emptySubtitle}>Plan your weekly meals</Text>
              </View>
            ) : (
              weekDates.map(date => {
                const dayMeals = meals.filter(m => m.day === date);
                if (dayMeals.length === 0) return null;
                return (
                  <View key={date} style={styles.daySection}>
                    <Text style={styles.dayTitle}>
                      {getDayName(date)} {new Date(date).getDate()}
                    </Text>
                    {dayMeals.map(meal => (
                      <Pressable
                        key={meal.id}
                        onLongPress={() => removeMeal(meal.id)}
                        style={({ pressed }) => [styles.mealCard, pressed && { opacity: 0.9 }]}
                      >
                        <View style={[styles.mealIcon, { backgroundColor: Colors.accent + '18' }]}>
                          <Ionicons name={MEAL_ICONS[meal.mealType] as any || 'restaurant'} size={18} color={Colors.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.mealType}>{meal.mealType}</Text>
                          <Text style={styles.mealName}>{meal.name}</Text>
                        </View>
                        {meal.ingredients.length > 0 && (
                          <Text style={styles.ingredientCount}>{meal.ingredients.length} items</Text>
                        )}
                      </Pressable>
                    ))}
                  </View>
                );
              })
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={groceryList}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            scrollEnabled={!!groceryList.length}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="cart-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>Grocery list empty</Text>
                <Text style={styles.emptySubtitle}>
                  {meals.length > 0
                    ? 'Generate from your meal plan'
                    : 'Add meals first to generate a list'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => toggleGroceryItem(item.id)}
                style={({ pressed }) => [styles.groceryItem, pressed && { opacity: 0.9 }]}
              >
                <Ionicons
                  name={item.checked ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={item.checked ? Colors.success : Colors.textMuted}
                />
                <Text style={[styles.groceryText, item.checked && styles.groceryChecked]}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        )}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  groceryBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.surface,
    ...createShadow(0.06, 3, 1),
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  clearBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  daySection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 8,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  mealIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealType: {
    fontSize: 11,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  mealName: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  ingredientCount: {
    fontSize: 11,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textMuted,
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  groceryText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
    flex: 1,
  },
  groceryChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
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
    textAlign: 'center',
  },
});
