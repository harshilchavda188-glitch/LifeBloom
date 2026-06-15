const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.resolve(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection(collection) {
  try {
    const fp = filePath(collection);
    if (!fs.existsSync(fp)) return [];
    const raw = fs.readFileSync(fp, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCollection(collection, data) {
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2), "utf-8");
}

function generateId() {
  return crypto.randomUUID();
}

function nowISO() {
  return new Date().toISOString();
}

// ---- Users ----
function getUsers() {
  return readCollection("users");
}

function getUser(id) {
  return getUsers().find((u) => u.id === id);
}

function getUserByUsername(username) {
  return getUsers().find((u) => u.username === username);
}

function getUserByEmail(email) {
  return getUsers().find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
}

function createUser(data) {
  const users = getUsers();
  if (users.find((u) => u.username === data.username)) {
    throw new Error("Username already exists");
  }
  const user = {
    id: generateId(),
    username: data.username,
    password: data.password,
    name: data.name || null,
    email: data.email || null,
    createdAt: nowISO(),
  };
  users.push(user);
  writeCollection("users", users);
  return user;
}

function updateUser(id, updates) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...updates };
  writeCollection("users", users);
  return users[idx];
}

function deleteUser(id) {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  writeCollection("users", filtered);
  return true;
}

// ---- Tasks ----
function getTasks(userId) {
  const tasks = readCollection("tasks");
  if (userId) return tasks.filter((t) => t.userId === userId);
  return tasks;
}

function getTask(id) {
  return readCollection("tasks").find((t) => t.id === id);
}

function createTask(data) {
  const tasks = readCollection("tasks");
  const task = { ...data, id: generateId(), createdAt: nowISO() };
  tasks.push(task);
  writeCollection("tasks", tasks);
  return task;
}

function updateTask(id, updates) {
  const tasks = readCollection("tasks");
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  tasks[idx] = { ...tasks[idx], ...updates };
  writeCollection("tasks", tasks);
  return tasks[idx];
}

function deleteTask(id) {
  const tasks = readCollection("tasks");
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  writeCollection("tasks", filtered);
  return true;
}

// ---- Expenses ----
function getExpenses(userId) {
  const expenses = readCollection("expenses");
  if (userId) return expenses.filter((e) => e.userId === userId);
  return expenses;
}

function getExpense(id) {
  return readCollection("expenses").find((e) => e.id === id);
}

function createExpense(data) {
  const expenses = readCollection("expenses");
  const expense = { ...data, id: generateId(), createdAt: nowISO() };
  expenses.push(expense);
  writeCollection("expenses", expenses);
  return expense;
}

function updateExpense(id, updates) {
  const expenses = readCollection("expenses");
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  expenses[idx] = { ...expenses[idx], ...updates };
  writeCollection("expenses", expenses);
  return expenses[idx];
}

function deleteExpense(id) {
  const expenses = readCollection("expenses");
  const filtered = expenses.filter((e) => e.id !== id);
  if (filtered.length === expenses.length) return false;
  writeCollection("expenses", filtered);
  return true;
}

// ---- Meals ----
function getMeals(userId) {
  const meals = readCollection("meals");
  if (userId) return meals.filter((m) => m.userId === userId);
  return meals;
}

function getMeal(id) {
  return readCollection("meals").find((m) => m.id === id);
}

function createMeal(data) {
  const meals = readCollection("meals");
  const meal = { ...data, id: generateId(), createdAt: nowISO() };
  meals.push(meal);
  writeCollection("meals", meals);
  return meal;
}

function deleteMeal(id) {
  const meals = readCollection("meals");
  const filtered = meals.filter((m) => m.id !== id);
  if (filtered.length === meals.length) return false;
  writeCollection("meals", filtered);
  return true;
}

// ---- Grocery ----
function getGroceryItems(userId) {
  const items = readCollection("grocery");
  if (userId) return items.filter((i) => i.userId === userId);
  return items;
}

function createGroceryItem(data) {
  const items = readCollection("grocery");
  const item = { ...data, id: generateId(), createdAt: nowISO() };
  items.push(item);
  writeCollection("grocery", items);
  return item;
}

