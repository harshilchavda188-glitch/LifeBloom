# LifeBloom — Women's Daily Life Management App

A comprehensive cross-platform mobile/web application designed for women to manage daily life efficiently. Built with **Expo (React Native 19)**, **Node.js**, and **JSON file storage**.

---

## Project Analysis

### Architecture Overview

```
[Expo React Native Frontend]
        |
        | HTTP REST API (fetch)
        v
[Node.js Backend (server_js/index.js)]
        |
        | JSON file I/O
        v
[JSON File Store (data/*.json)]
```

Three-tier architecture: **Frontend (Expo)** → **Backend (Node.js HTTP)** → **Storage (JSON files)**.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Expo SDK 54, React Native 0.81, React 19 |
| **Routing** | Expo Router v6 (file-based routing) |
| **State Management** | TanStack React Query v5, React Context |
| **Backend** | Node.js (pure HTTP, no frameworks) |
| **Database** | JSON file storage (auto-created at runtime) |
| **Local Storage** | AsyncStorage (offline fallback) |
| **Styling** | React Native StyleSheet + Nunito font |
| **Icons** | @expo/vector-icons (Ionicons), SF Symbols |
| **Animations** | react-native-reanimated |
| **AI (mock)** | Mock endpoints, OpenAI/Runa ready |

---

## Features & Functionality

### 1. Task Management
Create, edit, delete, and track tasks with categories (Office, Home, Kids, Personal, Health), priority levels (Low/Medium/High), recurring options (None/Daily/Weekly/Monthly), due dates, and completion tracking. Views: Today, Week, All.

### 2. Budget & Finance
Track income and expenses in INR. Categorize transactions (Food, Transport, Shopping, Bills, Health, Education, Entertainment, Other). Monthly income vs. expense analytics with color-coded summary cards. Pending/completed payment status.

### 3. Meal Planning
Weekly meal planner for Breakfast, Lunch, Dinner, and Snack. Ingredient tracking per meal. Integrated grocery list with checked/unchecked state. Tab view with Planner and Grocery List.

### 4. Home Management
Cleaning schedule organized by room (Kitchen, Living Room, Bedroom, Bathroom, Balcony, Other). Frequency settings (Daily/Weekly/Monthly). Next due date tracking with overdue indicators.

### 5. Safety & Emergency
Emergency SOS button with simulated location sharing. Emergency contact list (name, phone, relationship). Call and SMS actions via device Linking. Add/delete contacts.

### 6. Health & Wellness
Water intake tracker — up to 12 glasses daily, 8-glass goal with progress bar. Mood tracker with 5-point scale (Great/Good/Okay/Low/Bad) and notes. 7-day mood history view.

### 7. Focus Timer (Pomodoro)
Pomodoro technique: Focus (25min), Short Break (5min), Long Break (15min). Animated circular progress ring. Start/pause/reset controls. Session counter.

### 8. AI Assistant (Mock)
AI-powered task generation from natural language. Meal suggestions based on preferences. Budget tips and financial advice. Conversational chat assistant. Mock responses ready for OpenAI/Runa integration with API key support.

### 9. Authentication
User registration and login with SHA-256 password hashing (client-side via expo-crypto). Session management via AsyncStorage. Auto-redirect to dashboard on login.

### 10. Contact & Newsletter
Contact form submission (name, email, message). Newsletter subscription with duplicate prevention.

---

## How the Project Works

### Frontend (app/)

The app uses **Expo Router** for file-based navigation. The root layout (`app/_layout.tsx`) wraps the app with:
- `ErrorBoundary` — catches rendering errors
- `QueryClientProvider` — TanStack React Query for server state
- `AuthProvider` — authentication context (login/logout/register)
- `GestureHandlerRootView` — gesture handling
- `KeyboardProvider` — keyboard-aware views

**Tab Navigation** (`app/(tabs)/_layout.tsx`) uses either SF Symbols (iOS 18+) or Ionicons with blur effect for 5 tabs: Home, Tasks, Budget, Meals, More.

**Data Flow:**
1. User interacts with a screen (e.g., adds a task)
2. `lib/storage.ts` attempts to send data to the backend API via `lib/api.ts`
3. If the server is unreachable, data is saved locally to AsyncStorage
4. Data is displayed using React Query hooks with automatic cache invalidation

### Backend (server_js/)

