# BrainBridge - Accessible & Cooperative Memory Game

![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)

**BrainBridge** is an innovative memory game developed with a total focus on **web accessibility**, following **WCAG 2.1 AA** guidelines. The project offers two game modes (Individual and Cooperative) with 8 progressive difficulty levels, an authentication system, global rankings, and detailed statistics.

## Table of Contents

- [Key Features](#key-features)
- [Accessibility and WCAG Compliance](#accessibility-and-wcag-compliance)
- [Architecture and Technologies](#architecture-and-technologies)
- [Installation and Configuration](#installation-and-configuration)
- [How to Play](#how-to-play)

---

## Key Features

The system was designed to be inclusive and challenging, offering:

* **Individual Mode:** Overcome 8 levels with progressive difficulty.
* **Cooperative Mode:** Play with a partner on the same device, taking turns.
* **Progression System:** Automatic level unlocking based on performance.
* **Global Rankings:** Leaderboards separated by game mode.
* **Statistics:** Detailed monitoring of average score, best time, and total games played.

---

## Accessibility and WCAG Compliance

This project strictly adheres to WCAG 2.1 (Level AA) accessibility principles. The table below details the technical implementations:

| Principle | Technical Implementation | WCAG 2.1 Guideline |
| :--- | :--- | :--- |
| **1. Perceivable** | **Color Blind Mode & High Contrast** | Ensures information does not rely solely on color and maintains a contrast ratio greater than 4.5:1 (Criteria 1.4.1 and 1.4.3). |
| **2. Operable** | **Keyboard Navigation & Skip Links** | The entire game is playable without a mouse. "Skip Links" allow bypassing repetitive navigation (Criteria 2.1.1 and 2.4.1). |
| **3. Understandable** | **Labels & Error Feedback** | Forms feature clear labels and visible, explanatory error/success messages (Criteria 3.3.2). |
| **4. Robust** | **ARIA Labels & Semantic HTML** | Full compatibility with screen readers (NVDA, VoiceOver) using correct ARIA attributes (Criterion 4.1.2). |

---

## Architecture and Technologies

The project uses a modern architecture separated into Frontend and Backend:

### Frontend
* **React 18:** State management and reactive components.
* **Tailwind CSS:** Utility-first and responsive styling.
* **Babel:** JSX code transpilation.

### Backend
* **Node.js and Express:** RESTful API for data management.
* **JWT (JSON Web Tokens)::** Secure authentication and session management.
* **Bcrypt:** Password hashing.

### Database
* **Microsoft SQL Server:** Relational data storage.
* **MSSQL Driver:** Native connector for Node.js.

---

## Installation and Configuration

### Prerequisites
* Node.js (v18+)
* Microsoft SQL Server (2019+)
* Git

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone [https://github.com/Carolpm28/BrainBridge.git](https://github.com/Carolpm28/BrainBridge.git)
cd BrainBridge/BrainBridgev_final

# Install Backend dependencies
cd brainbridge-backend
npm install
```

### 2. Configure Database

Execute the SQL scripts in the order below to create the necessary structure:

```bash
# Create the Database
sqlcmd -S localhost -i create-database.sql

# Create Tables
sqlcmd -S localhost -d BrainBridge -i create-tables.sql

# (Optional) Add Statistics Table
sqlcmd -S localhost -d BrainBridge -i tabelastatistics.sql
```

### 3. Environment Variables

Create a `.env` file in the `brainbridge-backend` folder with the following settings:

```env
PORT=3000
DB_SERVER=localhost
DB_NAME=BrainBridge
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=define_a_secure_key_here
NODE_ENV=development
```

### 4. Run the Project

```bash
# Terminal 1: Start the Backend
cd brainbridge-backend
npm run dev

# Terminal 2: Serve the Frontend
# You can use any HTTP server or open index.html directly
npx http-server -p 8080
```

---

## How to Play

The goal is to find all pairs of matching cards. The difficulty increases with each level:

| Level | Name | Cards | Bonus | Time Limit |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Beginner | 12 | 500 | No Limit |
| **2** | Apprentice | 16 | 750 | No Limit |
| **3** | Intermediate | 20 | 1000 | No Limit |
| **4** | Advanced | 24 | 1500 | No Limit |
| **5** | Specialist | 24 | 2000 | 3 min |
| **6** | Master | 24 | 3000 | 2 min |
| **7** | Grandmaster | 24 | 5000 | 1.5 min |
| **8** | Legendary | 24 | 10000 | 1 min |

**Scoring System:**
* **+100 points** for each correct pair.
* **-10 points** for each error.
* **Time Bonus:** Awarded in levels 5 to 8 based on remaining time.

---

<div align="center">

**BrainBridge** © 2025 - Memory game developed following WCAG 2.1 AA guidelines.

[Back to top](#brainbridge---accessible--cooperative-memory-game)

</div>