function updateGroceryItem(id, updates) {
  const items = readCollection("grocery");
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  writeCollection("grocery", items);
  return items[idx];
}

function deleteGroceryItem(id) {
  const items = readCollection("grocery");
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  writeCollection("grocery", filtered);
  return true;
}

// ---- Cleaning ----
function getCleaningTasks(userId) {
  const tasks = readCollection("cleaning");
  if (userId) return tasks.filter((t) => t.userId === userId);
  return tasks;
}

function createCleaningTask(data) {
  const tasks = readCollection("cleaning");
  const task = { ...data, id: generateId(), createdAt: nowISO() };
  tasks.push(task);
  writeCollection("cleaning", tasks);
  return task;
}

function deleteCleaningTask(id) {
  const tasks = readCollection("cleaning");
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  writeCollection("cleaning", filtered);
  return true;
}

// ---- Emergency Contacts ----
function getEmergencyContacts(userId) {
  const contacts = readCollection("emergency");
  if (userId) return contacts.filter((c) => c.userId === userId);
  return contacts;
}

function createEmergencyContact(data) {
  const contacts = readCollection("emergency");
  const contact = { ...data, id: generateId(), createdAt: nowISO() };
  contacts.push(contact);
  writeCollection("emergency", contacts);
  return contact;
}

function deleteEmergencyContact(id) {
  const contacts = readCollection("emergency");
  const filtered = contacts.filter((c) => c.id !== id);
  if (filtered.length === contacts.length) return false;
  writeCollection("emergency", filtered);
  return true;
}

// ---- Water ----
function getWaterLogs(userId) {
  const logs = readCollection("water");
  if (userId) return logs.filter((l) => l.userId === userId);
  return logs;
}

function getWaterLogByDate(userId, date) {
  return readCollection("water").find((l) => l.userId === userId && l.logDate === date);
}

function upsertWaterLog(userId, logDate, glasses) {
  const logs = readCollection("water");
  const existing = logs.findIndex((l) => l.userId === userId && l.logDate === logDate);
  if (existing >= 0) {
    logs[existing].glasses = glasses;
    writeCollection("water", logs);
    return logs[existing];
  }
  const log = { id: generateId(), userId, logDate, glasses, createdAt: nowISO() };
  logs.push(log);
  writeCollection("water", logs);
  return log;
}

// ---- Mood ----
function getMoodEntries(userId) {
  const entries = readCollection("mood");
  if (userId) return entries.filter((e) => e.userId === userId);
  return entries;
}

function createMoodEntry(data) {
  const entries = readCollection("mood");
  const entry = { ...data, id: generateId(), createdAt: nowISO() };
  entries.push(entry);
  writeCollection("mood", entries);
  return entry;
}

function deleteMoodEntry(id) {
  const entries = readCollection("mood");
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === entries.length) return false;
  writeCollection("mood", filtered);
  return true;
}

// ---- Contact ----
function createContactMessage(data) {
  const messages = readCollection("contact_messages");
  const msg = { ...data, id: generateId(), createdAt: nowISO() };
  messages.push(msg);
  writeCollection("contact_messages", messages);
  return msg;
}

// ---- Newsletter ----
function createNewsletterSubscriber(email) {
  const subs = readCollection("newsletter");
  if (subs.find((s) => s.email === email)) {
    throw new Error("Email already subscribed");
  }
  const sub = { id: generateId(), email, createdAt: nowISO() };
  subs.push(sub);
  writeCollection("newsletter", subs);
  return sub;
}

module.exports = {
  getUsers, getUser, getUserByUsername, getUserByEmail,
  createUser, updateUser, deleteUser,
  getTasks, getTask, createTask, updateTask, deleteTask,
  getExpenses, getExpense, createExpense, updateExpense, deleteExpense,
  getMeals, getMeal, createMeal, deleteMeal,
  getGroceryItems, createGroceryItem, updateGroceryItem, deleteGroceryItem,
  getCleaningTasks, createCleaningTask, deleteCleaningTask,
  getEmergencyContacts, createEmergencyContact, deleteEmergencyContact,
  getWaterLogs, getWaterLogByDate, upsertWaterLog,
  getMoodEntries, createMoodEntry, deleteMoodEntry,
  createContactMessage, createNewsletterSubscriber,
};
