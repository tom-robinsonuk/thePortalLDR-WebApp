# The Portal 💕

A private, mobile-first web app for long-distance couples. Solve "call boredom" with shared interactive activities instead of just video calling!

---

## 🎨 Core Vibe & Aesthetic

- **Style:** "Pastel Kawaii" (Milk & Mocha Bear style)
- **Colors:** Soft Pink (#FFD1DC), Cream (#FFF5E1), Pastel Purple (#E0BBE4), Sky Blue (#B2E2F2)
- **UI:** Rounded corners, bouncy animations (Framer Motion), large icons
- **Language:** High Visuals, Low Text. Simple English only.

---

## � Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
cd ThePortal

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Note**: This app relies on Supabase for Authentication, Database, Realtime, and Storage. You must provide valid credentials for features to work.

---

## � Available Routes

| Route | Feature |
|-------|---------|
| `/` | Home - TeddyCouple artwork, Mini mood display, Boredom Buster |
| `/mood` | Mood-oji Tracker - Select your current mood with bear emojis |
| `/draw` | Scribble Nook - Shared drawing canvas with save/history |
| `/play` | Love Tap War - Competitive tapping game |
| `/stars` | Stargazing - Plant memory stars in the sky |

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend | Supabase (Database + Realtime) |
| Deployment | Vercel |

---

## 🎯 Key Features

1. **Mood-oji Tracker** - Real-time emotional status with custom bear emojis
2. **Scribble Nook** - Shared drawing canvas with save & history
3. **Anti-Boredom Engine** - Gacha-style prompts for Questions, Missions, Truth/Dare
4. **Stargazing** - Plant memory stars with photos or notes
5. **Love Tap War** - Competitive tapping game with real-time sync
6. **Personal Dashboard** - Dynamic names, Sleeping Bear indicator (timezone aware), and Hug Countdown

---

## 📝 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 💖 Design Philosophy

- **"Milk & Mocha Bear"** style - soft, cute, rounded
- **"Kawaii Cloud" UI** - Soft, semi-transparent white containers with pill-shaped roundness (`rounded-[2rem]`)
- **High visuals, low text** - language-free where possible
- **Mobile-first** - vertical screens, but responsive to iPad/desktop
- **Real-time sync** - feel connected even when apart