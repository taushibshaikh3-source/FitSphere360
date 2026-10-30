# FitSphere 360 – Smart Gym Management and Recommendation System

A modern, full-stack fitness ecosystem engineered as a college engineering mini-project. **FitSphere 360** combines commercial gym management, verified trainer bookings, interactive health tools, and a rule-based AI recommendation engine.

---

## 1. Project Overview & Aesthetics
- **Design Theme**: Sleek Dark Theme (`#07090D`, `#0D121A`, `#151B26`) with Electric Lime Green accent (`#B8FF00`), Cyan (`#00F0FF`), and Sunset Orange (`#FF6B35`).
- **Typography**: Google Fonts (*Outfit* for high-impact athletic headings, *Plus Jakarta Sans* for clean body UI).
- **Responsive**: Fully responsive across mobile smartphones, tablets, and wide desktop displays.
- **Academic Focus**: Built with clean, beginner-friendly architecture suitable for college demonstrations and viva examinations.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Python Flask 3.1+ | RESTful APIs, Session Management, Role Authorization Guards |
| **Security** | Werkzeug | Secure SHA-256 Password Hashing |
| **Database** | SQLite 3 (`fitsphere360.db`) | Relational schema with Foreign Keys; easily migrates to PostgreSQL |
| **Frontend** | React 18 & Vite.js | Modern Single-Page Application (SPA) with modular components |
| **Styling** | Vanilla CSS3 | Custom design system with glassmorphism, glowing micro-animations, and CSS variables |
| **Icons** | Lucide React | High-resolution SVG icons |

---

## 3. User Roles & Demo Credentials

FitSphere 360 features three distinct user roles with protected routes and role-specific dashboards. Pre-seeded demonstration accounts are available for instant testing during viva:

| Role | Demo Email | Password | Access Level & Capabilities |
|---|---|---|---|
| **Trainee** | `trainee@fitsphere360.com` | `trainee123` | Gym discovery, filter/compare gyms, 1-click plan selection, trainer booking, BMI calculator, AI recommendations, reviews |
| **Gym Owner** | `owner@fitsphere360.com` | `owner123` | Add/edit gyms, revenue trend analytics, manage membership plans, view trainee enrollees in Member Intelligence Panel |
| **Trainer** | `trainer@fitsphere360.com` | `trainer123` | Dedicated coach dashboard, view booking requests, 1-click accept/reject, manage hourly rate & weekly schedule |

> **Standard Authentication**: Users log in using their registered email address and password via the Login page.

---

## 4. Key Features Implemented

### Trainee Capabilities
1. **Gym Discovery & Filtering**: Search gyms by keyword, location/city, price slider (₹500–₹10,000/mo), minimum rating, and fitness discipline.
2. **Side-by-Side Gym Comparison**: Select 2 or 3 gyms to compare pricing, hours, crowd density, and safety features in an interactive comparison modal.
3. **Membership Plan Selection**: View membership plans (Standard, Pro Athlete, VIP) and perform 1-click simulated enrollment. Active passes display in the Trainee Dashboard.
4. **Certified Trainer Booking**: Browse master coaches, inspect weekly availability schedules, and submit booking requests with custom session goals.
5. **Interactive BMI & Calorie Calculator**: Accepts Metric (cm/kg) and Imperial (ft-in/lbs). Visual score gauge, WHO classification, ideal weight range, target maintenance calories, and training suggestions.
6. **Smart AI Gym Recommendation Engine**: Rule-based algorithm that evaluates user budget, campus area, fitness goal, trainer need, and women's safety preference to calculate percentage compatibility matches.
7. **Workout Library & Equipment Directory**: Step-by-step training protocols (Hypertrophy, Boxing, Mobility, Calisthenics) and equipment directory with biomechanical muscle guidance.
8. **Gym Reviews & Ratings**: Submit star ratings (1-5) and testimonials that recalculate facility averages permanently in SQLite.

