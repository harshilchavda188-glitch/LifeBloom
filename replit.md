# LifeBloom - Women Daily Life Management App

## Overview
A comprehensive daily life management app for women built with Expo (React Native) and Express backend. Features task management, budget tracking (INR), meal planning, home management, safety features, health & wellness, and focus timer.

## Architecture
- **Frontend**: Expo Router with file-based routing, React Native
- **Backend**: Express server on port 5000 (API + landing page)
- **State**: AsyncStorage for local data persistence
- **Auth**: Local auth with SHA-256 hashed passwords stored in AsyncStorage
- **Fonts**: Nunito (Google Fonts)
- **Colors**: Warm rose/coral palette (#D4637A primary, #F4A261 accent)

## Key Features
1. **Authentication** - Login/Register with secure password hashing
2. **Dashboard** - Overview with stats, quick actions, budget summary
3. **Task Management** - Categories (Office/Home/Kids/Personal/Health), priority, recurring
4. **Budget & Finance** - Income/Expense tracking in INR, category analytics
5. **Meal Planner** - Weekly meal planning, grocery list generator
6. **Home Management** - Cleaning schedule with room-based tasks
7. **Safety** - SOS button, emergency contacts, call integration
8. **Health & Wellness** - Water intake tracker, mood tracker
9. **Focus Timer** - Pomodoro timer with session tracking

## Project Structure
- `app/` - Expo Router screens
- `app/(tabs)/` - Main tab screens (Home, Tasks, Budget, Meals, More)
- `app/` root - Auth screen, form sheets, feature screens
- `lib/` - Auth context, storage helpers, query client
- `constants/` - Colors theme
- `server/` - Express backend
- `shared/` - Shared schema

## User Preferences
- Currency: INR (Indian Rupees)
- Mobile-first design with Expo Go compatibility
