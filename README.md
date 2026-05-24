# 🧠 StickyFlow AI: The Ultimate Productivity Workspace & Fluid Sticky Notes

StickyFlow AI is a high-fidelity, production-grade productivity dashboard engineered with a responsive, glassmorphic layout. It bridges fast local interactions with real-time Firebase syncing, and features an integrated NVIDIA AI assistant to analyze, query, and organize your tasks.

---

## ⚡ Stunning Premium Features

### 1. 🤖 Nvidia AI Chatbot Integration
- **Context-Aware Analytics**: Scans your entire active sticky notes directory instantly.
- **Natural Language Querying**: Talk to your notes, ask for dynamic summaries, search task deadlines, or ask for planning suggestions.
- **Offline / Setup Safe**: Alerts you cleanly if the API key is missing.

### 2. 📈 Interactive Heatmaps & Chronological Timelines
- **Activity Heatmap**: A GitHub-style contribution grid displaying daily note modifications, creation rates, and update density.
- **Chronological Timeline**: Keeps a full audit log of your actions (creations, archives, updates, pin/unpin toggles) for easy visual reviews.

### 3. 🗓️ Visual Calendar Grid
- Visualize deadlines, reminders, and created flows in an elegant month navigator layout.
- Fast day-selection filters to show daily checklists, subtasks, and note cards.

### 4. 🗂️ Drag-and-Drop Kanban Board
- Multi-stage productivity lane layout ("To Do", "In Progress", "Done").
- Smooth, drag-and-drop cards with quick-edit trigger handles.

### 5. ⏲️ Custom Focus Pomodoro & Notifications
- Elegant circular progress countdown timer with sound controls.
- Toast notifications and system alerts that preserve focus sessions when switching view pages.

### 6. ⚡ Power-User Keyboard Shortcuts
Quickly navigate, search, and manage your flows without lifting your hands from the keyboard:
- `Cmd / Ctrl + K` — Opens the **Global Command Menu**
- `N` — Instantly creates a **New Flow**
- `F` — Focuses the **Search input**
- `P` — Opens the **Pomodoro Focus Timer**
- `K` — Swaps to **Kanban Board** view
- `C` — Swaps to **Calendar** view

### 7. 📄 Rich Templates & Text Editing
- **Interactive Tiptap Editor**: Native support for headings, lists, inline code, bold/italics, and inline checklists.
- **Media Attachments**: Drag and drop or upload image attachments directly into note details.
- **Preset Templates**: Instantly spin up a Daily Standup flow, Weekly Plan flow, Brainstorming canvas, or Meeting Minutes template.

---

## 💻 Tech Stack & Architecture

- **React 19 & TypeScript**: Zero type warnings, clean compiler configuration.
- **Vite & TailwindCSS**: Optimized CSS pipelines, lightning-fast rendering.
- **Framer Motion**: Micro-animations and layout shifts.
- **Firestore & Firebase Auth**: High-availability data pipelines with off-line local cache caching fallback.
- **Recharts**: Data-driven, fully responsive productivity curves.

---

## 🚀 Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/PratikHarkare06/StickyFlow-AI.git
cd StickyFlow-AI
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root workspace folder:
```env
# Firebase API Credentials
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"

# Nvidia Chat Completion API Key
VITE_NVIDIA_API_KEY="your-nvidia-api-key"
```

### 3. Start Development Server
```bash
npm run dev
```
Runs the Vite hot-reloading server on `http://localhost:8000`.

### 4. Build & Production Check
Ensure everything is fully compiled and linted with zero errors:
```bash
# Verify TypeScript safety checks
npm run lint

# Build optimized production bundle
npm run build
```

---

## 🌐 Netlify Deployment & Hosting Guide

When deploying your StickyFlow AI hub to Netlify, keep in mind that `.env.local` is gitignored and is not uploaded. To prevent the Firebase `auth/invalid-api-key` error and keep the app functional:

1. **Configure Environment Variables in Netlify**:
   - Go to your Netlify dashboard: **Site configuration > Environment variables**.
   - Click **Add a variable** and configure the following variables exactly as defined in your local `.env.local`:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_NVIDIA_API_KEY`
2. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. **PWA Assets**:
   - High-fidelity icons (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, and `favicon.ico`) are located in the `public/` directory and are automatically compiled and cached for progressive offline capabilities upon building.

---

## 📐 Layout Padding & Visual Standards
To clear the floating top-right workspace status bar (sync indicators, Auth badges, focus widgets), all headers implement the standard class:
`lg:pr-[360px]`
This guarantees a clean spacing wrapper with **zero overlapping elements** on large monitors, widescreen viewports, and mobile transitions.
