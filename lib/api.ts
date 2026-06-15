import { getApiUrl } from "./query-client";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const base = getApiUrl();
  const url = new URL(path, base);
  const res = await fetch(url.toString(), {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// ---- Users ----
export interface ApiUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  createdAt: string;
}

export function getUsers() {
  return request<ApiUser[]>("GET", "/api/users");
}

export function getUser(id: string) {
  return request<ApiUser>("GET", `/api/users?id=${id}`);
}

export function createUser(data: { username: string; password: string; name?: string; email?: string }) {
  return request<ApiUser>("POST", "/api/users", data);
}

// ---- Tasks ----
export interface ApiTask {
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

export function getTasks(userId?: string) {
  const qs = userId ? `?user_id=${userId}` : "";
  return request<ApiTask[]>("GET", `/api/tasks${qs}`);
}

export function getTask(id: string) {
  return request<ApiTask>("GET", `/api/tasks/${id}`);
}

export function createTask(data: Record<string, unknown>) {
  return request<ApiTask>("POST", "/api/tasks", data);
}

export function updateTask(id: string, data: Record<string, unknown>) {
  return request<ApiTask>("PUT", `/api/tasks/${id}`, data);
}

export function deleteTask(id: string) {
  return request<{ message: string }>("DELETE", `/api/tasks/${id}`);
}

// ---- Expenses ----
export interface ApiExpense {
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

export function getExpenses(userId?: string) {
  const qs = userId ? `?user_id=${userId}` : "";
  return request<ApiExpense[]>("GET", `/api/expenses${qs}`);
}

export function createExpense(data: Record<string, unknown>) {
  return request<ApiExpense>("POST", "/api/expenses", data);
}

export function updateExpense(id: string, data: Record<string, unknown>) {
  return request<ApiExpense>("PUT", `/api/expenses/${id}`, data);
}

export function deleteExpense(id: string) {
  return request<{ message: string }>("DELETE", `/api/expenses/${id}`);
}

// ---- Meals ----
export interface ApiMeal {
  id: string;
  userId?: string;
  day: string;
  mealType: string;
  name: string;
  ingredients: string[];
  createdAt: string;
}

export function getMeals(userId?: string) {
  const qs = userId ? `?user_id=${userId}` : "";
  return request<ApiMeal[]>("GET", `/api/meals${qs}`);
}

export function createMeal(data: Record<string, unknown>) {
  return request<ApiMeal>("POST", "/api/meals", data);
}

export function deleteMeal(id: string) {
  return request<{ message: string }>("DELETE", `/api/meals/${id}`);
}

// ---- Grocery ----
export interface ApiGroceryItem {
  id: string;
  userId?: string;
  name: string;
  checked: boolean;
  category: string;
  createdAt: string;
}

export function getGroceryItems(userId?: string) {
  const qs = userId ? `?user_id=${userId}` : "";
  return request<ApiGroceryItem[]>("GET", `/api/grocery${qs}`);
}

export function createGroceryItem(data: Record<string, unknown>) {
  return request<ApiGroceryItem>("POST", "/api/grocery", data);
}

export function updateGroceryItem(id: string, data: Record<string, unknown>) {
  return request<ApiGroceryItem>("PUT", `/api/grocery/${id}`, data);
}

export function deleteGroceryItem(id: string) {
  return request<{ message: string }>("DELETE", `/api/grocery/${id}`);
}

// ---- Cleaning ----
export interface ApiCleaningTask {
  id: string;
  userId?: string;
  title: string;
  room: string;
  frequency: string;
  lastDone: string | null;
  nextDue: string;
  createdAt: string;
}

export function getCleaningTasks(userId?: string) {
  const qs = userId ? `?user_id=${userId}` : "";
  return request<ApiCleaningTask[]>("GET", `/api/cleaning${qs}`);
}

export function createCleaningTask(data: Record<string, unknown>) {
  return request<ApiCleaningTask>("POST", "/api/cleaning", data);
}

// ---- Emergency Contacts ----
export interface ApiEmergencyContact {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  relationship: string;
  createdAt: string;
}

export function getEmergencyContacts(userId?: string) {
  const qs = userId ? `?user_id=${userId}` : "";
  return request<ApiEmergencyContact[]>("GET", `/api/emergency${qs}`);
}

export function createEmergencyContact(data: Record<string, unknown>) {
  return request<ApiEmergencyContact>("POST", "/api/emergency", data);
}

export function deleteEmergencyContact(id: string) {
  return request<{ message: string }>("DELETE", `/api/emergency/${id}`);
}

// ---- Water ----
export interface ApiWaterLog {
  logDate: string;
  glasses: number;
}

export function getWaterLog(userId: string, date?: string) {
  let qs = `?user_id=${userId}`;
  if (date) qs += `&date=${date}`;
  return request<ApiWaterLog[] | ApiWaterLog>("GET", `/api/water${qs}`);
}

export function saveWaterLog(userId: string, date: string, glasses: number) {
  return request<ApiWaterLog>("POST", "/api/water", { user_id: userId, date, glasses });
}

// ---- Mood ----
export interface ApiMoodEntry {
  id: string;
  userId?: string;
  mood: number;
  note: string;
  entryDate: string;
  createdAt: string;
}

export function getMoodEntries(userId?: string) {
  const qs = userId ? `?user_id=${userId}` : "";
  return request<ApiMoodEntry[]>("GET", `/api/mood${qs}`);
}

export function createMoodEntry(data: Record<string, unknown>) {
  return request<ApiMoodEntry>("POST", "/api/mood", data);
}

export function deleteMoodEntry(id: string) {
  return request<{ message: string }>("DELETE", `/api/mood/${id}`);
}

// ---- Contact ----
export function submitContact(data: { name: string; email: string; message: string }) {
  return request<{ success: boolean; message: string }>("POST", "/api/contact", data);
}

// ---- Newsletter ----
export function subscribeNewsletter(email: string) {
  return request<{ success: boolean; message: string }>("POST", "/api/newsletter", { email });
}
