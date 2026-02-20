import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface Task {
  id: string;
  title: string;
  category: 'office' | 'home' | 'kids' | 'personal' | 'health';
  completed: boolean;
  dueDate: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
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

export async function getTasks(): Promise<Task[]> {
  const data = await AsyncStorage.getItem(getUserKey('tasks'));
  return data ? JSON.parse(data) : [];
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(getUserKey('tasks'), JSON.stringify(tasks));
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
  const data = await AsyncStorage.getItem(getUserKey('expenses'));
  return data ? JSON.parse(data) : [];
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(getUserKey('expenses'), JSON.stringify(expenses));
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

export async function deleteExpense(id: string): Promise<void> {
  const expenses = await getExpenses();
  await saveExpenses(expenses.filter(e => e.id !== id));
}

export async function getMeals(): Promise<Meal[]> {
  const data = await AsyncStorage.getItem(getUserKey('meals'));
  return data ? JSON.parse(data) : [];
}

export async function saveMeals(meals: Meal[]): Promise<void> {
  await AsyncStorage.setItem(getUserKey('meals'), JSON.stringify(meals));
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
  const data = await AsyncStorage.getItem(getUserKey('grocery'));
  return data ? JSON.parse(data) : [];
}

export async function saveGroceryList(items: GroceryItem[]): Promise<void> {
  await AsyncStorage.setItem(getUserKey('grocery'), JSON.stringify(items));
}

export async function getCleaningTasks(): Promise<CleaningTask[]> {
  const data = await AsyncStorage.getItem(getUserKey('cleaning'));
  return data ? JSON.parse(data) : [];
}

export async function saveCleaningTasks(tasks: CleaningTask[]): Promise<void> {
  await AsyncStorage.setItem(getUserKey('cleaning'), JSON.stringify(tasks));
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const data = await AsyncStorage.getItem(getUserKey('emergency'));
  return data ? JSON.parse(data) : [];
}

export async function saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
  await AsyncStorage.setItem(getUserKey('emergency'), JSON.stringify(contacts));
}

export async function getWaterLog(date: string): Promise<WaterLog> {
  const data = await AsyncStorage.getItem(getUserKey(`water_${date}`));
  return data ? JSON.parse(data) : { date, glasses: 0 };
}

export async function saveWaterLog(log: WaterLog): Promise<void> {
  await AsyncStorage.setItem(getUserKey(`water_${log.date}`), JSON.stringify(log));
}

export async function getMoodEntries(): Promise<MoodEntry[]> {
  const data = await AsyncStorage.getItem(getUserKey('mood'));
  return data ? JSON.parse(data) : [];
}

export async function saveMoodEntries(entries: MoodEntry[]): Promise<void> {
  await AsyncStorage.setItem(getUserKey('mood'), JSON.stringify(entries));
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDayName(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(dateStr).getDay()];
}

export function formatINR(amount: number): string {
  return '\u20B9' + amount.toLocaleString('en-IN');
}

export function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dayOfWeek);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}
