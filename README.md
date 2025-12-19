# 🚀 Daily Fitness - Fitness Tracker

A modern, glassmorphism-inspired Fitness Tracker web application built with **Cloudflare Workers**, **Durable Objects**, and **SQLite**. Track your daily workouts, monitor your progress over time, and compete on a global leaderboard!

![App Screenshot](C:/Users/Septian Ferry/.gemini/antigravity/brain/27b394f9-8eee-45f6-932b-5646726b8c70/todo_list_mobile_view_1766179407800.png)

## ✨ Features

-   **🎯 Multiple Workouts**: Track exercises like Vertical Leg Lift, Skipping (Reps), Forearm Plank, Side Plank, and Cobra Pose (Time-based).
-   **📊 Progress History**: Interactive calendar grid showing your completion percentage for each day.
-   **🏆 Global Leaderboard**: Real-time leaderboard using WebSockets and Durable Objects to see how you rank against others.
-   **📈 Comprehensive Statistics**: Track your day streak, weekly average, and monthly completion rates.
-   **🎨 Glassmorphism UI**: Beautiful, responsive, and neon-inspired design using CSS variables and modern typography.
-   **📅 Date Navigation**: Easily switch between dates to view past progress or plan future workouts.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, Vanilla CSS (Glassmorphism), Vanilla JavaScript.
-   **Backend**: [Cloudflare Workers](https://workers.cloudflare.com/) (Serverless).
-   **Database/Storage**: [Cloudflare Durable Objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/) with SQLite for real-time leaderboard data.
-   **Real-time Communication**: WebSockets for live leaderboard updates.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) installed.
-   Cloudflare account and [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) configured.

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/fitness-todo-list.git
    cd fitness-todo-list
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run locally**:
    ```bash
    npx wrangler dev
    ```

### Deployment

To deploy the application to Cloudflare Workers:

```bash
npm run deploy
```

## 📂 Project Structure

-   `src/index.html`: Main frontend file containing structure, styles, and client-side logic.
-   `src/worker.js`: Cloudflare Worker entry point handling API routing and static file serving.
-   `src/LeaderboardDO.js`: Durable Object implementation for real-time leaderboard management and persistence.
-   `wrangler.toml`: Configuration for Cloudflare Worker and Durable Objects.

## 📝 License

This project is licensed under the **ISC License**.
