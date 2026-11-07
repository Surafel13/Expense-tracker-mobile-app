# 💰 Expense Tracker Mobile App

A modern, lightweight, and user-friendly mobile application built with **React Native, Expo, and TypeScript** to help users manage their personal finances, track daily expenses, monitor income, and understand their spending habits.

The application uses local storage to securely persist financial records directly on the device without requiring a backend server.

## 📱 Features

### Dashboard
- View total balance.
- Monitor total income and expenses.
- View recent transactions.
- Get a quick overview of financial activities.

### Transaction Management
- Add new income and expense transactions.
- Edit existing transactions.
- Delete transactions.
- Organize transactions using categories.
- View transaction history.
- Filter transactions by category and date.

### Financial Statistics
- View monthly income and expenses.
- Analyze spending patterns.
- Visualize financial activities using charts.
- Track financial progress over time.

### Account Management
- Manage different financial accounts.
- Track account balances.
- Organize financial activities by account.

### Personalization
- Light and dark themes.
- Persistent application settings.
- Clean and responsive mobile interface.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Mobile application development |
| Expo | Development and deployment |
| TypeScript | Type safety |
| AsyncStorage | Local data persistence |
| React Navigation | Application navigation |
| Context API | Global state management |
| Expo Vector Icons | Application icons |

## 📂 Project Structure

```text
expense-tracker/
│
├── assets/
│
├── src/
│   ├── components/
│   │
│   ├── screens/
│   │   ├── Dashboard.tsx
│   │   ├── AddTransaction.tsx
│   │   ├── Transactions.tsx
│   │   └── Stats.tsx
│   │
│   ├── navigation/
│   │
│   ├── context/
│   │   ├── ThemeContext.tsx
│   │   └── TransactionsContext.tsx
│   │
│   ├── storage/
│   │   ├── settings.ts
│   │   └── transactions.ts
│   │
│   ├── constants/
│   │
│   ├── types/
│   │
│   └── utils/
│
├── App.tsx
├── app.json
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Expo Go on your mobile device

### 1. Clone the Repository

```bash
git clone https://github.com/Surafel13/Expense-tracker-mobile-app.git
```

### 2. Navigate to the Project

```bash
cd Expense-tracker-mobile-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npx expo start
```

### 5. Run on Your Mobile Device

1. Install Expo Go on your Android or iOS device.
2. Connect your phone and computer to the same Wi-Fi network.
3. Scan the QR code displayed in your terminal.
4. Open the application using Expo Go.

## 💾 Data Persistence

The application uses **AsyncStorage** to store financial information locally on the device.

- Transactions remain available after restarting the application.
- Application settings are persisted locally.
- No external backend or database server is required.

## 🔒 Privacy

This application follows a local-first approach.

Financial records are stored on the user's device rather than being sent to an external backend server.

## 🎯 Project Goals

The main objectives of this project are to:

- Make personal financial management easier.
- Help users understand their spending habits.
- Provide a simple way to track income and expenses.
- Offer a clean and intuitive mobile experience.
- Demonstrate practical React Native and TypeScript development skills.

## 👨‍💻 Developer

**Surafel Tesfaye**

Software Engineering Student | Junior Full-Stack Developer | Mobile App Developer

- GitHub: [@Surafel13](https://github.com/Surafel13)

---

⭐ If you find this project interesting, consider giving it a star!
