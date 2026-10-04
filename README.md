<div align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-v54-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Expo_Router-v6-black?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Router" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Design-Impeccable-4F46E5?style=for-the-badge" alt="Impeccable Design" />

  <h1>Flow Tasks — Modern Responsive Task Manager</h1>
  
  <p>
    <strong>A high-craft, fully responsive cross-platform CRUD task application built with React Native, Expo Router, and Impeccable Design.</strong>
  </p>
</div>

---

## 🌟 Overview

**Flow Tasks** is an Operate-mode task management application engineered for speed, visual clarity, and tactile responsiveness. Built on **React Native (v0.81)**, **Expo (v54)**, and **Expo Router (v6)**, it combines complete CRUD capabilities with local offline persistence, fluid animations, dynamic status bar adaptation, and dedicated dynamic routing for editing tasks.

The interface adheres to the **[Impeccable Design System](https://impeccable.style)**: free from AI anti-patterns, utilizing true vector typography and iconography, high-contrast semantic color tokens, and adaptive responsive layouts across mobile phones, tablets, and desktop browsers.

---

## ✨ Key Features

- 📝 **Full CRUD Operations**:
  - Add tasks with instant keyboard Enter submission (`returnKeyType="done"`).
  - Quick toggle completion via circular checkmark buttons with haptic feedback.
  - Dedicated dynamic edit route (`/edit/[id]`) to edit titles and toggle status in-place.
  - Deletion with non-destructive **Undo Toast** recovery.
- 🔍 **Real-Time Search**: Search through tasks with live filtering, instant clear buttons, and `/` or `Ctrl+K` desktop shortcut.
- 🏷️ **Segmented Status Filters**: Filter by **All**, **Pending**, or **Completed** with embedded dynamic item count badges.
- 📊 **Progress Tracker**: Visual progress card showing live task completion ratios and percentage track.
- 🌓 **Adaptive Theming**: Seamless dark and light modes with automatic system detection, persistent user storage, and synchronized `<StatusBar>`.
- 📱 **Fully Responsive Layout**:
  - **Phones**: Single-column thumb-friendly layout with $\ge 44 \times 44\text{ pt}$ touch targets. Fallback to stacked navigation for edit screens.
  - **Tablets & Desktop**: Auto-centered split-pane master-detail view (`maxWidth: 1200`), side-by-side controls bar, and pointer hover states. Allows opening task details side-by-side with the list.
- ⚡ **Desktop Shortcuts**:
  - `/` or `Ctrl+K`: Focus search bar.
  - `Ctrl+S` / `Cmd+S`: Save changes in the edit screen.
  - `Escape`: Clear search query or dismiss detail pane/navigate back.
- 📳 **Tactile Haptics**: Subtle, platform-safe haptic feedback for completions, additions, deletions, and saves.
- 💾 **Reliable Offline Persistence**: Saved securely using `@react-native-async-storage/async-storage`.
- 🌐 **Additional Pages**:
  - **About Us (`/about`)**: Beautifully designed responsive "About Us" page with interactive image grid placeholders.
  - **Contact (`/contact`)**: Quick and simple contact form route.

---

## 🛠️ Architecture & Tech Stack

```text
crud-app/
├── app/
│   ├── _layout.tsx          # Root layout with Stack, ThemeProvider & TodoProvider
│   ├── index.jsx            # Main responsive task list view (Search, Filters, Progress, Split View)
│   ├── about.jsx            # About Us page with responsive image grid
│   ├── contact.jsx          # Contact page 
│   └── edit/
│       └── [id].jsx         # Dynamic route edit screen for phones
├── components/
│   └── EditTaskPane.jsx     # Reusable task editor for split-pane and standalone routes
├── context/
│   ├── ThemeContext.js      # Persistent Dark/Light theme state
│   └── TodoContext.js       # Global Todo state with Undo recovery & AsyncStorage sync
├── constants/
│   └── theme.js             # Centralized design tokens (Indigo/Slate palette, shadows)
├── utils/
│   └── haptics.js           # Cross-platform safe haptic feedback utility
├── data/
│   └── todos.js             # Initial seed tasks
├── PRODUCT.md               # Impeccable product truth, audience, and capabilities
├── DESIGN.md                # Impeccable design system tokens and craft guidelines
└── .agents/skills/          # Impeccable skill suite and references
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher recommended
- **Package Manager**: npm or yarn
- **Expo Go App**: (Optional) for running on physical mobile devices

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Saidur289/crud-app.git
   cd crud-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   # Run on Web (Desktop / Mobile browser)
   npm run web

   # Or start universal Expo server
   npm start
   ```

4. **Run on devices:**
   - **Web**: Open [http://localhost:8081](http://localhost:8081) directly in your browser.
   - **Android**: Press `a` in the terminal to launch the Android emulator, or scan the terminal QR code in Expo Go.
   - **iOS**: Press `i` in the terminal to launch the iOS simulator, or scan the terminal QR code in Camera / Expo Go.

---

## 🎨 Design System & Quality Assurance

This project was refined and verified using the **Impeccable** design suite:
- **Lint Check**: `npm run lint` — 0 errors, 0 warnings.
- **Type Check**: `npx tsc --noEmit` — 0 errors.
- **Detector Check**: `npx impeccable detect app/index.jsx app/edit/[id].jsx` — 0 defects.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
