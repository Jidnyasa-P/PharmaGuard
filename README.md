# PharmaGuard – Pharmacogenomics Clinical Decision Support

A full-stack web app that analyzes patient VCF genomic files against prescribed drugs and generates clinical risk reports using Groq AI (llama-3.3-70b-versatile).

## Project Structure

```
pharmaguard-complete/
├── backend/          ← Node.js/Express API (deploy this on Render)
│   ├── src/          ← Server source code
│   ├── dist/         ← Pre-built React frontend (served by backend)
│   ├── package.json
│   ├── render.yaml
│   └── .env.example
└── frontend/         ← React/TypeScript source (for local dev only)
    ├── views/
    ├── components/
    ├── services/
    └── package.json
```

---

## 🚀 Deploy on Render (Production)

The backend serves the pre-built frontend from its `dist/` folder. You only deploy the **backend** folder on Render.

### Step 1 – Push backend to GitHub
1. Create a new GitHub repository
2. Copy the `backend/` folder contents into it (or the whole repo)
3. Push to GitHub

### Step 2 – Create a Web Service on Render
1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Configure the service:
   - **Name:** `pharmaguard` (or any name)
   - **Root Directory:** leave blank (or set to `backend` if you pushed the full repo)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Step 3 – Add Environment Variables
In Render dashboard → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |

> **PORT** is set automatically by Render — do NOT set it manually.

### Step 4 – Deploy
Click **Deploy** and wait ~2 minutes. Your app will be live at:
`https://pharmaguard.onrender.com` (or whatever name you chose)

---

## 💻 Run Locally on Windows (VS Code)

You need **two terminals** open simultaneously — one for backend, one for frontend.

### Prerequisites
- [Node.js 18+](https://nodejs.org) installed on Windows
- VS Code with the project open

### Terminal 1 – Start the Backend

```bash
# Navigate to backend folder
cd backend

# Create your .env file
copy .env.example .env
# Then open .env in VS Code and add your GROQ_API_KEY

# Install dependencies
npm install

# Start the backend server
npm run dev
```
Backend runs at → **http://localhost:5000**

### Terminal 2 – Start the Frontend

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```
Frontend runs at → **http://localhost:3000**

> The frontend is configured to proxy `/api` calls to `localhost:5000` automatically via `vite.config.ts`.

### Open the App
Visit **http://localhost:3000** in your browser.

---

## 🔑 Getting a Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Go to **API Keys** → **Create API Key**
4. Copy the key and paste it in your `.env` file as `GROQ_API_KEY=your_key_here`

---

## 📋 How It Works

1. **Upload** a `.vcf` genomic file and **select drugs** on the Analysis page
2. Frontend sends `POST /api/analyze` with the file + drug name for each drug
3. Backend parses the VCF → filters genes → predicts diplotype/phenotype → assesses drug risk → gets CPIC recommendation → generates AI explanation via Groq
4. Results are displayed on the Results page with risk levels, gene profiles, and clinical recommendations

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Groq API key for LLM explanations |
| `PORT` | ❌ Auto | Set automatically by Render; defaults to 5000 locally |

