# 🧠 StickyFlow AI: The Ultimate Productivity Workspace & Fluid Sticky Notes

StickyFlow AI is a high-performance, glassmorphic productivity hub built on React, Vite, and TailwindCSS. It brings smooth animations, dynamic layout alignments, real-time Firestore sync, and direct NVIDIA AI context-aware assistant features to your fingertips.

---

## ⚡ Stunning Premium Features

### 1. 🤖 Context-Aware AI Chatbot
- Powered by Nvidia LLMs (`minimaxai/minimax-m2.7`).
- Seamlessly scans, reads, and understands your entire directory of sticky notes.
- Instant, context-rich Q&A to search, categorize, and extract insights from your tasks.

### 2. 📈 Immersive Analytics & Productivity Insights
- **KPI Metrics Tracker**: Streamlines active metrics such as total flows, completion rates, daily streaks, and average note length.
- **Visual Trends**: Beautiful interactive Area charts and Category breakdown charts powered by Recharts.
- **Peak Hour Analysis**: Tells you exactly when you are most productive during the day.

### 3. 🗓️ Visual Calendar Grid
- Fully interactive visual month calendar view.
- Pins specific notes and deadlines directly to calendar days with category-specific color indicators.
- Quick panels displaying events and notes for any selected date.

### 4. 🗂️ Drag-and-Drop Kanban Board
- Organized multi-stage task board ("To Do", "In Progress", "Done").
- Smooth, physics-based reordering and status transfers powered by standard drag handles.

### 5. ⏲️ Glassmorphic Focus Pomodoro
- Interactive custom-session countdown widget.
- Sound notifications and visual indicators to maintain state during active deep-work flows.

### 6. 🛠️ Pro-Grade Note Formatting & Operations
- **Rich Text Editing**: Powered by Tiptap Editor for styling, checklists, and visual structures.
- **Bulk Actions**: Select, delete, archive, or complete multiple notes at once.
- **Recurrence & Reminders**: Configurable repeat triggers (Daily, Weekly, Monthly) and precise reminders.
- **Self-Healing Trash**: Keeps deleted notes safe for 30 days before automatic purge, with simple restore buttons.

---

## 💻 Modern Technology Stack

- **Core Framework**: React 19 & TypeScript (strict compilation).
- **Build Tool**: Vite (blazing fast hot-reloads).
- **Styling**: TailwindCSS & Lucide React for consistent icons.
- **Animation System**: Framer Motion / Motion for premium transitions.
- **Data Visualizations**: Recharts.
- **Database / Authentication**: Firebase Firestore and Firebase Auth (offline-first sync).

---

## 🚀 Getting Started & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/PratikHarkare06/StickyFlow-AI.git
cd StickyFlow-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a file named `.env.local` in the root directory and add your keys:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"

# Nvidia AI API Key
VITE_NVIDIA_API_KEY="your-nvapi-key"
```

### 4. Spin Up the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:8000`.

### 5. Production Build & Linting
Ensure type-safety and bundle size are optimal before deployment:
```bash
# Run TypeScript compilation check
npm run lint

# Build production bundle
npm run build
```

---

## 🎨 Layout Alignment & Responsive Polish
All primary page views implement a fluid grid layout wrapper alongside custom responsive sidebars. Page headers are configured with `lg:pr-[360px]` to guarantee zero visual collisions with the floating top-right status badges on large monitor viewports.

---

## 📜 License
This project is licensed under the MIT License.
