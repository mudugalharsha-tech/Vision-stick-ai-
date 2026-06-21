# VisionStick AI — Production Full-Stack

AI-Powered Smart Navigation for the Visually Impaired.
Real-time obstacle detection via TensorFlow.js COCO-SSD running 100% in the browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend UI | React 18, Vite, CSS-in-JS |
| AI Detection | TensorFlow.js COCO-SSD (in-browser, no server) |
| Voice Output | Web Speech API (speaker-only) |
| Backend API | Node.js 20 + Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Email | Nodemailer (SMTP) |
| Reverse Proxy | Nginx |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
visionstick/
├── frontend/
│   ├── src/
│   │   ├── components/       # NavBar, Card, IconBox, LoadingSpinner
│   │   ├── pages/            # HomePage, FeaturesPage, HowPage, DashboardPage
│   │   ├── hooks/
│   │   │   ├── useDetection.js   # TF.js COCO-SSD detection loop
│   │   │   ├── useVoice.js       # Speaker-only voice engine
│   │   │   └── useCooldown.js    # 6-second cooldown system
│   │   ├── utils/
│   │   │   ├── riskEngine.js     # Risk scoring 0-100
│   │   │   ├── zoneEngine.js     # Critical/Warning/Awareness/Monitor
│   │   │   └── voiceBuilder.js   # Smart message construction
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   └── AlertLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   └── analytics.js
│   ├── middleware/
│   │   ├── authGuard.js
│   │   └── rateLimiter.js
│   ├── services/
│   │   ├── emailService.js
│   │   └── analyticsService.js
│   ├── config/
│   │   └── db.js
│   ├── server.js
│   └── package.json
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Development)

### Option 1: Standalone Prototype (Frontend Only)
*Best for a quick demo or sharing online without needing a database.*
```bash
cd frontend
npm install
npm run dev               # App runs at http://localhost:5173
```

### Option 2: Full-Stack Mode (Frontend + Backend + DB)
*Best for local development with analytics and session tracking.*
```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env      # edit with your values
npm install
npm run dev               # API runs at http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev               # App runs at http://localhost:5173
```

---

## Production Deploy

```bash
# Fill in production env vars
cp backend/.env.example backend/.env.production

# Build & start all containers
docker-compose up -d --build

# App runs at http://localhost (port 80 via Nginx)
```

---

## Environment Variables (backend/.env)

```
PORT=5000
MONGODB_URI=mongodb://mongo:27017/visionstick
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get tokens |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Invalidate refresh token |
| GET  | /api/auth/me | Get current user |

### Sessions
| Method | Route | Description |
|---|---|---|
| POST | /api/sessions/start | Start detection session |
| PATCH | /api/sessions/:id/end | End session with stats |
| GET | /api/sessions | List user sessions |
| GET | /api/sessions/:id | Single session detail |

### Analytics
| Method | Route | Description |
|---|---|---|
| GET | /api/analytics/summary | Total stats for user |
| GET | /api/analytics/objects | Most detected objects |
| POST | /api/analytics/alert | Log a voice alert |

---

## License
MIT — Free to use, modify, and distribute.
