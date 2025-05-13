# Kata App

A React Native mobile application for sharing and preserving local language contributions—audio recordings, text posts, and more. Built with Expo, Expo Router, Firebase, and NativeWind (Tailwind CSS for React Native).

---

## 📱 Features

* **User Authentication** (Firebase Auth)  
    
* **Browse & Search** audio/text contributions  
    
* **Create New Contribution**  
    
  * 🎤 Upload or record audio  
  * 📝 Post text  
  * Add title, language, location, notes


* **Profile Page** with user stats (audio count, text count, likes)  
    
* **Like** and **view details** of contributions  
    
* **Notifications** (Firebase Cloud Messaging)  
    
* **Dark & Light** theme support via system color scheme

---

## 🛠 Tech Stack

* **Framework**: [Expo](https://expo.dev/) & [Expo Router](https://expo.github.io/router/)  
    
* **UI**: React Native \+ [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for RN)  
    
* **State & Navigation**: Expo Router, React Context (AuthContext)  
    
* **Audio**: `expo-av`, `expo-document-picker`  
    
* **Backend**: Firebase  
    
  * **Auth** (Google sign-in)  
  * **Firestore** (contributions, user profiles, likes)  
  * **Storage** (uploaded audio files)  
  * **Cloud Messaging** (push notifications)


* **Utility**: `tailwind-merge`, `@react-native-picker/picker`

---

## 🚀 Quick Start

1. **Clone the repo**  
     
   git clone https://github.com/yasseralff/kata-app1.git  
     
   cd kata-app1  
     
2. **Install dependencies**  
     
   npm install  
     
   \# or  
     
   yarn install  
     
3. **Configure environment** Copy `.env.example` to `.env` (or create a new `.env` in the project root) and fill in your Firebase credentials:  
     
   FIREBASE\_API\_KEY=YOUR\_FIREBASE\_API\_KEY  
     
   FIREBASE\_AUTH\_DOMAIN=YOUR\_PROJECT.firebaseapp.com  
     
   FIREBASE\_PROJECT\_ID=YOUR\_PROJECT\_ID  
     
   FIREBASE\_STORAGE\_BUCKET=YOUR\_PROJECT.appspot.com  
     
   FIREBASE\_MESSAGING\_SENDER\_ID=YOUR\_SENDER\_ID  
     
   FIREBASE\_APP\_ID=YOUR\_APP\_ID  
     
   FIREBASE\_MEASUREMENT\_ID=YOUR\_MEASUREMENT\_ID  
     
4. **Run the app**  
     
   npx expo start  
     
   * Scan the QR code with Expo Go (iOS/Android)  
   * Or press `i` / `a` to launch in simulator/emulator

---

## 📂 Project Structure

kata-app1/

├── app/                   \# Expo-Router pages & layouts

│   ├── (tabs)/            \# Bottom-tab screens

│   ├── detail/\[id\].jsx    \# Contribution detail screen

│   └── menu.jsx           \# Log-out menu

├── assets/                \# Images, fonts, etc.

├── components/            \# Reusable UI components

├── constants/             \# App-wide constants

├── context/               \# React Contexts (AuthContext, etc.)

├── hooks/                 \# Custom hooks

├── services/              \# Firebase & external API services

├── utils/                 \# Utility functions

├── .env                   \# Environment variables (not committed)

├── app.json               \# Expo configuration

├── babel.config.js

├── metro.config.js

├── tailwind.config.js

├── global.css             \# (if using web)

├── package.json

└── README.md              \# ← You are here

---

## 📋 Available Scripts

* `npm start` / `expo start`  
* `npm run android` / `expo run:android`  
* `npm run ios` / `expo run:ios`  
* `npm run web`

And all the usual Expo-CLI commands.

---

## 🤝 Contributing

1. Fork it ([https://github.com/yasseralff/kata-app1/fork](https://github.com/yasseralff/kata-app1/fork))  
2. Create your feature branch (`git checkout -b feature/foo`)  
3. Commit your changes (`git commit -m "feat: add foo"`)  
4. Push to the branch (`git push origin feature/foo`)  
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](http://LICENSE).

---

Built with ❤️ by Yasser, Kahfi & Zaki for the Kata community.  
