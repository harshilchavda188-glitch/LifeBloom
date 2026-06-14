# LifeBloom - Women's Daily Life Management App

A comprehensive cross-platform mobile/web application designed for women to manage daily life efficiently. Built with **Expo (React Native)**, **Express.js**, and **PHP + MySQL**.

---

## Features

### 1. Task Management
- Create/edit/delete tasks with categories (Office, Home, Kids, Personal, Health)
- Daily, weekly, and monthly views
- Recurring tasks with priority levels (Low, Medium, High)
- Due date and time tracking

### 2. Budget & Finance
- Track expenses and income in INR
- Categorize transactions
- Monthly budget planning
- Income vs Expense analytics
- Pending/completed payment tracking

### 3. Kitchen & Meal Management
- Weekly meal planner (Breakfast, Lunch, Dinner, Snack)
- Grocery list generator
- Ingredient tracking
- Meal suggestions

### 4. Home Management
- Cleaning schedule planner
- Room-based task organization
- Frequency settings (Daily, Weekly, Monthly)
- Maintenance tracking

### 5. Safety Features
- Emergency SOS button
- Emergency contact list
- Simulated location sharing

### 6. Health & Wellness
- Water intake tracker (daily glasses)
- Mood tracker (1-5 scale with notes)
- Self-care reminders

### 7. Work-Life Balance
- Pomodoro focus timer
- Stress management tools
- Productivity tracking

### 8. AI Assistant
- AI-powered task generation
- Meal suggestions
- Budget tips
- Chat assistant (mock, ready for OpenAI/Runa integration)

### 9. Authentication
- Secure user registration and login
- SHA-256 password hashing (client-side)
- Session management via AsyncStorage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Expo SDK 54, React Native 0.81, React 19 |
| **Routing** | Expo Router v6 (file-based) |
| **State Management** | TanStack React Query, React Context |
| **Local Storage** | AsyncStorage |
| **Backend** | Express.js v5 (Node.js) |
| **Database (PHP)** | PHP 8+ with MySQL/MariaDB |
| **Database (Current)** | Drizzle ORM + PostgreSQL (schema ready) |
| **Styling** | React Native StyleSheet, Nunito Font |
| **Icons** | @expo/vector-icons (Ionicons) |
| **AI** | OpenAI/Runa SDK ready |

---

## Project Structure

```
LifeBloom/
├── app/                    # Expo Router pages
│   ├── (tabs)/             # Tab navigation screens
│   │   ├── index.tsx       # Home / Dashboard
│   │   ├── tasks.tsx       # Tasks tab
│   │   ├── budget.tsx      # Budget tab
│   │   ├── meals.tsx       # Meals tab
│   │   └── more.tsx        # More / Settings tab
│   ├── index.tsx           # Auth / Login screen
│   ├── safety.tsx          # Safety & SOS
│   ├── health.tsx          # Health & Wellness
│   ├── home-manage.tsx     # Home management
│   ├── pomodoro.tsx        # Focus timer
│   ├── ai-chat.tsx         # AI chat modal
│   ├── add-task.tsx        # Add task form
│   ├── add-expense.tsx     # Add expense form
│   └── add-meal.tsx        # Add meal form
├── assets/images/          # App icons and splash images
├── components/             # Shared components
├── constants/              # Colors and theme constants
├── lib/                    # Core logic
│   ├── storage.ts          # AsyncStorage CRUD operations
│   ├── auth-context.tsx    # Authentication context
│   ├── ai.ts               # AI API mutations
│   └── responsive.ts       # Responsive design utilities
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Server storage interface
│   └── templates/          # Landing page HTML
├── php/                    # PHP + MySQL backend
│   ├── index.php           # API router
│   ├── schema.sql          # MySQL database schema
│   ├── includes/
│   │   └── config.php      # Database config & helpers
│   └── api/
│       ├── users.php       # User auth endpoints
│       ├── tasks.php       # Task CRUD
│       ├── expenses.php    # Expense CRUD
│       ├── meals.php       # Meal CRUD
│       ├── grocery.php     # Grocery list CRUD
│       ├── cleaning.php    # Cleaning tasks CRUD
│       ├── emergency.php   # Emergency contacts CRUD
│       ├── water.php       # Water log CRUD
│       ├── mood.php        # Mood entries CRUD
│       ├── contact.php     # Contact form
│       └── newsletter.php  # Newsletter subscription
├── shared/schema.ts        # Drizzle ORM schema
├── start.bat               # One-click launcher (Windows)
├── package.json            # Dependencies & scripts
└── README.md               # This file
```

---

## Requirements

### Required Software
| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | >= 18 | JavaScript runtime |
| npm | >= 9 | Package manager |
| Expo CLI | latest | React Native development |
| PHP | >= 8.0 | PHP API server (optional) |
| MySQL | >= 5.7 | Database (optional) |

### Installation

1. **Clone the repository:**
```
git clone https://github.com/yourusername/LifeBloom.git
cd LifeBloom
```

2. **Install Node.js dependencies:**
```
npm install
```

3. **Setup MySQL Database (optional):**
   - Install MySQL server
   - Run the schema script:
```
mysql -u root -p < php/schema.sql
```
   - Configure database credentials in `php/includes/config.php` or set environment variables:
     - `DB_HOST` (default: localhost)
     - `DB_NAME` (default: lifebloom)
     - `DB_USER` (default: root)
     - `DB_PASS` (default: empty)

