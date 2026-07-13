# Musa's Gaming World

A fully interactive, cinematic gaming website built for a 10-year-old Roblox enthusiast. Features 8+ playable mini-games, a drawing studio, achievement system, XP/coin economy, ambient sound design, and a premium cinematic intro — all in a single-page React app with zero backend.

**Built by Syed Aoun Sherazi**

---

## Live Demo

🔗 [musa-s-gaming-world.vercel.app](https://musa-s-gaming-world.vercel.app)

---

## Features

### Cinematic Intro
- 4-scene animated reveal (particles → creator name → cousin name → portal)
- Full Web Audio API sound design — ambient pads, whooshes, name reveals, celebration melodies
- "Tap to Start" screen to unlock browser audio context

### 8 Playable Mini-Games
| Game | Description |
|------|-------------|
| Tic Tac Toe | Classic X and O with AI opponent (win/block/center/random strategy) |
| Rock Paper Scissors | Beat the computer |
| Memory Match | Find all matching pairs |
| Whack-a-Mole | Click moles before they hide |
| Snake | Classic snake — grow and eat |
| Flappy Bird | Fly through pipes |
| Click Speed | Test your clicking speed |
| Number Guess | Guess a number between 1–100 |

### Pages & Features
- **Home / Lobby** — Central hub with portal grid, daily reward claims, fireworks, and confetti
- **Fun Zone** — Random jokes, fun facts, dice roller, coin flip, magic 8-ball, emoji generator, color picker, animal facts
- **Drawing Studio** — Full canvas drawing tool with brush, eraser, colors, brush sizes, and PNG download
- **Achievement Hall** — 20+ unlockable badges with rarity tiers (Common, Rare, Epic, Legendary)
- **Roblox Corner** — Curated list of favorite Roblox games with favorite/unfavorite
- **Gallery** — Animated emoji art gallery with lightbox viewer
- **Music Room** — Procedural chiptune music player with 4 tracks, volume control, and equalizer
- **Lucky Wheel** — Spin-to-win wheel with 8 prize segments
- **Surprise Room** — Secret room (click the crystal ball 5 times on Home) with party effects, rainbow mode, and fireworks
- **About Me** — Profile page with hobbies, favorites, and fun facts

### Sound System
- **Ambient background music** — Lo-fi gaming loop (bass + chord pads + pentatonic melody) auto-plays on all pages
- **14+ sound effects** — Click, hover, pop, coin, dice, flip, success, win, celebration, level-up, whoosh, error, dice rattle
- **Global hover sounds** — Delegated event listener adds subtle tick to all interactive elements
- **Sound toggle** — Navbar toggle to enable/disable all audio
- Sound enabled by default, toggleable via navbar

### UI/UX
- Dark/light mode with smooth transitions
- Glassmorphism design system (`GlassPanel` component)
- Neon color palette with gradient accents
- Floating particles, balloons, and scroll progress indicator
- NPC companion with chat bubbles
- Responsive design (mobile hamburger menu, grid layouts)
- Back-to-top button
- 3 custom fonts: Fredoka One (headings), Nunito (body), Press Start 2P (pixel accents)

### Player System
- XP and coin economy — earn from games, daily rewards, wheel spins, drawing
- Level progression system
- Daily reward claims with random XP/coin amounts
- Daily streak tracking
- Avatar selection (Explorer, Ninja, Robot, Wizard, etc.)
- All progress persisted to `localStorage`

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite 8 | Build tool and dev server |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Animations and transitions |
| React Router v7 | Client-side routing |
| Web Audio API | All sound effects and music (zero external audio files) |
| localStorage | Player progress persistence (zero backend) |

---

## Project Structure

```
src/
├── components/
│   ├── games/          # 8 game components
│   ├── layout/         # Navbar, Footer
│   └── ui/             # 13 reusable UI components
├── context/            # GameContext (global state)
├── hooks/              # useLocalStorage, usePlayerData
├── pages/              # 12 page components
└── utils/              # sounds.js, introSounds.js, achievements.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
git clone https://github.com/SyedAounHaiderSherazi/Musa-s-Gaming-World.git
cd Musa-s-Gaming-World
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Output in `dist/` — ~497KB JS (149KB gzip), ~39KB CSS (7KB gzip)

### Preview Production Build

```bash
npm run preview
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Vercel auto-detects Vite — click Deploy
4. `vercel.json` included with SPA rewrite rules (no 404s on page refresh)

```bash
git push -u origin main
```

---

## How It Works

- **No backend** — Everything runs in the browser. Player data, achievements, and settings are stored in `localStorage`.
- **No external assets** — All sounds are generated in real-time using the Web Audio API oscillators. No audio files needed.
- **No copyrighted content** — Custom blocky/Roblox-inspired aesthetic with original emoji-based art. No Roblox trademarks used.
- **Modular architecture** — Each game is a self-contained component with `onWin` callbacks. Adding a new game is as simple as creating a component and adding it to the `GAMES` array.

---

## License

This project was built as a personal project for Syed Musa Hassan. Feel free to fork and customize it for your own gaming world.

---

*Made with love by Syed Aoun Sherazi*
