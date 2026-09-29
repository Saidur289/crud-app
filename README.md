<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />

  <h1>🚀 React Native Task Manager</h1>
  
  <p>
    <strong>A beautifully designed, fully functional CRUD application built with React Native and Expo.</strong>
  </p>
</div>

---

## 🌟 Overview

The **React Native Task Manager** is a modern, cross-platform mobile application designed to keep track of your daily tasks. Built using **React Native** and **Expo**, it demonstrates complete Create, Read, Update, and Delete (CRUD) operations, persistent local storage, and an elegant user interface enhanced with smooth animations.

## ✨ Key Features

- 📝 **Full CRUD Operations**: Easily add, view, update, and delete your tasks.
- 💾 **Local Data Persistence**: Tasks are securely stored on your device using `@react-native-async-storage/async-storage`. Your data remains intact even after closing the app.
- 🌓 **Dark & Light Mode Support**: A built-in theme toggle dynamically switches between light and dark modes, ensuring a comfortable viewing experience anywhere.
- 🎨 **Fluid Animations**: Interactive UI components animated by `react-native-reanimated` make the app feel alive and responsive.
- 🔔 **Toast Notifications**: Provides instant user feedback when tasks are added, updated, or removed.

---

## 🛠️ Tech Stack

- **Core**: [React Native](https://reactnative.dev/)
- **Framework**: [Expo (Expo Router)](https://expo.dev/)
- **Storage**: [`@react-native-async-storage/async-storage`](https://react-native-async-storage.github.io/async-storage/)
- **Animations**: [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI (or use `npx expo`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Saidur289/crud-app.git
   cd crud-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on your device:**
   - Scan the QR code displayed in the terminal using the **Expo Go** app on your iOS or Android device.
   - Press `a` in the terminal to run on an Android emulator.
   - Press `i` in the terminal to run on an iOS simulator.

---

## 📱 How to Use

- **Add a Task**: Type your task into the input field at the top and press the **Add** button.
- **Complete/Undo**: Tap the **Done** button to mark a task as completed. Tap **Undo** to revert it.
- **Edit a Task**: Tap the **Update** button next to a task to modify its title via a dedicated modal.
- **Delete a Task**: Tap the **Delete** button to permanently remove the task from your list.
- **Toggle Theme**: Use the **☀️/🌙** icon in the top right corner to switch between light and dark mode.

---

## 🤝 Contributing

Contributions, issues, and feature requests are highly welcome! 

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