---

## How to Run

### One-Click Launch (Windows)
Double-click **`start.bat`** to start everything automatically.

### Manual Launch

#### Start Express Backend + Expo (Web):
```
npm run dev:web
```
This starts both the Express server (port 5000) and Expo web interface (port 8081).

#### Start with Expo Go (Mobile):
```
npm run expo:dev
```
Scan the QR code with Expo Go app on your phone.

#### Start PHP API Server (separate terminal):
```
php -S localhost:8000 -t php php/index.php
```

### Access Points
| Service | URL |
|---------|-----|
| Expo Web App | http://localhost:8081 |
| Express Backend | http://localhost:5000 |
| PHP API | http://localhost:8000 |
| Landing Page | http://localhost:5000 |

---

## API Endpoints

### Express Backend (port 5000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| POST | `/api/newsletter` | Subscribe to newsletter |
| POST | `/api/ai/generate-task` | AI task generation |
| POST | `/api/ai/suggest-meal` | AI meal suggestions |
| POST | `/api/ai/budget-tip` | AI budget tips |
| POST | `/api/ai/chat` | AI chat assistant |

### PHP API (port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users?action=register` | Register new user |
| POST | `/api/users?action=login` | User login |
| GET | `/api/tasks?user_id=X` | Get user tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks?id=X` | Update task |
| DELETE | `/api/tasks?id=X` | Delete task |
| GET | `/api/expenses?user_id=X` | Get user expenses |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses?id=X` | Update expense |
| DELETE | `/api/expenses?id=X` | Delete expense |
| GET | `/api/meals?user_id=X` | Get user meals |
| POST | `/api/meals` | Create meal |
| DELETE | `/api/meals?id=X` | Delete meal |
| GET | `/api/grocery?user_id=X` | Get grocery list |
| POST | `/api/grocery` | Add grocery item |
| PUT | `/api/grocery?id=X` | Update item |
| DELETE | `/api/grocery?id=X` | Delete item |
| GET | `/api/cleaning?user_id=X` | Get cleaning tasks |
| POST | `/api/cleaning` | Create cleaning task |
| PUT | `/api/cleaning?id=X` | Update task |
| DELETE | `/api/cleaning?id=X` | Delete task |
| GET | `/api/emergency?user_id=X` | Get emergency contacts |
| POST | `/api/emergency` | Add contact |
| DELETE | `/api/emergency?id=X` | Delete contact |
| GET | `/api/water?user_id=X&date=YYYY-MM-DD` | Get water log |
| POST | `/api/water` | Save water log |
| GET | `/api/mood?user_id=X` | Get mood entries |
| POST | `/api/mood` | Log mood entry |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/newsletter` | Subscribe newsletter |

---

## Database

### Current: AsyncStorage (Client-side)
All user data is stored locally on the device using React Native AsyncStorage. No server-side database is required for basic functionality.

### PostgreSQL (Drizzle ORM)
A PostgreSQL schema is defined via Drizzle ORM in `shared/schema.ts` with a `users` table ready for expansion. Push the schema:
```
npm run db:push
```

### MySQL (PHP Backend)
A full MySQL schema is available in `php/schema.sql` covering all data entities. The PHP API provides RESTful CRUD operations against MySQL.

---

## Data Models

### User
- `id` (UUID), `username`, `password` (hashed)

### Task
- `id`, `title`, `category` (office/home/kids/personal/health), `completed`, `dueDate`, `dueTime`, `recurring` (none/daily/weekly/monthly), `priority` (low/medium/high)

### Expense
- `id`, `title`, `amount`, `category`, `type` (income/expense), `status` (completed/pending), `date`

### Meal
- `id`, `day`, `mealType` (breakfast/lunch/dinner/snack), `name`, `ingredients[]`

### GroceryItem, CleaningTask, EmergencyContact, WaterLog, MoodEntry

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev:web` | `npm run dev:web` | Start Express + Expo (Web) |
| `expo:dev` | `npm run expo:dev` | Start Express + Expo (Mobile QR) |
| `server:dev` | `npm run server:dev` | Start Express backend only |
| `db:push` | `npm run db:push` | Push Drizzle schema to PostgreSQL |
| `start` | `npm start` | Alias for dev:web |
| `lint` | `npm run lint` | Run ESLint |

---

## Deployment

### Production Build
```
npm run expo:static:build    # Build static Expo bundles
npm run server:build         # Build Express server
npm run server:prod          # Start production server
```

### Replit Deployment
The project includes `.replit` and `.local/` configuration for deployment on Replit CloudRun.

---

## Troubleshooting

### "npm install" fails
- Ensure Node.js >= 18 is installed
- Delete `node_modules` and `package-lock.json`, then retry

### Expo web not loading
- Ensure port 8081 is not in use
- Run `npx expo start --web` directly

### PHP API not working
- Verify PHP 8+ is installed: `php -v`
- Check MySQL connection in `php/includes/config.php`
- Ensure database is imported: `mysql -u root < php/schema.sql`

### App not starting with start.bat
- Run `start.bat` as Administrator
- Check Windows Defender firewall for port blocks (5000, 8081, 8000)

---

## License

MIT
#   b b  
 