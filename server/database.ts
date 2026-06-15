import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.resolve(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection<T>(collection: string): T[] {
  try {
    const fp = filePath(collection);
    if (!fs.existsSync(fp)) return [];
    const raw = fs.readFileSync(fp, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCollection<T>(collection: string, data: T[]): void {
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2), "utf-8");
}

function generateId(): string {
  return randomUUID();
}

function nowISO(): string {
  return new Date().toISOString();
}

function todayDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---- Users ----
export interface User {
  id: string;
  username: string;
  password: string;
  name?: string;
  email?: string;
  createdAt: string;
}

export function getUsers(): User[] {
  return readCollection<User>("users");
}

export function getUser(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return getUsers().find((u) => u.username === username);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

export function createUser(data: { username: string; password: string; name?: string; email?: string }): User {
  const users = getUsers();
  if (users.find((u) => u.username === data.username)) {
    throw new Error("Username already exists");
  }
  const user: User = {
    id: generateId(),
    username: data.username,
    password: data.password,
    name: data.name,
    email: data.email,
    createdAt: nowISO(),
  };
  users.push(user);
  writeCollection("users", users);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...updates };
  writeCollection("users", users);
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  writeCollection("users", filtered);
  return true;
}

// ---- Tasks ----
export interface Task {
  id: string;
  userId?: string;
  title: string;
  category: string;
  completed: boolean;
  dueDate?: string;
  dueTime?: string;
  recurring: string;
  priority: string;
  createdAt: string;
  completedAt?: string;
}

export function getTasks(userId?: string): Task[] {
  const tasks = readCollection<Task>("tasks");
  if (userId) return tasks.filter((t) => t.userId === userId);
  return tasks;
}

export function getTask(id: string): Task | undefined {
  return readCollection<Task>("tasks").find((t) => t.id === id);
}

export function createTask(data: Omit<Task, "id" | "createdAt">): Task {
  const tasks = readCollection<Task>("tasks");
  const task: Task = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
  };
  tasks.push(task);
  writeCollection("tasks", tasks);
  return task;
}

export function updateTask(id: string, updates: Partial<Task>): Task | undefined {
  const tasks = readCollection<Task>("tasks");
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  tasks[idx] = { ...tasks[idx], ...updates };
  writeCollection("tasks", tasks);
  return tasks[idx];
}

export function deleteTask(id: string): boolean {
  const tasks = readCollection<Task>("tasks");
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  writeCollection("tasks", filtered);
  return true;
}

// ---- Expenses ----
export interface Expense {
  id: string;
  userId?: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  status: "completed" | "pending";
  date: string;
  createdAt: string;
}

export function getExpenses(userId?: string): Expense[] {
  const expenses = readCollection<Expense>("expenses");
  if (userId) return expenses.filter((e) => e.userId === userId);
  return expenses;
}

export function getExpense(id: string): Expense | undefined {
  return readCollection<Expense>("expenses").find((e) => e.id === id);
}

export function createExpense(data: Omit<Expense, "id" | "createdAt">): Expense {
  const expenses = readCollection<Expense>("expenses");
  const expense: Expense = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
  };
  expenses.push(expense);
  writeCollection("expenses", expenses);
  return expense;
}

export function updateExpense(id: string, updates: Partial<Expense>): Expense | undefined {
  const expenses = readCollection<Expense>("expenses");
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  expenses[idx] = { ...expenses[idx], ...updates };
  writeCollection("expenses", expenses);
  return expenses[idx];
}

export function deleteExpense(id: string): boolean {
  const expenses = readCollection<Expense>("expenses");
  const filtered = expenses.filter((e) => e.id !== id);
  if (filtered.length === expenses.length) return false;
  writeCollection("expenses", filtered);
  return true;
}

// ---- Meals ----
export interface Meal {
  id: string;
  userId?: string;
  day: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  ingredients: string[];
  createdAt: string;
}

export function getMeals(userId?: string): Meal[] {
  const meals = readCollection<Meal>("meals");
  if (userId) return meals.filter((m) => m.userId === userId);
  return meals;
}

export function getMeal(id: string): Meal | undefined {
  return readCollection<Meal>("meals").find((m) => m.id === id);
}

export function createMeal(data: Omit<Meal, "id" | "createdAt">): Meal {
  const meals = readCollection<Meal>("meals");
  const meal: Meal = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
  };
  meals.push(meal);
  writeCollection("meals", meals);
  return meal;
}

export function updateMeal(id: string, updates: Partial<Meal>): Meal | undefined {
  const meals = readCollection<Meal>("meals");
  const idx = meals.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  meals[idx] = { ...meals[idx], ...updates };
  writeCollection("meals", meals);
  return meals[idx];
}

export function deleteMeal(id: string): boolean {
  const meals = readCollection<Meal>("meals");
  const filtered = meals.filter((m) => m.id !== id);
  if (filtered.length === meals.length) return false;
  writeCollection("meals", filtered);
  return true;
}

// ---- Grocery Items ----
export interface GroceryItem {
  id: string;
  userId?: string;
  name: string;
  checked: boolean;
  category: string;
  createdAt: string;
}

export function getGroceryItems(userId?: string): GroceryItem[] {
  const items = readCollection<GroceryItem>("grocery");
  if (userId) return items.filter((i) => i.userId === userId);
  return items;
}

export function createGroceryItem(data: Omit<GroceryItem, "id" | "createdAt">): GroceryItem {
  const items = readCollection<GroceryItem>("grocery");
  const item: GroceryItem = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
  };
  items.push(item);
  writeCollection("grocery", items);
  return item;
}

