# AGENTS.md

EduManage school management system. Two independent npm apps: `backend/` (Express/MySQL) and `frontend/` (React/Vite). No root manifest; run commands inside each app.

## Current state
- Backend is an empty scaffold: every file under `backend/src/` and `backend/database/` is 0 bytes. `npm start`/`npm run dev` launch the empty `src/server.js`; there is no API, schema, seed, auth, or tests. Do not assume the controller/model/route layout is implemented.
- Frontend is the only working app, but 82 files under `src/` are empty placeholders (e.g. `src/context/AuthContext.jsx`, `src/services/api.js`, `src/hooks/useAuth.js`, all of `src/pages/principal/`). Many are not imported. Check a file's size before relying on it.
- Git root is `E:\evangadi\E.PROJECT`, which holds many unrelated projects; `school-management-system/` is untracked. Stage only paths under this directory, never the whole workspace.

## Commands (from app dir)
Frontend:
- `npm run dev` — Vite dev server (default :5173)
- `npm run build` — works; emits a ~1.3 MB bundle warning
- `npm run lint` — currently fails on a pre-existing `no-unused-vars` in `src/pages/parent/ParentResults.jsx:173` (plus one `exhaustive-deps` warning). Not caused by new changes.
- No test script or test framework.

Backend:
- `npm run dev` / `npm start` — no-op because `src/server.js` is empty.
- `npm test` — stub that exits 1.
- `.env` exists and is gitignored; `.env.example` is empty. Never expose or commit `.env`.

## Routing / architecture
- `src/main.jsx` mounts `src/App.jsx` (`BrowserRouter`). Routes: `/`, `/login`, `/signup`, `/registrar/*` → `RegistrarRolePage`, and `/:role/*` → `MainLayout` + `RolePage`.
- `RolePage` dispatches on URL segments with manual `if` chains, not per-page `<Route>`s. To add a normal role page, import it and add a `role`/`page` branch there, then add a `menus` entry in `src/components/Sidebar.jsx`.
- Registrar uses a separate manual switch in `src/pages/registrar/RegistrarRolePage.jsx` and its own `RegistrarLayout`; add registrar pages there.
- `/admin/*` renders `AdminSidebar` (selected in `src/layouts/MainLayout.jsx`). Several sidebar links (staff, parents, academic-years, school-information, database-backup, logs, attendance, examinations, finance, announcements, profile) have no `RolePage` branch and fall through to the generic "will be developed" placeholder.
- `src/pages/principal/*` is not wired into routing at all.
- Auth is not wired: only `src/pages/auth/Login.jsx` writes `token`/`user` to localStorage/sessionStorage; `AuthContext`/`useAuth` are empty and no route guards exist.
- Most UI data is static/mock/local. Registrar flows persist to localStorage (e.g. `src/utils/registrar/parentStorage.js`, key `sms_parents`). Only `Login.jsx` calls an API: POST `${VITE_API_URL || "http://localhost:5000/api"}/auth/login` with `{email,password,role}`, expecting `{token,user}`. `VITE_API_URL` is unset by default.

## Conventions
- Frontend: React 19, Vite 8, React Router 7, JSX only (no TypeScript). Bootstrap/Bootstrap Icons are imported in `src/main.jsx`; lucide-react and framer-motion are used in marketing/auth/registrar UI.
- Backend: Express 5, CommonJS (`"type": "commonjs"`), mysql2, bcryptjs, JWT.
- CSS placement differs by role: admin and registrar use `src/styles/<role>/*.css`; teacher, student, parent, accountant, and librarian keep `.css` files next to their pages. Follow the existing pattern for the role being edited.
- No CI, formatter, pre-commit, or OpenCode config exists. ESLint (`frontend/eslint.config.js`) is the only linter.