Pure Node.js HTTP server (no Express). Key files:
- **`server_js/index.js`** — HTTP server with CORS, JSON body parsing, all API routes
- **`server_js/database.js`** — JSON file persistence layer with auto-created collections

The server runs on **port 5000** and provides RESTful CRUD endpoints. On startup:
1. Checks if port 5000 is free; kills existing process if needed
2. Auto-creates `data/` directory if missing
3. Serves landing page at `GET /`
4. Handles all API requests at `/api/*`

### Database (data/)

Each collection is a JSON file in the `data/` directory:

| File | Contents |
|------|----------|
| `users.json` | User accounts with hashed passwords |
| `tasks.json` | Tasks with categories, priorities, dates |
| `expenses.json` | Income/expense records |
| `meals.json` | Meal plans with ingredients |
| `grocery.json` | Grocery list items |
| `cleaning.json` | Cleaning schedules |
| `emergency.json` | Emergency contacts |
| `water.json` | Daily water intake logs |
| `mood.json` | Mood entries |
| `contact_messages.json` | Contact form submissions |
| `newsletter.json` | Newsletter subscriptions |

All records use **UUID** identifiers (via `crypto.randomUUID()`).

### API Layer (lib/)

- **`lib/api.ts`** — Typed fetch functions for every backend endpoint
- **`lib/storage.ts`** — Dual-mode storage (server-first, AsyncStorage fallback)
- **`lib/query-client.ts`** — API URL resolution from `.env`, React Query configuration
- **`lib/auth-context.tsx`** — Authentication context provider
- **`lib/ai.ts`** — AI mutation hooks (React Query)
- **`lib/responsive.ts`** — Responsive design utilities with breakpoints

---

## How to Run

### Prerequisites

