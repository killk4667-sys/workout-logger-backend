# Workout Logger - REST API Backend

A Node.js + Express + MongoDB REST API for logging workouts and tracking fitness progress.

## Architecture
```
Controller → Service → Model
```
Each layer has a single responsibility:
- **Model** – Mongoose schema & DB interaction
- **Service** – Business logic & data processing
- **Controller** – HTTP request/response handling
- **Routes** – URL mapping & input validation

---

## Team Services

| Service | Owner | Routes prefix |
|---|---|---|
| Auth | Shared | `/api/auth` |
| Exercise Management | Eyad | `/api/exercises` |
| Workout Session Log | Fares | `/api/sessions` |
| Workout Notes | Saif | `/api/notes` |
| Progress & Analytics | Abdelrahman | `/api/analytics` |

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Fill in your `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/workout-logger
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
EXERCISEDB_API_KEY=your_rapidapi_key
EXERCISEDB_BASE_URL=https://exercisedb.p.rapidapi.com
```

### 3. Run the server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

---

## API Reference

### Authentication
All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Auth Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login & get token |
| GET | `/api/auth/me` | Yes | Get current user |

### Exercise Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/exercises` | Yes | Get all exercises (search/filter) |
| POST | `/api/exercises` | Yes | Create custom exercise |
| GET | `/api/exercises/:id` | Yes | Get exercise by ID |
| PUT | `/api/exercises/:id` | Yes | Update exercise |
| DELETE | `/api/exercises/:id` | Yes | Delete exercise |
| GET | `/api/exercises/muscle/:muscleGroup` | Yes | Filter by muscle group |
| GET | `/api/exercises/external/search?name=` | Yes | Search ExerciseDB API |
| POST | `/api/exercises/external/import/:bodyPart` | Yes | Import from ExerciseDB |

### Session Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/sessions` | Yes | Get all user sessions |
| POST | `/api/sessions` | Yes | Log new session |
| GET | `/api/sessions/history` | Yes | Get recent history |
| GET | `/api/sessions/:id` | Yes | Get session by ID |
| PUT | `/api/sessions/:id` | Yes | Update session |
| DELETE | `/api/sessions/:id` | Yes | Delete session |

### Notes Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notes/session/:sessionId` | Yes | Get notes for session |
| POST | `/api/notes/session/:sessionId` | Yes | Add note to session |
| GET | `/api/notes/:id` | Yes | Get single note |
| PUT | `/api/notes/:id` | Yes | Update note |
| DELETE | `/api/notes/:id` | Yes | Delete note |

### Analytics Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/dashboard` | Yes | Summary stats |
| GET | `/api/analytics/volume/weekly` | Yes | Weekly training volume |
| GET | `/api/analytics/personal-bests` | Yes | Max weight per exercise |
| GET | `/api/analytics/frequency` | Yes | Muscle group frequency |
| GET | `/api/analytics/progress/:exerciseId` | Yes | Exercise progress over time |

---

## ExerciseDB Integration

Get your free API key from [RapidAPI - ExerciseDB](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb).

Available muscle groups for import:
`back`, `cardio`, `chest`, `lower arms`, `lower legs`, `neck`, `shoulders`, `upper arms`, `upper legs`, `waist`

---

## Testing

Use the included `api.rest` file with the VS Code **REST Client** extension.

1. Install "REST Client" by Huachao Mao in VS Code
2. Open `api.rest`
3. Register a user → copy the token → paste into `@token`
4. Click **Send Request** above each block

---

## Deployment (Azure)

This API is designed to be deployed on:
- **Azure App Service** (PaaS) – recommended
- **Azure Virtual Machine** (IaaS)

Set all environment variables in Azure Application Settings.
