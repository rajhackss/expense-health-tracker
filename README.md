# LifeSync

LifeSync is a comprehensive personal management dashboard designed to help you synchronize your life. It combines expense tracking and health monitoring in a single, beautiful, and intuitive interface.

## 🚀 Features

### 💰 Expense Tracker
- **Track Expenses:** Easily add, edit, and delete daily expenses.
- **Categorization:** Organize spending with intuitive categories (Food, Transport, Bills, etc.).
- **Visual Insights:** View monthly totals and spending breakdowns (future enhancement).
- **Budgeting:** Set and manage your monthly budget.
- **Salary Tracking:** Record your income to monitor savings.

### ❤️ Health Monitor
- **Daily Logs:** Track essential metrics like water intake, sleep duration, and steps.
- **Workout Log:** Record various workout types (Running, Gym, Yoga, etc.) with automatic calorie estimation.
- **Goals:** Set personalized health goals for water, sleep, steps, and weight.
- **Trends:** Monitor your progress over time.

### 🔐 Secure & Private
- **Google Authentication:** Secure and easy login.
- **Data Isolation:** Your data is stored securely in the cloud and isolated to your account.
- **Local Settings:** Personalized settings (Budget, Goals) are saved locally for your convenience.

### 🎨 Modern UI/UX
- **Responsive Design:** Works seamlessly on desktop and mobile.
- **Dark Mode:** Easy on the eyes with a built-in dark theme.
- **Interactive Dashboard:** Get a quick overview of your day at a glance.

## 🛠️ Tech Stack

- **Frontend:** [React](https://reactjs.org/) (Vite)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Date Handling:** [date-fns](https://date-fns.org/)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **Charts:** [Chart.js](https://www.chartjs.org/) (via react-chartjs-2)

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/lifesync.git
    cd lifesync
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Firebase:**
    - Create a project in the [Firebase Console](https://console.firebase.google.com/).
    - **CRITICAL:** When enabling Cloud Firestore, select **Native Mode** (or **Start in Production Mode**). Do **NOT** select "Datastore Mode".
    - Enable **Authentication** (Google Sign-in).
    - Enable **Cloud Firestore** and set up security rules.
    - Create a `firebase.js` file in `src/` (or use the existing one) with your config:
      ```javascript
      // src/firebase.js
      import { initializeApp } from "firebase/app";
      import { getAuth, GoogleAuthProvider } from "firebase/auth";
      import { getFirestore } from "firebase/firestore";

      const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
      };

      const app = initializeApp(firebaseConfig);
      export const auth = getAuth(app);
      export const googleProvider = new GoogleAuthProvider();
      export const db = getFirestore(app);
      ```

    ```

4.  **Security Rules:**
    Copy the contents of `firestore.rules` to your Firebase Console > Firestore > Rules tab to ensure your data is secure and writes are allowed.

    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        
        // Users
        match /users/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }

        // Expenses
        match /expenses/{expenseId} {
          allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
          allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
        }
        
        // Health Logs
        match /healthLogs/{logId} {
          allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
          allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
        }

        // Workouts
        match /workouts/{workoutId} {
          allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
          allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
        }
      }
    }
    ```

5.  **Run the application:**
    ```bash
    npm run dev
    ```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