### Gym Owner Capabilities
1. **Commercial Analytics Overview**: 12-month revenue trend line visual, quarterly member growth target gauge (71.5% achieved), active member counts, and floor capacity indicators.
2. **Gym Facility CRUD**: Add new gym locations, update opening/closing hours, descriptions, pricing, and contact numbers.
3. **Membership Plans Manager**: Create, edit, and delete pricing plans with custom feature tags.
4. **Member Intelligence Panel**: Real-time table of enrolled trainees with contact info, start date, expiration date, and active subscription status.
5. **Women's Safety Configuration**: Manage facility safety certifications and female-only zones.

### Certified Trainer Capabilities
1. **Booking Requests Manager**: Inspect incoming trainee requests and click **Accept Session** or **Decline**.
2. **Confirmed Sessions Schedule**: Roster of upcoming training appointments with trainee contact details.
3. **Coach Profile Customization**: Update coaching experience years, specializations, qualifications, hourly billing rate, and weekly availability slots.

---

## 5. Database Schema & Architecture

The database is powered by SQLite (`fitsphere360.db`) with `PRAGMA foreign_keys = ON`:

```
               +------------------+
               |      USERS       |
               +------------------+
               | id (PK)          |
               | name, email      |
               | password_hash    |
               | role (enum)      |
               +--------+---------+
                        |
       +----------------+----------------+
       | 1:N                             | 1:N
+------v-----------+             +-------v----------+
|      GYMS        |             |     TRAINERS     |
+------------------+             +------------------+
| id (PK)          |             | id (PK)          |
| owner_id (FK)    |             | user_id (FK)     |
| name, address    |             | gym_id (FK)      |
| price_range      |             | hourly_rate      |
| crowd_level      |             | availability     |
+--------+---------+             +--------+---------+
         | 1:N                            | 1:N
+--------v-----------+           +--------v------------+
|  MEMBERSHIP_PLANS  |           |   TRAINER_BOOKINGS  |
+--------------------+           +---------------------+
| id (PK)            |           | id (PK)             |
| gym_id (FK)        |           | trainer_id (FK)     |
| name, price        |           | trainee_id (FK)     |
| duration, features |           | date, slot, status  |
+--------+-----------+           +---------------------+
         | 1:N
+--------v------------------+
|  MEMBERSHIP_SELECTIONS    |
+---------------------------+
| id (PK)                   |
| user_id (FK)              |
| plan_id (FK), gym_id (FK) |
| start_date, expiry_date   |
+---------------------------+
```

---

## 6. How to Run the Project Locally

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ and npm (Optional if running pre-built frontend)

### Quick Start (1 Command via Flask)
Because the React frontend is pre-built into `frontend/dist`, Flask serves the entire application and REST API on port `5000`:

```bash
# 1. Install backend requirements
pip install -r requirements.txt

# 2. Run the application
python app.py
```

Open your browser and navigate to: **`http://127.0.0.1:5000`**

### Running with Vite Development Server (Hot Reloading)
If you wish to develop or modify React components with instant HMR:

```bash
# Terminal 1: Run Flask API Backend
python app.py

# Terminal 2: Run Vite Dev Server
cd frontend
npm install
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`** (Vite proxies all `/api/*` calls to Flask on port 5000).

---

## 7. Deployment Instructions (e.g. Render, Railway, or Heroku)

1. **Build Step**:
   ```bash
   cd frontend && npm install && npm run build && cd ..
   pip install -r requirements.txt
   ```
2. **Start Command**:
   ```bash
   python app.py
   ```
   *(For high concurrency production, install `gunicorn` and run `gunicorn app:app -b 0.0.0.0:$PORT`)*
3. **Environment Variables**:
   - `SECRET_KEY`: Set a secure random string.
   - `PORT`: Set automatically by hosting providers (defaults to 5000).

---

## 8. Summary of Features Not Implemented
- **Live Hardware Sensor Crowd Tracking**: As noted in the project specifications, crowd levels are modeled using regular scheduled attendance patterns rather than simulated fictional IoT sensors.
- **Real Payment Gateway**: Real credit card processing is intentionally omitted in favor of simulated 1-click demo enrollment with unique receipt IDs.
