import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as api from './api';

const USE_SERVER = true;

async function getUserId(): Promise<string | undefined> {
  try {
    const stored = await AsyncStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      return user.id;
    }
  } catch {}
  return undefined;
}

// ---- Tasks ----
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

export async function getTasks(): Promise<Task[]> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      return await api.getTasks(userId) as Task[];
    } catch {
      return getTasksLocal();
    }
  }
  return getTasksLocal();
}

async function getTasksLocal(): Promise<Task[]> {
  try {
    const data = await AsyncStorage.getItem('app_tasks');
    return safeJSONParse<Task[]>(data, []);
  } catch { return []; }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem('app_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
    throw new Error('Failed to save tasks');
  }
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      const created = await api.createTask({
        user_id: userId,
        title: task.title,
        category: task.category,
        completed: task.completed,
        due_date: task.dueDate,
        due_time: task.dueTime,
        recurring: task.recurring,
        priority: task.priority,
      });
      return created as Task;
    } catch {
      return addTaskLocal(task);
    }
  }
  return addTaskLocal(task);
}

async function addTaskLocal(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const tasks = await getTasksLocal();
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
  if (USE_SERVER) {
    try {
      await api.updateTask(id, updates as Record<string, unknown>);
      return;
    } catch {}
  }
  const tasks = await getTasksLocal();
  const index = tasks.findIndex(t => t.id === id);
  if (index >= 0) {
    tasks[index] = { ...tasks[index], ...updates };
    await saveTasks(tasks);
  }
}

export async function deleteTask(id: string): Promise<void> {
  if (USE_SERVER) {
    try {
      await api.deleteTask(id);
      return;
    } catch {}
  }
  const tasks = await getTasksLocal();
  await saveTasks(tasks.filter(t => t.id !== id));
}

// ---- Expenses ----
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

export async function getExpenses(): Promise<Expense[]> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      return await api.getExpenses(userId) as Expense[];
    } catch {}
  }
  return getExpensesLocal();
}

async function getExpensesLocal(): Promise<Expense[]> {
  try {
    const data = await AsyncStorage.getItem('app_expenses');
    return safeJSONParse<Expense[]>(data, []);
  } catch { return []; }
}

async function saveExpensesLocal(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem('app_expenses', JSON.stringify(expenses));
}

export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      const created = await api.createExpense({
        user_id: userId,
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        type: expense.type,
        status: expense.status,
        date: expense.date,
      });
      return created as Expense;
    } catch {}
  }
  return addExpenseLocal(expense);
}

async function addExpenseLocal(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  const expenses = await getExpensesLocal();
  const newExpense: Expense = {
    ...expense,
    id: Crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  await saveExpensesLocal(expenses);
  return newExpense;
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
  if (USE_SERVER) {
    try { await api.updateExpense(id, updates as Record<string, unknown>); return; } catch {}
  }
  const expenses = await getExpensesLocal();
  const index = expenses.findIndex(e => e.id === id);
  if (index >= 0) {
    expenses[index] = { ...expenses[index], ...updates };
    await saveExpensesLocal(expenses);
  }
}

export async function deleteExpense(id: string): Promise<void> {
  if (USE_SERVER) {
    try { await api.deleteExpense(id); return; } catch {}
  }
  const expenses = await getExpensesLocal();
  await saveExpensesLocal(expenses.filter(e => e.id !== id));
}

// ---- Meals ----
export interface Meal {
  id: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  ingredients: string[];
}

export async function getMeals(): Promise<Meal[]> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      return await api.getMeals(userId) as Meal[];
    } catch {}
  }
  return getMealsLocal();
}

async function getMealsLocal(): Promise<Meal[]> {
  try {
    const data = await AsyncStorage.getItem('app_meals');
    return safeJSONParse<Meal[]>(data, []);
  } catch { return []; }
}

async function saveMealsLocal(meals: Meal[]): Promise<void> {
  await AsyncStorage.setItem('app_meals', JSON.stringify(meals));
}

export async function addMeal(meal: Omit<Meal, 'id'>): Promise<Meal> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      const created = await api.createMeal({
        user_id: userId,
        day: meal.day,
        meal_type: meal.mealType,
        name: meal.name,
        ingredients: meal.ingredients,
      });
      return created as Meal;
    } catch {}
  }
  return addMealLocal(meal);
}

async function addMealLocal(meal: Omit<Meal, 'id'>): Promise<Meal> {
  const meals = await getMealsLocal();
  const newMeal: Meal = { ...meal, id: Crypto.randomUUID() };
  meals.push(newMeal);
  await saveMealsLocal(meals);
  return newMeal;
}

export async function deleteMeal(id: string): Promise<void> {
  if (USE_SERVER) {
    try { await api.deleteMeal(id); return; } catch {}
  }
  const meals = await getMealsLocal();
  await saveMealsLocal(meals.filter(m => m.id !== id));
}

// ---- Grocery ----
export interface GroceryItem {
  id: string;
  name: string;
  checked: boolean;
  category: string;
}

export async function getGroceryList(): Promise<GroceryItem[]> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      return await api.getGroceryItems(userId) as GroceryItem[];
    } catch {}
  }
  return getGroceryListLocal();
}

async function getGroceryListLocal(): Promise<GroceryItem[]> {
  try {
    const data = await AsyncStorage.getItem('app_grocery');
    return safeJSONParse<GroceryItem[]>(data, []);
  } catch { return []; }
}

