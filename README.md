# LifeFlow — Personal Life Manager Dashboard

A full-stack MERN app (MongoDB, Express, React, Node) for managing tasks, habits,
expenses, notes, and reminders in one place.

## Folder structure

```
lifeflow/
├── backend/          # Express + MongoDB REST API
│   ├── config/       # db connection
│   ├── models/       # Mongoose schemas (User, Task, Habit, Expense, Note, Reminder)
│   ├── middleware/    # JWT auth guard, error handler
│   ├── routes/        # auth, tasks, habits, expenses, notes, reminders, dashboard, users
│   └── server.js
└── frontend/          # React (Vite) + Tailwind CSS
    └── src/
        ├── api/        # axios instance with auth interceptor
        ├── context/     # AuthContext, ThemeContext
        ├── components/  # Layout (Sidebar/Topbar), Common (Card/Modal/ProtectedRoute)
        └── pages/        # Login, Signup, Dashboard, Tasks, Habits, Expenses, Notes,
                           # Reminders, CalendarView, Settings
```

## Prerequisites

- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lifeflow      # or your Atlas connection string
JWT_SECRET=some_long_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Run it:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API will run at `http://localhost:5000`, with a health check at `/api/health`.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Vite is already configured to proxy
`/api/*` requests to `http://localhost:5000`, so no CORS config is needed in dev.

## 3. Using the app

1. Open `http://localhost:5173`, click **Sign up**, create an account.
2. You'll land on the Dashboard — empty at first. Add a task, a habit, an
   expense, a note, and a reminder from their respective pages.
3. Check in on a habit daily to build a streak. The dashboard's "habit streak
   risk" insight will warn you if a streak is about to break.
4. Use the Expenses page to log income/expenses — the pie/bar charts and
   monthly summary update automatically. Export to CSV any time.
5. The Calendar page pulls together task due dates and reminders into a
   month view.
6. Settings lets you switch theme (also toggleable from the topbar), update
   your name, reminder preferences, and password.

## API overview

All routes except `/api/auth/signup` and `/api/auth/login` require a Bearer
token (`Authorization: Bearer <token>`), obtained on signup/login.

| Method | Route                        | Description                          |
|--------|------------------------------|---------------------------------------|
| POST   | /api/auth/signup             | Create account                        |
| POST   | /api/auth/login              | Login                                 |
| GET    | /api/auth/me                 | Current user                          |
| POST   | /api/auth/logout              | Logout (client discards token)        |
| GET/POST/PUT/DELETE | /api/tasks       | Task CRUD (+ `?status=&priority=&search=`) |
| GET/POST/PUT/DELETE | /api/habits      | Habit CRUD                            |
| POST   | /api/habits/:id/checkin        | Toggle today's check-in, recalculates streak |
| GET/POST/PUT/DELETE | /api/expenses    | Expense CRUD (+ `?month=YYYY-MM`)     |
| GET    | /api/expenses/summary          | Monthly totals + category breakdown   |
| GET    | /api/expenses/export/csv       | Download all expenses as CSV          |
| GET/POST/PUT/DELETE | /api/notes       | Note CRUD (+ `?search=&tag=`)         |
| PATCH  | /api/notes/:id/pin              | Toggle pin                            |
| GET/POST/PUT/DELETE | /api/reminders    | Reminder CRUD                         |
| PATCH  | /api/reminders/:id/complete       | Mark done (rolls date forward if recurring) |
| GET    | /api/dashboard                    | Aggregated dashboard payload + insights |
| PUT    | /api/users/me                      | Update profile/theme/reminder prefs   |
| PUT    | /api/users/me/password              | Change password                       |

## Deployment notes

- **Backend**: deploy to Render/Railway/Fly.io. Set the same env vars as
  `.env.example`, pointing `MONGO_URI` at your Atlas cluster and `CLIENT_URL`
  at your deployed frontend origin (for CORS).
- **Frontend**: `npm run build` produces a static `dist/` folder — deploy to
  Vercel/Netlify. Set an env var or update `vite.config.js`'s proxy target
  to point at your deployed backend URL (or just call the full backend URL
  directly from `src/api/axios.js` in production).
- Use MongoDB Atlas's free tier for a zero-cost production database.

## What's scaffolded vs. what's an extension point

Fully implemented: auth, protected routes, tasks, habits with real streak
calculation, expenses with aggregation + charts + CSV export, notes, reminders
with recurrence, calendar view, dashboard with smart insights, dark mode,
responsive sidebar/topbar, settings/profile.

Left as extension points (schema/structure is ready, but not wired end-to-end):
- **Real-time updates**: add Socket.io on the server and emit on task/habit/
  reminder changes; subscribe in a small `useSocket` hook on the client.
- **Email notifications**: wire `nodemailer` in `routes/reminders.js` (or a
  `node-cron` job in `server.js`) using each user's `reminderPrefs.email`.
- **File attachments**: `Note.attachments` and `Expense.attachment` fields
  already exist — add `multer` middleware and an `/uploads` static route to
  actually accept files.
- **PDF export**: CSV export is implemented; PDF can be added with a library
  like `pdfkit` following the same pattern as the CSV route.
- **Household/team sharing**: `User.householdId` and `role` fields exist —
  add an invite endpoint and scope queries by `householdId` instead of just
  `user` to enable shared views.
