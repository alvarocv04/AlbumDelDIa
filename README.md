<div align="center">

# 🎵 Album del Día 🎵

**Discover, listen, and share your musical journey—one album at a time.**

[Explore the App](https://albumdeldia.app) • [Report Bug](https://github.com/alvarocv04/AlbumDelDIa/issues) • [Request Feature](https://github.com/alvarocv04/AlbumDelDIa/issues)

</div>

---

## 🌟 Overview

**Album del Día** is a community-driven musical discovery platform that features a hand-picked "Album of the Day." It's designed for music lovers who want to expand their horizons beyond the charts, track their listening habits, and engage in meaningful discussions about music.

### ✨ Key Features

- 📅 **Daily Featured Album**: A new, curated album every single day to keep your recommendations fresh.
- 🎧 **Track-Level Tracking**: Don't just mark an album as "listened"—track individual songs and see your total listening time (minutes) accumulate.
- 💬 **Community Discussions**: Share your thoughts, ratings, and reviews in the comments section of each album.
- 👤 **Personalized Profiles**: Showcase your listening history, favorite albums, and stats to the community.
- 🌓 **Dynamic Theme**: A stunning dark/light mode toggle with smooth polygon clip-path transitions.
- 🌍 **Multi-language Support**: Fully localized in English and Spanish.
- 🛠️ **Admin Dashboard**: Comprehensive backoffice for managing the album database and featured rotation.
- ✨ **Coming Soon Countdown**: Real-time countdown for the official platform launch.

---

## 🚀 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Backend/Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Hosting, Performance)
- **API Integrations**: [Spotify Web API](https://developer.spotify.com/documentation/web-api/), [Google Gemini AI](https://ai.google.dev/)
- **Styling**: Vanilla CSS with custom design systems and CSS Variables
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alvarocv04/AlbumDelDIa.git
   cd AlbumDelDIa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📦 Deployment

The app is configured for **Firebase Hosting**. To deploy:

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

---

## 🤝 Contributing

Contributions are welcome! If you have a suggestion that would make this better, please fork the repo and create a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---


<p align="center">Developed by <a href="https://github.com/alvarocv04">alvarocv04</a></p>