export function updateGroceryItem(id: string, updates: Partial<GroceryItem>): GroceryItem | undefined {
  const items = readCollection<GroceryItem>("grocery");
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  writeCollection("grocery", items);
  return items[idx];
}

export function deleteGroceryItem(id: string): boolean {
  const items = readCollection<GroceryItem>("grocery");
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  writeCollection("grocery", filtered);
  return true;
}

// ---- Cleaning Tasks ----
export interface CleaningTask {
  id: string;
  userId?: string;
  title: string;
  room: string;
  frequency: "daily" | "weekly" | "monthly";
  lastDone: string | null;
  nextDue: string;
  createdAt: string;
}

export function getCleaningTasks(userId?: string): CleaningTask[] {
  const tasks = readCollection<CleaningTask>("cleaning");
  if (userId) return tasks.filter((t) => t.userId === userId);
  return tasks;
}

export function createCleaningTask(data: Omit<CleaningTask, "id" | "createdAt">): CleaningTask {
  const tasks = readCollection<CleaningTask>("cleaning");
  const task: CleaningTask = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
  };
  tasks.push(task);
  writeCollection("cleaning", tasks);
  return task;
}

export function updateCleaningTask(id: string, updates: Partial<CleaningTask>): CleaningTask | undefined {
  const tasks = readCollection<CleaningTask>("cleaning");
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  tasks[idx] = { ...tasks[idx], ...updates };
  writeCollection("cleaning", tasks);
  return tasks[idx];
}

export function deleteCleaningTask(id: string): boolean {
  const tasks = readCollection<CleaningTask>("cleaning");
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  writeCollection("cleaning", filtered);
  return true;
}

// ---- Emergency Contacts ----
export interface EmergencyContact {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  relationship: string;
  createdAt: string;
}

export function getEmergencyContacts(userId?: string): EmergencyContact[] {
  const contacts = readCollection<EmergencyContact>("emergency");
  if (userId) return contacts.filter((c) => c.userId === userId);
  return contacts;
}

export function createEmergencyContact(data: Omit<EmergencyContact, "id" | "createdAt">): EmergencyContact {
  const contacts = readCollection<EmergencyContact>("emergency");
  const contact: EmergencyContact = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
  };
  contacts.push(contact);
  writeCollection("emergency", contacts);
  return contact;
}

export function updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): EmergencyContact | undefined {
  const contacts = readCollection<EmergencyContact>("emergency");
  const idx = contacts.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  contacts[idx] = { ...contacts[idx], ...updates };
  writeCollection("emergency", contacts);
  return contacts[idx];
}

export function deleteEmergencyContact(id: string): boolean {
  const contacts = readCollection<EmergencyContact>("emergency");
  const filtered = contacts.filter((c) => c.id !== id);
  if (filtered.length === contacts.length) return false;
  writeCollection("emergency", filtered);
  return true;
}

// ---- Water Logs ----
export interface WaterLog {
  id: string;
  userId?: string;
  logDate: string;
  glasses: number;
  createdAt: string;
}

export function getWaterLogs(userId?: string): WaterLog[] {
  const logs = readCollection<WaterLog>("water");
  if (userId) return logs.filter((l) => l.userId === userId);
  return logs;
}

export function getWaterLogByDate(userId: string, date: string): WaterLog | undefined {
  return readCollection<WaterLog>("water").find((l) => l.userId === userId && l.logDate === date);
}

export function upsertWaterLog(userId: string, logDate: string, glasses: number): WaterLog {
  const logs = readCollection<WaterLog>("water");
  const existing = logs.findIndex((l) => l.userId === userId && l.logDate === logDate);
  if (existing >= 0) {
    logs[existing].glasses = glasses;
    writeCollection("water", logs);
    return logs[existing];
  }
  const log: WaterLog = {
    id: generateId(),
    userId,
    logDate,
    glasses,
    createdAt: nowISO(),
  };
  logs.push(log);
  writeCollection("water", logs);
  return log;
}

// ---- Mood Entries ----
export interface MoodEntry {
  id: string;
  userId?: string;
  mood: number;
  note: string;
  entryDate: string;
  createdAt: string;
}

export function getMoodEntries(userId?: string): MoodEntry[] {
  const entries = readCollection<MoodEntry>("mood");
  if (userId) return entries.filter((e) => e.userId === userId);
  return entries;
}

export function createMoodEntry(data: Omit<MoodEntry, "id" | "createdAt">): MoodEntry {
  const entries = readCollection<MoodEntry>("mood");
  const entry: MoodEntry = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
  };
  entries.push(entry);
  writeCollection("mood", entries);
  return entry;
}

export function deleteMoodEntry(id: string): boolean {
  const entries = readCollection<MoodEntry>("mood");
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === entries.length) return false;
  writeCollection("mood", filtered);
  return true;
}

// ---- Contact Messages ----
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export function createContactMessage(data: { name: string; email: string; message: string }): ContactMessage {
  const messages = readCollection<ContactMessage>("contact_messages");
  const msg: ContactMessage = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
  };
  messages.push(msg);
  writeCollection("contact_messages", messages);
  return msg;
}

// ---- Newsletter Subscribers ----
export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export function createNewsletterSubscriber(email: string): NewsletterSubscriber {
  const subs = readCollection<NewsletterSubscriber>("newsletter");
  if (subs.find((s) => s.email === email)) {
    throw new Error("Email already subscribed");
  }
  const sub: NewsletterSubscriber = {
    id: generateId(),
    email,
    createdAt: nowISO(),
  };
  subs.push(sub);
  writeCollection("newsletter", subs);
  return sub;
}