async function saveGroceryListLocal(items: GroceryItem[]): Promise<void> {
  await AsyncStorage.setItem('app_grocery', JSON.stringify(items));
}

export async function saveGroceryList(items: GroceryItem[]): Promise<void> {
  await saveGroceryListLocal(items);
}

export async function addGroceryItem(item: Omit<GroceryItem, 'id'>): Promise<GroceryItem> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      const created = await api.createGroceryItem({
        user_id: userId,
        name: item.name,
        checked: item.checked,
        category: item.category,
      });
      return created as GroceryItem;
    } catch {}
  }
  const items = await getGroceryListLocal();
  const newItem: GroceryItem = { ...item, id: Crypto.randomUUID() };
  items.push(newItem);
  await saveGroceryListLocal(items);
  return newItem;
}

export async function updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<void> {
  if (USE_SERVER) {
    try { await api.updateGroceryItem(id, updates as Record<string, unknown>); return; } catch {}
  }
  const items = await getGroceryListLocal();
  const index = items.findIndex(i => i.id === id);
  if (index >= 0) {
    items[index] = { ...items[index], ...updates };
    await saveGroceryListLocal(items);
  }
}

export async function deleteGroceryItem(id: string): Promise<void> {
  if (USE_SERVER) {
    try { await api.deleteGroceryItem(id); return; } catch {}
  }
  const items = await getGroceryListLocal();
  await saveGroceryListLocal(items.filter(i => i.id !== id));
}

// ---- Cleaning Tasks ----
export interface CleaningTask {
  id: string;
  title: string;
  room: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastDone: string | null;
  nextDue: string;
}

export async function getCleaningTasks(): Promise<CleaningTask[]> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      return await api.getCleaningTasks(userId) as CleaningTask[];
    } catch {}
  }
  return getCleaningTasksLocal();
}

async function getCleaningTasksLocal(): Promise<CleaningTask[]> {
  try {
    const data = await AsyncStorage.getItem('app_cleaning');
    return safeJSONParse<CleaningTask[]>(data, []);
  } catch { return []; }
}

async function saveCleaningTasksLocal(tasks: CleaningTask[]): Promise<void> {
  await AsyncStorage.setItem('app_cleaning', JSON.stringify(tasks));
}

export async function saveCleaningTasks(tasks: CleaningTask[]): Promise<void> {
  await saveCleaningTasksLocal(tasks);
}

// ---- Emergency Contacts ----
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      return await api.getEmergencyContacts(userId) as EmergencyContact[];
    } catch {}
  }
  return getEmergencyContactsLocal();
}

async function getEmergencyContactsLocal(): Promise<EmergencyContact[]> {
  try {
    const data = await AsyncStorage.getItem('app_emergency');
    return safeJSONParse<EmergencyContact[]>(data, []);
  } catch { return []; }
}

async function saveEmergencyContactsLocal(contacts: EmergencyContact[]): Promise<void> {
  await AsyncStorage.setItem('app_emergency', JSON.stringify(contacts));
}

export async function saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
  await saveEmergencyContactsLocal(contacts);
}

// ---- Water ----
export interface WaterLog {
  date: string;
  glasses: number;
}

export async function getWaterLog(date: string): Promise<WaterLog> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      if (userId) {
        const result = await api.getWaterLog(userId, date);
        if (Array.isArray(result)) {
          const found = result.find((l: api.ApiWaterLog) => l.logDate === date);
          if (found) return { date: found.logDate, glasses: found.glasses };
        } else if (result && typeof result === 'object' && 'logDate' in result) {
          return { date: (result as api.ApiWaterLog).logDate, glasses: (result as api.ApiWaterLog).glasses };
        }
      }
    } catch {}
  }
  return getWaterLogLocal(date);
}

async function getWaterLogLocal(date: string): Promise<WaterLog> {
  try {
    const data = await AsyncStorage.getItem(`app_water_${date}`);
    return safeJSONParse<WaterLog>(data, { date, glasses: 0 });
  } catch { return { date, glasses: 0 }; }
}

export async function saveWaterLog(log: WaterLog): Promise<void> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      if (userId) {
        await api.saveWaterLog(userId, log.date, log.glasses);
        return;
      }
    } catch {}
  }
  try {
    await AsyncStorage.setItem(`app_water_${log.date}`, JSON.stringify(log));
  } catch (e) {
    console.error('Error saving water log:', e);
    throw new Error('Failed to save water log');
  }
}

// ---- Mood ----
export interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  note: string;
}

export async function getMoodEntries(): Promise<MoodEntry[]> {
  if (USE_SERVER) {
    try {
      const userId = await getUserId();
      return await api.getMoodEntries(userId) as MoodEntry[];
    } catch {}
  }
  return getMoodEntriesLocal();
}

async function getMoodEntriesLocal(): Promise<MoodEntry[]> {
  try {
    const data = await AsyncStorage.getItem('app_mood');
    return safeJSONParse<MoodEntry[]>(data, []);
  } catch { return []; }
}

async function saveMoodEntriesLocal(entries: MoodEntry[]): Promise<void> {
  await AsyncStorage.setItem('app_mood', JSON.stringify(entries));
}

export async function saveMoodEntries(entries: MoodEntry[]): Promise<void> {
  await saveMoodEntriesLocal(entries);
}

// ---- Helpers ----
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

export function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

function safeJSONParse<T>(data: string | null, defaultValue: T): T {
  if (!data) return defaultValue;
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) return defaultValue;
    return parsed as T;
  } catch {
    return defaultValue;
  }
}
