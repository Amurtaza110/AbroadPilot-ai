# AbroadPilot AI ✈️🎓
> **Intelligent Study Abroad Consultancy & Application Lifecycle Platform powered by Google Gemini 2.0 & Firebase.**

AbroadPilot AI simplifies and modernizes the international education journey for students worldwide. From personalized profile evaluation and university shortlisting to automated application milestone tracking, live AI advising with Google search grounding, scholarship matching, and visa guidance — AbroadPilot AI acts as your 24/7 personal study abroad counsellor.

---

## ✨ Key Features

- **🤖 AI Study Abroad Advisor**:
  - Conversational AI powered by Google Gemini 2.0 Flash (`@google/genai`).
  - Real-time streaming responses with **live Google Search grounding** toggle for up-to-date admission deadlines, tuition updates, and visa policies.
  - Context-aware recommendations tailored to the student's profile, test scores, target destination, and budget.

- **🎯 Smart Onboarding & Profile Builder**:
  - 5-step guided wizard capturing academic background, GPA, English/Standardized test scores (IELTS, TOEFL, GRE, GMAT), target destinations, and intake preferences.
  - Automatically generates an actionable 10-stage application roadmap upon completion.

- **🗺️ Interactive Study Abroad Roadmap**:
  - Step-by-step milestones spanning profile evaluation, test prep, university applications, scholarship deadlines, and visa appointments.
  - Dynamic progress tracking, priority tags, subtask checklists, and AI-powered roadmap regeneration.

- **🏫 AI University & Program Discover**:
  - Intelligent discovery for universities and programs across top global destinations (USA, UK, Canada, Germany, Australia, etc.).
  - Detailed insights including tuition fees, acceptance rates, ranking, and eligibility criteria.

- **📑 Applications Command Center**:
  - Full lifecycle tracking across 12 granular application stages (Shortlisted, Preparing, Submitted, Under Review, Interview, Accepted, Rejected, Visa Filed, etc.).
  - Deadline reminders, portal links, and status badges.

- **💰 Curated & AI Scholarship Explorer**:
  - Discover fully and partially funded scholarships (DAAD, Chevening, Erasmus Mundus, Fulbright, Australia Awards, and university-specific grants).
  - Filter by country, degree level, and funding type.

- **⚡ Auto-Apply Agent & Deadline Radar**:
  - Autonomous portal monitor tracking intake deadlines (Fall/Winter) with real-time countdown clocks.
  - Multi-document dossier compiler generating ready-to-submit application packages.
  - 1-click **Calendar Sync (`.ics`)** generating reminders for Google, Apple, and Outlook calendars.
  - Live autonomous portal verification feed validating prerequisite criteria (ECTS, GPA, English test minimums).

- **🗄️ Document Vault & Verification**:
  - Organized checklist for Statements of Purpose (SOP), Letters of Recommendation (LOR), Transcripts, Financial/Bank statements, and Test scores.
  - Visual status tracking (Not Started, In Progress, Ready, Verified).

- **✍️ AI SOP & Essay Studio**:
  - Dual-mode drafting and rubric evaluation engine.
  - Tailors Statements of Purpose according to word limit, university research labs, and academic tone.
  - Admissions committee rubric scoring (0-100) on Academic Fit, Storytelling, Research Depth, and Grammar with actionable revision pointers.

- **🎙️ Consular Mock Visa Interview Agent**:
  - Live conversational simulation tailored to USA (F-1), UK, Germany, Canada, and Australia consular regulations.
  - Audio integration using Web Speech synthesis and recognition.
  - Real-time scoring, immigration intent risk detection, and model answers.

- **🛂 Country-Specific Visa Guides**:
  - Step-by-step visa application processes, interview tips, financial proof requirements, and checklist items for major destinations.

- **📊 Multi-Currency Cost of Living Planner**:
  - Comprehensive financial breakdown covering tuition, accommodation, healthcare insurance, living expenses, and travel.

- **🔒 Secure Authentication & Cloud Storage**:
  - Firebase Authentication supporting Email/Password and one-click Google Sign-In.
  - Real-time syncing with Cloud Firestore.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) icons, [Motion](https://motion.dev/)
- **AI Engine**: [Google Gemini 2.0 Flash](https://ai.google.dev/) via `@google/genai` with search grounding
- **Backend as a Service (BaaS)**: [Firebase](https://firebase.google.com/) (Auth, Firestore)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0 or later recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) / [yarn](https://yarnpkg.com/)
- A [Google AI Studio](https://aistudio.google.com/) Gemini API key
- A [Firebase Project](https://console.firebase.google.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/murtazabukhari/AbroadPilot-AI.git
cd AbroadPilot-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Fill in your Firebase and Gemini credentials:

```env
# Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note**: In Firebase Console, ensure you enable **Authentication** (Email/Password & Google providers) and **Cloud Firestore Database**.

### 4. Run Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### 5. Production Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🌐 Cloud Deployment

Pre-configured SPA routing configs are included for both **Vercel** (`vercel.json`) and **Netlify** (`netlify.toml`):

### Deploy to Vercel
1. Import repository on [Vercel](https://vercel.com/new).
2. Framework Preset: **Vite**.
3. Add Environment Variables (`VITE_GEMINI_API_KEY`, `VITE_FIREBASE_*`).
4. Click **Deploy**.

### Deploy to Netlify
1. Connect repository on [Netlify](https://app.netlify.com/start).
2. Build command: `npm run build` | Publish directory: `dist`.
3. Add Environment Variables in Site Settings.
4. Click **Deploy Site**.

---

## 📂 Project Architecture

```
AbroadPilot-AI/
├── src/
│   ├── components/       # Reusable components (Layout, SetupBanner, etc.)
│   ├── contexts/         # React Contexts (AuthContext, ToastContext)
│   ├── lib/              # Integrations & Utilities (firebase.ts, gemini.ts)
│   ├── pages/            # Application views:
│   │   ├── AiAdvisor.tsx     # Gemini 2.0 chat + Search grounding
│   │   ├── Applications.tsx  # Application lifecycle board
│   │   ├── CostPlanner.tsx   # Budget & expense estimator
│   │   ├── Dashboard.tsx     # Student summary & quick metrics
│   │   ├── Discover.tsx      # University search & program catalog
│   │   ├── Documents.tsx     # Document tracking vault
│   │   ├── Login.tsx         # Authentication screen
│   │   ├── Onboarding.tsx    # 5-step profile & roadmap generator
│   │   ├── Profile.tsx       # Student profile & settings
│   │   ├── Roadmap.tsx       # Milestones & task breakdown
│   │   ├── Scholarships.tsx  # Scholarship match finder
│   │   └── VisaGuide.tsx     # Country visa checklist & guides
│   ├── types.ts          # Global TypeScript interfaces & schemas
│   ├── App.tsx           # Router & protected route definitions
│   ├── main.tsx          # App entrypoint
│   └── index.css         # Tailwind & theme variables
├── public/               # Static assets
├── .env.example          # Sample environment config
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check out the [issues page](https://github.com/murtazabukhari/AbroadPilot-AI/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