- **Node.js** >= 18 ([download](https://nodejs.org))
- **npm** >= 9 (comes with Node.js)

### Quick Start (Windows)

Double-click **`start.bat`** and choose:

- **`[1]`** — Install all dependencies (runs `npm install`)
- **`[2]`** — Start backend server + Expo frontend
- **`[3]`** — Exit

### Manual Start

```bash
# Install dependencies
npm install

# Start backend server only (port 5000)
npm start
# or: node server_js/index.js

# Start Expo frontend (web browser)
npx expo start --web
```

### Access Points

| Service | URL |
|---------|-----|
| Backend API | http://localhost:5000 |
| Expo Web App | http://localhost:8081 |
| Landing Page | http://localhost:5000 |

---

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users?id=X` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users?id=X` | Update user |
| DELETE | `/api/users?id=X` | Delete user |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filter by `?user_id=`) |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List expenses (filter by `?user_id=`) |
| GET | `/api/expenses/:id` | Get single expense |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Meals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meals` | List meals (filter by `?user_id=`) |
| GET | `/api/meals/:id` | Get single meal |
| POST | `/api/meals` | Create meal |
| DELETE | `/api/meals/:id` | Delete meal |

### Grocery
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grocery` | List items (filter by `?user_id=`) |
| POST | `/api/grocery` | Add item |
| PUT | `/api/grocery/:id` | Update item |
| DELETE | `/api/grocery/:id` | Delete item |

### Cleaning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cleaning` | List cleaning tasks (filter by `?user_id=`) |
| POST | `/api/cleaning` | Create cleaning task |
| DELETE | `/api/cleaning/:id` | Delete cleaning task |

### Emergency Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emergency` | List contacts (filter by `?user_id=`) |
| POST | `/api/emergency` | Add contact |
| DELETE | `/api/emergency/:id` | Delete contact |

### Water & Mood
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/water?user_id=X&date=YYYY-MM-DD` | Get water log |
| POST | `/api/water` | Save/update water log |
| GET | `/api/mood` | List mood entries (filter by `?user_id=`) |
| POST | `/api/mood` | Create mood entry |
| DELETE | `/api/mood/:id` | Delete mood entry |

### Contact & Newsletter
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| POST | `/api/newsletter` | Subscribe to newsletter |

### AI (Mock)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate-task` | AI task suggestions |
| POST | `/api/ai/suggest-meal` | AI meal suggestions |
| POST | `/api/ai/budget-tip` | AI budget advice |
| POST | `/api/ai/chat` | AI chat assistant |

---

## Data Models

### User
```json
{ "id": "uuid", "username": "string", "password": "hashed", "name": "string", "email": "string", "createdAt": "iso-date" }
```

### Task
```json
{ "id": "uuid", "userId": "uuid", "title": "string", "category": "office|home|kids|personal|health", "completed": false, "dueDate": "date", "dueTime": "time", "recurring": "none|daily|weekly|monthly", "priority": "low|medium|high", "createdAt": "iso-date", "completedAt": "iso-date|null" }
```

### Expense
```json
{ "id": "uuid", "userId": "uuid", "title": "string", "amount": 0, "category": "string", "type": "income|expense", "status": "completed|pending", "date": "date", "createdAt": "iso-date" }
```

### Meal
```json
{ "id": "uuid", "userId": "uuid", "day": "monday|tuesday|...", "mealType": "breakfast|lunch|dinner|snack", "name": "string", "ingredients": ["string"], "createdAt": "iso-date" }
```

### GroceryItem, CleaningTask, EmergencyContact, WaterLog, MoodEntry
Each follows the same UUID + userId + data fields pattern.

---

## Project Structure

```
LifeBloom/
├── app/                    # Expo Router pages
│   ├── (tabs)/             # Tab navigation screens
│   │   ├── index.tsx       # Home / Dashboard
│   │   ├── tasks.tsx       # Task list
│   │   ├── budget.tsx      # Budget & finance
│   │   ├── meals.tsx       # Meal planner & grocery
│   │   └── more.tsx        # More menu
│   ├── index.tsx           # Auth screen (login/register)
│   ├── safety.tsx          # Emergency SOS & contacts
│   ├── health.tsx          # Water & mood tracker
│   ├── home-manage.tsx     # Cleaning schedules
│   ├── pomodoro.tsx        # Focus timer
│   ├── ai-chat.tsx         # AI assistant
│   ├── add-task.tsx        # Add task form (sheet)
│   ├── add-expense.tsx     # Add expense form (sheet)
│   ├── add-meal.tsx        # Add meal form (sheet)
│   └── _layout.tsx         # Root layout
├── server_js/              # Node.js backend (active)
│   ├── index.js            # HTTP server + API routes
│   └── database.js         # JSON file persistence
├── server/                 # TypeScript Express backend (alt)
│   ├── index.ts            # Express server
│   ├── routes.ts           # API routes
│   ├── database.ts         # Database layer
│   ├── storage.ts          # Storage interface
│   └── templates/          # Landing page HTML
├── lib/                    # Frontend logic
│   ├── api.ts              # API service functions
│   ├── storage.ts          # Dual-mode storage
│   ├── query-client.ts     # React Query setup
│   ├── auth-context.tsx    # Authentication context
│   ├── ai.ts               # AI mutation hooks
│   └── responsive.ts       # Responsive utilities
├── components/             # Shared components
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   └── KeyboardAwareScrollViewCompat.tsx
├── constants/              # Design tokens
│   └── colors.ts
├── shared/                 # Shared schemas
│   └── schema.ts           # Drizzle ORM schema
├── data/                   # Runtime JSON storage (auto-created)
├── php/                    # PHP + MySQL backend (alt)
├── assets/images/          # App icons and images
├── .env                    # Environment variables
├── start.bat               # Windows launcher
├── start.ps1               # PowerShell launcher
├── package.json            # Dependencies & scripts
├── app.json                # Expo configuration
├── tsconfig.json           # TypeScript config
└── babel.config.js         # Babel config
```

---

## Configuration

### Environment (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_DOMAIN` | `localhost:5000` | Backend API URL |
| `DATABASE_URL` | (empty) | PostgreSQL URL for Drizzle ORM |

### Ports
| Port | Service |
|------|---------|
| 5000 | Node.js backend API |
| 8081 | Expo web dev server |

---

## Troubleshooting

### npm install fails
- Delete `node_modules` and `package-lock.json`, then retry
- Try: `npm install --legacy-peer-deps`
- Try: `npm install --registry https://registry.npmmirror.com`

### Backend won't start
- Ensure port 5000 is free, or kill the process: `taskkill /F /PID <PID>`
- Check firewall settings for port 5000

### Expo web not loading
- Ensure port 8081 is free
- Run directly: `npx expo start --web`

### Data not persisting
- Check `data/` directory exists and is writable
- JSON files are auto-created on first write; no manual setup needed

---

## Deployment

```bash
# Build for production (static web)
npx expo export --platform web

# Start production server
node server_js/index.js
```

---

## License

MIT
