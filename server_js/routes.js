const db = require("./database");

function registerRoutes(app) {
  // ---- USERS ----
  app.get("/api/users", (req, res) => {
    const userId = req.query.user_id;
    if (userId) {
      const user = db.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { password, ...safe } = user;
      return res.json(safe);
    }
    const users = db.getUsers().map(({ password, ...u }) => u);
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    try {
      const { username, password, name, email } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      const user = db.createUser({ username, password, name, email });
      const { password: _, ...safe } = user;
      res.status(201).json(safe);
    } catch (e) {
      res.status(400).json({ error: e.message || "Failed to create user" });
    }
  });

  app.put("/api/users", (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "id required" });
    const user = db.updateUser(id, req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...safe } = user;
    res.json(safe);
  });

  app.delete("/api/users", (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "id required" });
    db.deleteUser(id);
    res.json({ message: "User deleted" });
  });

  // ---- TASKS ----
  app.get("/api/tasks", (req, res) => {
    res.json(db.getTasks(req.query.user_id));
  });

  app.get("/api/tasks/:id", (req, res) => {
    const task = db.getTask(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });

  app.post("/api/tasks", (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const task = db.createTask({
      userId: req.body.user_id || null,
      title,
      category: req.body.category || "personal",
      completed: req.body.completed || false,
      dueDate: req.body.due_date || null,
      dueTime: req.body.due_time || null,
      recurring: req.body.recurring || "none",
      priority: req.body.priority || "medium",
      completedAt: req.body.completed ? new Date().toISOString() : undefined,
    });
    res.status(201).json(task);
  });

  app.put("/api/tasks/:id", (req, res) => {
    const task = db.updateTask(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });

  app.delete("/api/tasks/:id", (req, res) => {
    db.deleteTask(req.params.id);
    res.json({ message: "Task deleted" });
  });

  // ---- EXPENSES ----
  app.get("/api/expenses", (req, res) => {
    res.json(db.getExpenses(req.query.user_id));
  });

  app.get("/api/expenses/:id", (req, res) => {
    const expense = db.getExpense(req.params.id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  });

  app.post("/api/expenses", (req, res) => {
    const { title, amount } = req.body;
    if (!title || amount === undefined) {
      return res.status(400).json({ error: "title and amount required" });
    }
    const expense = db.createExpense({
      userId: req.body.user_id || null,
      title,
      amount: Number(amount),
      category: req.body.category || "",
      type: req.body.type || "expense",
      status: req.body.status || "completed",
      date: req.body.date || new Date().toISOString().split("T")[0],
    });
    res.status(201).json(expense);
  });

  app.put("/api/expenses/:id", (req, res) => {
    const expense = db.updateExpense(req.params.id, req.body);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  });

  app.delete("/api/expenses/:id", (req, res) => {
    db.deleteExpense(req.params.id);
    res.json({ message: "Expense deleted" });
  });

  // ---- MEALS ----
  app.get("/api/meals", (req, res) => {
    res.json(db.getMeals(req.query.user_id));
  });

  app.get("/api/meals/:id", (req, res) => {
    const meal = db.getMeal(req.params.id);
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json(meal);
  });

  app.post("/api/meals", (req, res) => {
    const { day, meal_type, name } = req.body;
    if (!day || !meal_type || !name) {
      return res.status(400).json({ error: "day, meal_type, and name required" });
    }
    const meal = db.createMeal({
      userId: req.body.user_id || null,
      day,
      mealType: meal_type,
      name,
      ingredients: req.body.ingredients || [],
    });
    res.status(201).json(meal);
  });

  app.delete("/api/meals/:id", (req, res) => {
    db.deleteMeal(req.params.id);
    res.json({ message: "Meal deleted" });
  });

  // ---- GROCERY ----
  app.get("/api/grocery", (req, res) => {
    res.json(db.getGroceryItems(req.query.user_id));
  });

  app.post("/api/grocery", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const item = db.createGroceryItem({
      userId: req.body.user_id || null,
      name,
      checked: req.body.checked || false,
      category: req.body.category || "",
    });
    res.status(201).json(item);
  });

  app.put("/api/grocery/:id", (req, res) => {
    const item = db.updateGroceryItem(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  });

  app.delete("/api/grocery/:id", (req, res) => {
    db.deleteGroceryItem(req.params.id);
    res.json({ message: "Item deleted" });
  });

  // ---- CLEANING ----
  app.get("/api/cleaning", (req, res) => {
    res.json(db.getCleaningTasks(req.query.user_id));
  });

  app.post("/api/cleaning", (req, res) => {
    const { title, next_due } = req.body;
    if (!title || !next_due) {
      return res.status(400).json({ error: "title and next_due required" });
    }
    const task = db.createCleaningTask({
      userId: req.body.user_id || null,
      title,
      room: req.body.room || "",
      frequency: req.body.frequency || "weekly",
      lastDone: req.body.last_done || null,
      nextDue: next_due,
    });
    res.status(201).json(task);
  });

  app.delete("/api/cleaning/:id", (req, res) => {
    db.deleteCleaningTask(req.params.id);
    res.json({ message: "Task deleted" });
  });

  // ---- EMERGENCY ----
  app.get("/api/emergency", (req, res) => {
    res.json(db.getEmergencyContacts(req.query.user_id));
  });

  app.post("/api/emergency", (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "name and phone required" });
    }
    const contact = db.createEmergencyContact({
      userId: req.body.user_id || null,
      name,
      phone,
      relationship: req.body.relationship || "",
    });
    res.status(201).json(contact);
  });

  app.delete("/api/emergency/:id", (req, res) => {
    db.deleteEmergencyContact(req.params.id);
    res.json({ message: "Contact deleted" });
  });

  // ---- WATER ----
  app.get("/api/water", (req, res) => {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: "user_id required" });
    const date = req.query.date;
    if (date) {
      const log = db.getWaterLogByDate(userId, date);
      return res.json(log || { logDate: date, glasses: 0 });
    }
    res.json(db.getWaterLogs(userId));
  });

  app.post("/api/water", (req, res) => {
    const { user_id, date, glasses } = req.body;
    if (!user_id || !date || glasses === undefined) {
      return res.status(400).json({ error: "user_id, date, and glasses required" });
    }
    const log = db.upsertWaterLog(user_id, date, Number(glasses));
    res.json(log);
  });

  // ---- MOOD ----
  app.get("/api/mood", (req, res) => {
    res.json(db.getMoodEntries(req.query.user_id));
  });

  app.post("/api/mood", (req, res) => {
    const { mood, entry_date } = req.body;
    if (mood === undefined || !entry_date) {
      return res.status(400).json({ error: "mood and entry_date required" });
    }
    const entry = db.createMoodEntry({
      userId: req.body.user_id || null,
      mood: Number(mood),
      note: req.body.note || "",
      entryDate: entry_date,
    });
    res.status(201).json(entry);
  });

  app.delete("/api/mood/:id", (req, res) => {
    db.deleteMoodEntry(req.params.id);
    res.json({ message: "Entry deleted" });
  });

  // ---- CONTACT ----
  app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields required" });
    }
    db.createContactMessage({ name, email, message });
    res.json({ success: true, message: "Thank you for reaching out!" });
  });

  // ---- NEWSLETTER ----
  app.post("/api/newsletter", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    try {
      db.createNewsletterSubscriber(email);
      res.json({ success: true, message: "Successfully joined the newsletter!" });
    } catch (e) {
      res.status(400).json({ error: e.message || "Failed to subscribe" });
    }
  });

  // ---- AI ENDPOINTS ----
  app.post("/api/ai/generate-task", (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });
    res.json([
      {
        title: "Complete project report",
        category: "work",
        description: "Finish the quarterly report with charts",
        estimatedTime: 45,
      },
      {
        title: "30 min walk",
        category: "health",
        description: "Evening walk for fresh air",
        estimatedTime: 30,
      },
    ]);
  });

  app.post("/api/ai/suggest-meal", (req, res) => {
    res.json([
      {
        meal: "lunch",
        title: "Quinoa Salad",
        ingredients: ["quinoa", "cucumber", "tomato", "feta", "olive oil"],
        calories: 450,
        prepTime: 15,
      },
    ]);
  });

  app.post("/api/ai/budget-tip", (req, res) => {
    res.json({
      tip: "Cook at home 3x/week to save $50/month",
      category: "food",
      savingsEstimate: 50,
    });
  });

  app.post("/api/ai/chat", (req, res) => {
    const { messages } = req.body;
    if (!messages) return res.status(400).json({ error: "Messages required" });
    res.json({
      reply: "Great idea! Here are some suggestions based on your request. (Demo mode - add your OpenAI key for real AI)",
    });
  });
}

module.exports = { registerRoutes };
