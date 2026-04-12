import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface Task {
  id: string;
  title: string;
  category: 'office' | 'home' | 'kids' | 'personal' | 'health';
  completed: boolean;
  dueDate: string;
  dueTime?: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  status: 'completed' | 'pending';
  date: string;
  createdAt: string;
}

export interface Meal {
  id: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  ingredients: string[];
}

export interface GroceryItem {
  id: string;
  name: string;
  checked: boolean;
  category: string;
}

export interface CleaningTask {
  id: string;
  title: string;
  room: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastDone: string | null;
  nextDue: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface WaterLog {
  date: string;
  glasses: number;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  note: string;
}

function getUserKey(key: string): string {
  return `app_${key}`;
}

// Helper function to safely parse JSON
function safeJSONParse<T>(data: string | null, defaultValue: T): T {
  if (!data) return defaultValue;
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      return defaultValue;
    }
    return parsed as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
}

export async function getTasks(): Promise<Task[]> {
  try {
    const data = await AsyncStorage.getItem(getUserKey('tasks'));
    return safeJSONParse<Task[]>(data, []);
  } catch (e) {
    console.error('Error getting tasks:', e);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserKey('tasks'), JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
    throw new Error('Failed to save tasks');
  }
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const tasks = await getTasks();
  const newTask: Task = {
    ...task,
    id: Crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  await saveTasks(tasks);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const tasks = await getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index >= 0) {
    tasks[index] = { ...tasks[index], ...updates };
    await saveTasks(tasks);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await getTasks();
  await saveTasks(tasks.filter(t => t.id !== id));
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const data = await AsyncStorage.getItem(getUserKey('expenses'));
    return safeJSONParse<Expense[]>(data, []);
  } catch (e) {
    console.error('Error getting expenses:', e);
    return [];
  }
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserKey('expenses'), JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses:', e);
    throw new Error('Failed to save expenses');
  }
}

export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  const expenses = await getExpenses();
  const newExpense: Expense = {
    ...expense,
    id: Crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  await saveExpenses(expenses);
  return newExpense;
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
  const expenses = await getExpenses();
  const index = expenses.findIndex(e => e.id === id);
  if (index >= 0) {
    expenses[index] = { ...expenses[index], ...updates };
    await saveExpenses(expenses);
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const expenses = await getExpenses();
  await saveExpenses(expenses.filter(e => e.id !== id));
}

export async function getMeals(): Promise<Meal[]> {
  try {
    const data = await AsyncStorage.getItem(getUserKey('meals'));
    return safeJSONParse<Meal[]>(data, []);
  } catch (e) {
    console.error('Error getting meals:', e);
    return [];
  }
}

export async function saveMeals(meals: Meal[]): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserKey('meals'), JSON.stringify(meals));
  } catch (e) {
    console.error('Error saving meals:', e);
    throw new Error('Failed to save meals');
  }
}

export async function addMeal(meal: Omit<Meal, 'id'>): Promise<Meal> {
  const meals = await getMeals();
  const newMeal: Meal = { ...meal, id: Crypto.randomUUID() };
  meals.push(newMeal);
  await saveMeals(meals);
  return newMeal;
}

export async function deleteMeal(id: string): Promise<void> {
  const meals = await getMeals();
  await saveMeals(meals.filter(m => m.id !== id));
}

export async function getGroceryList(): Promise<GroceryItem[]> {
  try {
    const data = await AsyncStorage.getItem(getUserKey('grocery'));
    return safeJSONParse<GroceryItem[]>(data, []);
  } catch (e) {
    console.error('Error getting grocery list:', e);
    return [];
  }
}

export async function saveGroceryList(items: GroceryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserKey('grocery'), JSON.stringify(items));
  } catch (e) {
    console.error('Error saving grocery list:', e);
    throw new Error('Failed to save grocery list');
  }
}

export async function getCleaningTasks(): Promise<CleaningTask[]> {
  try {
    const data = await AsyncStorage.getItem(getUserKey('cleaning'));
    return safeJSONParse<CleaningTask[]>(data, []);
  } catch (e) {
    console.error('Error getting cleaning tasks:', e);
    return [];
  }
}

export async function saveCleaningTasks(tasks: CleaningTask[]): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserKey('cleaning'), JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving cleaning tasks:', e);
    throw new Error('Failed to save cleaning tasks');
  }
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  try {
    const data = await AsyncStorage.getItem(getUserKey('emergency'));
    return safeJSONParse<EmergencyContact[]>(data, []);
  } catch (e) {
    console.error('Error getting emergency contacts:', e);
    return [];
  }
}

export async function saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserKey('emergency'), JSON.stringify(contacts));
  } catch (e) {
    console.error('Error saving emergency contacts:', e);
    throw new Error('Failed to save emergency contacts');
  }
}

export async function getWaterLog(date: string): Promise<WaterLog> {
  try {
    const data = await AsyncStorage.getItem(getUserKey(`water_${date}`));
    return safeJSONParse<WaterLog>(data, { date, glasses: 0 });
  } catch (e) {
    console.error('Error getting water log:', e);
    return { date, glasses: 0 };
  }
}

export async function saveWaterLog(log: WaterLog): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserKey(`water_${log.date}`), JSON.stringify(log));
  } catch (e) {
    console.error('Error saving water log:', e);
    throw new Error('Failed to save water log');
  }
}

export async function getMoodEntries(): Promise<MoodEntry[]> {
  try {
    const data = await AsyncStorage.getItem(getUserKey('mood'));
    return safeJSONParse<MoodEntry[]>(data, []);
  } catch (e) {
    console.error('Error getting mood entries:', e);
    return [];
  }
}

export async function saveMoodEntries(entries: MoodEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserKey('mood'), JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving mood entries:', e);
    throw new Error('Failed to save mood entries');
  }
}

export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayName(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid';
  return days[date.getDay()];
}

export function formatINR(amount: number): string {
  if (isNaN(amount)) amount = 0;
  return '\u20B9' + amount.toLocaleString('en-IN');
}

export function getWeekDates(): string[] {
  const today = new Date();
  // Get the start of the week (Sunday)
  const dayOfWeek = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dayOfWeek);
  
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

// Validate date string in YYYY-MM-DD format
export function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}
