# 🍽 RecipeHub — Recipe Management System

A full-stack recipe management web application that suggests personalized recipes based on dietary preferences, allergies, available ingredients, and cooking habits.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| Frontend | _Coming soon (Netlify)_ |
| Backend API | _Coming soon (Render)_ |

---

## 📸 Features

- 🔐 **User Authentication** — Register, login, JWT-based session management
- 👤 **Profile Management** — Set dietary preferences, allergies, skill level, and ingredient preferences
- 🎯 **Personalized Suggestions** — Home page recipes filtered by your dietary tags and allergies
- 🔍 **Advanced Search** — Filter by cuisine, diet type, intolerance, and max cooking time
- 🥕 **Search by Ingredients** — Enter what you have in your fridge and find matching recipes
- 📖 **Recipe Detail** — Step-by-step instructions, ingredients, cook time, servings
- ♥ **Save Recipes** — Bookmark your favourite recipes for quick access
- ⭐ **Ratings & Reviews** — Rate recipes 1–5 stars and leave written reviews

---

## 🛠 Tech Stack

### Frontend
- Vanilla HTML5, CSS3, JavaScript (ES6 Modules)
- Served via [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) locally
- Deployed on **Netlify**

### Backend
- **Node.js** with **Express.js**
- **MySQL** hosted on **Railway**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Axios** for Spoonacular API calls
- Deployed on **Render**

### External API
- **[Spoonacular API](https://spoonacular.com/food-api)** — Recipe data, search, and filtering

---

## 📁 Project Structure

```
recipe-management-system/
│
├── frontend/
│   ├── index.html           # Home / Suggestions page
│   ├── login.html
│   ├── register.html
│   ├── profile.html         # User profile & preferences
│   ├── search.html          # Search & filter + by ingredients
│   ├── recipe.html          # Recipe detail + reviews
│   ├── saved.html           # Saved/bookmarked recipes
│   │
│   ├── css/
│   │   └── main.css
│   │
│   └── js/
│       ├── api.js           # All fetch() calls in one place
│       ├── auth.js
│       ├── home.js
│       ├── search.js
│       ├── recipe.js
│       ├── profile.js
│       ├── saved.js
│       └── utils.js         # Cache, helpers, toast, card builder
│
└── backend/
    ├── server.js
    ├── .env.example
    ├── migrate.js           # Run DB migrations from terminal
    │
    ├── config/
    │   ├── db.js            # MySQL connection pool
    │   └── schema.sql       # Full database schema
    │
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── user.controller.js
    │   ├── recipe.controller.js
    │   └── review.controller.js
    │
    ├── routes/
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── recipe.routes.js
    │   ├── review.routes.js
    │   └── saved.routes.js
    │
    └── middleware/
        ├── auth.middleware.js
        └── error.middleware.js
```

---

## 🗄 Database Schema

```
users                  → id, name, email, password_hash, skill_level
user_preferences       → user_id, dietary_tags (JSON), allergies (JSON)
user_ingredient_prefs  → user_id, ingredient, type (include/exclude)
saved_recipes          → user_id, meal_id, meal_name, meal_thumb
reviews                → user_id, meal_id, rating, comment
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### User
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/user/profile` | ✅ | Get user profile + preferences |
| PUT | `/api/user/profile` | ✅ | Update profile, dietary tags, allergies |

### Recipes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/recipes/search` | Search with filters (q, cuisine, diet, intolerances, maxReadyTime) |
| GET | `/api/recipes/by-ingredients` | Find recipes by available ingredients |
| GET | `/api/recipes/suggestions` | Personalized random recipes |
| GET | `/api/recipes/:id` | Full recipe detail + instructions |
| GET | `/api/recipes/cuisines` | List of supported cuisines |
| GET | `/api/recipes/diets` | List of supported diets |
| GET | `/api/recipes/intolerances` | List of supported intolerances |

### Saved Recipes
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/saved` | ✅ | Get all saved recipes |
| POST | `/api/saved/:mealId` | ✅ | Save a recipe |
| DELETE | `/api/saved/:mealId` | ✅ | Remove saved recipe |

### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews/:mealId` | ❌ | Get reviews + average rating |
| POST | `/api/reviews/:mealId` | ✅ | Add or update a review |

---

## ⚙️ Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [VS Code](https://code.visualstudio.com/)
- [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code
- MySQL database (we use [Railway](https://railway.app))
- [Spoonacular API key](https://spoonacular.com/food-api) (free tier)

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/recipe-management-system.git
cd recipe-management-system
```

---

### 2. Configure VS Code Live Server root

Press `Ctrl+Shift+P` → Open User Settings (JSON) → add:

```json
"liveServer.settings.root": "/frontend"
```

---

### 3. Set up the database

1. Create a free MySQL instance on [Railway](https://railway.app)
2. Enable **Public Networking** under Settings → Networking
3. Note your public host and port

---

### 4. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
DB_HOST=your_railway_public_host
DB_PORT=your_railway_public_port
DB_USER=root
DB_PASSWORD=your_railway_password
DB_NAME=railway
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
SPOONACULAR_API_KEY=your_spoonacular_api_key
FRONTEND_URL=http://127.0.0.1:5500
```

---

### 5. Install dependencies and run migrations

```bash
cd backend
npm install
npm run migrate
```

You should see:
```
✅ Connected. Running migrations...
✅ Migration complete. Tables created.
```

---

### 6. Start the backend

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MySQL connected successfully
```

---

### 7. Start the frontend

Right-click `frontend/index.html` in VS Code → **Open with Live Server**

Visit: `http://127.0.0.1:5500`

---

## 🚀 Deployment

### Backend → Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → connect your repo
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env`

### Frontend → Netlify
1. Go to [netlify.com](https://netlify.com) → Add new site → Import from GitHub
2. Set publish directory to `frontend`
3. After deploy, update `FRONTEND_URL` in Render env vars to your Netlify URL
4. Update `BASE_URL` in `frontend/js/api.js` to your Render backend URL

---

## 📦 npm Scripts

```bash
npm run dev       # Start backend with nodemon (development)
npm run start     # Start backend (production)
npm run migrate   # Run database migrations
```

---

## 📝 Environment Variables Reference

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default 5000) |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | JWT expiry duration (e.g. `7d`) |
| `SPOONACULAR_API_KEY` | Your Spoonacular API key |
| `FRONTEND_URL` | Allowed CORS origin for frontend |

---

## 🙏 Credits

- Recipe data powered by [Spoonacular API](https://spoonacular.com/food-api)
- Database hosted on [Railway](https://railway.app)