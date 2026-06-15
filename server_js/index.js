const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const db = require("./database");

let PORT = parseInt(process.env.PORT || "5000", 10);
const log = console.log;

function tryKillPort(p) {
  try {
    const result = execSync(
      `netstat -ano | findstr ":${p} "`,
      { encoding: "utf8", timeout: 3000 }
    );
    const lines = result.trim().split("\n").filter(l => l.includes("LISTENING"));
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        log(`Killing existing process on port ${p} (PID: ${pid})...`);
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore", timeout: 3000 });
        return true;
      }
    }
  } catch {}
  return false;
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function parseURL(req) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  return url;
}

function getUserId(req) {
  return parseURL(req).searchParams.get("user_id") || "";
}

async function handleRequest(req, res) {
  const url = parseURL(req);
  const pathname = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    });
    return res.end();
  }

  const start = Date.now();

  try {
    const body = ["POST", "PUT"].includes(method) ? await parseBody(req) : {};
    let result;

    // ---- USER ROUTES ----
    if (pathname === "/api/users" && method === "GET") {
      const id = url.searchParams.get("id");
      if (id) {
        const user = db.getUser(id);
        if (!user) return sendJSON(res, 404, { error: "User not found" });
        const { password, ...safe } = user;
        return sendJSON(res, 200, safe);
      }
      const users = db.getUsers().map(({ password, ...u }) => u);
      return sendJSON(res, 200, users);
    }

    if (pathname === "/api/users" && method === "POST") {
      if (!body.username || !body.password) {
        return sendJSON(res, 400, { error: "Username and password required" });
      }
      try {
        const user = db.createUser(body);
        const { password, ...safe } = user;
        return sendJSON(res, 201, safe);
      } catch (e) {
        return sendJSON(res, 400, { error: e.message });
      }
    }

    if (pathname === "/api/users" && method === "PUT") {
      const id = url.searchParams.get("id");
      if (!id) return sendJSON(res, 400, { error: "id required" });
      const user = db.updateUser(id, body);
      if (!user) return sendJSON(res, 404, { error: "User not found" });
      const { password, ...safe } = user;
      return sendJSON(res, 200, safe);
    }

    if (pathname === "/api/users" && method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return sendJSON(res, 400, { error: "id required" });
      db.deleteUser(id);
      return sendJSON(res, 200, { message: "User deleted" });
    }

    // ---- TASK ROUTES ----
    const taskMatch = pathname.match(/^\/api\/tasks(?:\/([^/]+))?$/);
    if (taskMatch) {
      const taskId = taskMatch[1];
      if (method === "GET" && !taskId) {
        return sendJSON(res, 200, db.getTasks(getUserId(req)));
      }
      if (method === "GET" && taskId) {
        const task = db.getTask(taskId);
        if (!task) return sendJSON(res, 404, { error: "Task not found" });
        return sendJSON(res, 200, task);
      }
      if (method === "POST" && !taskId) {
        if (!body.title) return sendJSON(res, 400, { error: "title required" });
        const task = db.createTask({
          userId: body.user_id || null,
          title: body.title,
          category: body.category || "personal",
          completed: body.completed || false,
          dueDate: body.due_date || null,
          dueTime: body.due_time || null,
          recurring: body.recurring || "none",
          priority: body.priority || "medium",
          completedAt: body.completed ? new Date().toISOString() : undefined,
        });
        return sendJSON(res, 201, task);
      }
      if (method === "PUT" && taskId) {
        const task = db.updateTask(taskId, body);
        if (!task) return sendJSON(res, 404, { error: "Task not found" });
        return sendJSON(res, 200, task);
      }
      if (method === "DELETE" && taskId) {
        db.deleteTask(taskId);
        return sendJSON(res, 200, { message: "Task deleted" });
      }
    }

    // ---- EXPENSE ROUTES ----
    const expMatch = pathname.match(/^\/api\/expenses(?:\/([^/]+))?$/);
    if (expMatch) {
      const expId = expMatch[1];
      if (method === "GET" && !expId) return sendJSON(res, 200, db.getExpenses(getUserId(req)));
      if (method === "GET" && expId) {
        const exp = db.getExpense(expId);
        if (!exp) return sendJSON(res, 404, { error: "Expense not found" });
        return sendJSON(res, 200, exp);
      }
      if (method === "POST" && !expId) {
        if (!body.title || body.amount === undefined) {
          return sendJSON(res, 400, { error: "title and amount required" });
        }
        const exp = db.createExpense({
          userId: body.user_id || null,
          title: body.title,
          amount: Number(body.amount),
          category: body.category || "",
          type: body.type || "expense",
          status: body.status || "completed",
          date: body.date || new Date().toISOString().split("T")[0],
        });
        return sendJSON(res, 201, exp);
      }
      if (method === "PUT" && expId) {
        const exp = db.updateExpense(expId, body);
        if (!exp) return sendJSON(res, 404, { error: "Expense not found" });
        return sendJSON(res, 200, exp);
      }
      if (method === "DELETE" && expId) {
        db.deleteExpense(expId);
        return sendJSON(res, 200, { message: "Expense deleted" });
      }
    }

    // ---- MEAL ROUTES ----
    const mealMatch = pathname.match(/^\/api\/meals(?:\/([^/]+))?$/);
    if (mealMatch) {
      const mealId = mealMatch[1];
      if (method === "GET" && !mealId) return sendJSON(res, 200, db.getMeals(getUserId(req)));
      if (method === "GET" && mealId) {
        const meal = db.getMeal(mealId);
        if (!meal) return sendJSON(res, 404, { error: "Meal not found" });
        return sendJSON(res, 200, meal);
      }
      if (method === "POST" && !mealId) {
        if (!body.day || !body.meal_type || !body.name) {
          return sendJSON(res, 400, { error: "day, meal_type, and name required" });
        }
        const meal = db.createMeal({
          userId: body.user_id || null,
          day: body.day,
          mealType: body.meal_type,
          name: body.name,
          ingredients: body.ingredients || [],
        });
        return sendJSON(res, 201, meal);
      }
      if (method === "DELETE" && mealId) {
        db.deleteMeal(mealId);
        return sendJSON(res, 200, { message: "Meal deleted" });
      }
    }

    // ---- GROCERY ROUTES ----
    const groceryMatch = pathname.match(/^\/api\/grocery(?:\/([^/]+))?$/);
    if (groceryMatch) {
      const groceryId = groceryMatch[1];
      if (method === "GET" && !groceryId) return sendJSON(res, 200, db.getGroceryItems(getUserId(req)));
      if (method === "POST" && !groceryId) {
        if (!body.name) return sendJSON(res, 400, { error: "name required" });
        const item = db.createGroceryItem({
          userId: body.user_id || null,
          name: body.name,
          checked: body.checked || false,
          category: body.category || "",
        });
        return sendJSON(res, 201, item);
      }
      if (method === "PUT" && groceryId) {
        const item = db.updateGroceryItem(groceryId, body);
        if (!item) return sendJSON(res, 404, { error: "Item not found" });
        return sendJSON(res, 200, item);
      }
      if (method === "DELETE" && groceryId) {
        db.deleteGroceryItem(groceryId);
        return sendJSON(res, 200, { message: "Item deleted" });
      }
    }

    // ---- CLEANING ROUTES ----
    const cleanMatch = pathname.match(/^\/api\/cleaning(?:\/([^/]+))?$/);
    if (cleanMatch) {
      const cleanId = cleanMatch[1];
      if (method === "GET" && !cleanId) return sendJSON(res, 200, db.getCleaningTasks(getUserId(req)));
      if (method === "POST" && !cleanId) {
        if (!body.title || !body.next_due) {
          return sendJSON(res, 400, { error: "title and next_due required" });
        }
        const task = db.createCleaningTask({
          userId: body.user_id || null,
          title: body.title,
          room: body.room || "",
          frequency: body.frequency || "weekly",
          lastDone: body.last_done || null,
          nextDue: body.next_due,
        });
        return sendJSON(res, 201, task);
      }
      if (method === "DELETE" && cleanId) {
        db.deleteCleaningTask(cleanId);
        return sendJSON(res, 200, { message: "Task deleted" });
      }
    }

    // ---- EMERGENCY ROUTES ----
    const emergencyMatch = pathname.match(/^\/api\/emergency(?:\/([^/]+))?$/);
    if (emergencyMatch) {
      const emergencyId = emergencyMatch[1];
      if (method === "GET" && !emergencyId) return sendJSON(res, 200, db.getEmergencyContacts(getUserId(req)));
      if (method === "POST" && !emergencyId) {
        if (!body.name || !body.phone) {
          return sendJSON(res, 400, { error: "name and phone required" });
        }
        const contact = db.createEmergencyContact({
          userId: body.user_id || null,
          name: body.name,
          phone: body.phone,
          relationship: body.relationship || "",
        });
        return sendJSON(res, 201, contact);
      }
      if (method === "DELETE" && emergencyId) {
        db.deleteEmergencyContact(emergencyId);
        return sendJSON(res, 200, { message: "Contact deleted" });
      }
    }

    // ---- WATER ROUTES ----
    if (pathname === "/api/water" && method === "GET") {
      const userId = url.searchParams.get("user_id");
      if (!userId) return sendJSON(res, 400, { error: "user_id required" });
      const date = url.searchParams.get("date");
      if (date) {
        const log = db.getWaterLogByDate(userId, date);
        return sendJSON(res, 200, log || { logDate: date, glasses: 0 });
      }
      return sendJSON(res, 200, db.getWaterLogs(userId));
    }
    if (pathname === "/api/water" && method === "POST") {
      if (!body.user_id || !body.date || body.glasses === undefined) {
        return sendJSON(res, 400, { error: "user_id, date, and glasses required" });
      }
      const log = db.upsertWaterLog(body.user_id, body.date, Number(body.glasses));
      return sendJSON(res, 200, log);
    }

    // ---- MOOD ROUTES ----
    const moodMatch = pathname.match(/^\/api\/mood(?:\/([^/]+))?$/);
    if (moodMatch) {
      const moodId = moodMatch[1];
      if (method === "GET" && !moodId) return sendJSON(res, 200, db.getMoodEntries(getUserId(req)));
      if (method === "POST" && !moodId) {
        if (body.mood === undefined || !body.entry_date) {
          return sendJSON(res, 400, { error: "mood and entry_date required" });
        }
        const entry = db.createMoodEntry({
          userId: body.user_id || null,
          mood: Number(body.mood),
          note: body.note || "",
          entryDate: body.entry_date,
        });
        return sendJSON(res, 201, entry);
      }
      if (method === "DELETE" && moodId) {
        db.deleteMoodEntry(moodId);
        return sendJSON(res, 200, { message: "Entry deleted" });
      }
    }

    // ---- CONTACT ----
    if (pathname === "/api/contact" && method === "POST") {
      if (!body.name || !body.email || !body.message) {
        return sendJSON(res, 400, { error: "All fields required" });
      }
      db.createContactMessage(body);
      return sendJSON(res, 200, { success: true, message: "Thank you for reaching out!" });
    }

    // ---- NEWSLETTER ----
    if (pathname === "/api/newsletter" && method === "POST") {
      if (!body.email) return sendJSON(res, 400, { error: "Email required" });
      try {
        db.createNewsletterSubscriber(body.email);
        return sendJSON(res, 200, { success: true, message: "Successfully joined the newsletter!" });
      } catch (e) {
        return sendJSON(res, 400, { error: e.message });
      }
    }

    // ---- AI ENDPOINTS ----
    if (pathname === "/api/ai/generate-task" && method === "POST") {
      if (!body.prompt) return sendJSON(res, 400, { error: "Prompt required" });
      return sendJSON(res, 200, [
        { title: "Complete project report", category: "work", description: "Finish the quarterly report with charts", estimatedTime: 45 },
        { title: "30 min walk", category: "health", description: "Evening walk for fresh air", estimatedTime: 30 },
      ]);
    }
    if (pathname === "/api/ai/suggest-meal" && method === "POST") {
      return sendJSON(res, 200, [
        { meal: "lunch", title: "Quinoa Salad", ingredients: ["quinoa", "cucumber", "tomato", "feta", "olive oil"], calories: 450, prepTime: 15 },
      ]);
    }
    if (pathname === "/api/ai/budget-tip" && method === "POST") {
      return sendJSON(res, 200, { tip: "Cook at home 3x/week to save $50/month", category: "food", savingsEstimate: 50 });
    }
    if (pathname === "/api/ai/chat" && method === "POST") {
      if (!body.messages) return sendJSON(res, 400, { error: "Messages required" });
      return sendJSON(res, 200, { reply: "Great idea! Here are some suggestions based on your request. (Demo mode - add your OpenAI key for real AI)" });
    }

    // ---- Landing page ----
    if (pathname === "/" && method === "GET") {
      const templatePath = path.resolve(__dirname, "..", "server", "templates", "landing-page.html");
      try {
        let html = fs.readFileSync(templatePath, "utf-8");
        const protocol = req.headers["x-forwarded-proto"] || "http";
        const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${PORT}`;
        const baseUrl = `${protocol}://${host}`;
        html = html
          .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
          .replace(/EXPS_URL_PLACEHOLDER/g, host)
          .replace(/APP_NAME_PLACEHOLDER/g, "LifeBloom");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(html);
      } catch {
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end("<html><body><h1>LifeBloom</h1><p>Server running</p></body></html>");
      }
    }

    // 404
    sendJSON(res, 404, { error: "Not found" });
  } catch (e) {
    log("Error:", e.message);
    sendJSON(res, 500, { error: "Internal server error" });
  } finally {
    const duration = Date.now() - start;
    if (pathname.startsWith("/api")) {
      log(`${method} ${pathname} ${res.statusCode || 200} in ${duration}ms`);
    }
  }
}

const server = http.createServer(handleRequest);
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    log(`Port ${PORT} is in use, attempting to free it...`);
    const killed = tryKillPort(PORT);
    if (killed) {
      setTimeout(() => {
        server.close();
        server.listen(PORT, "0.0.0.0");
      }, 1500);
    } else {
      const newPort = PORT + 1;
      log(`Trying port ${newPort} instead...`);
      PORT = newPort;
      server.listen(PORT, "0.0.0.0");
    }
  } else {
    log("Server error:", err.message);
    process.exit(1);
  }
});
server.listen(PORT, "0.0.0.0", () => {
  log(`LifeBloom server running on http://localhost:${PORT}`);
  log(`API available at http://localhost:${PORT}/api`);
});
