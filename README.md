# Nexo Sana Spark — Local Setup Guide

## Prerequisites
- Node.js 18+ (https://nodejs.org)
- npm 9+

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app will be available at **http://localhost:8080**

---

## Environment Variables

The `.env` file is pre-configured with Supabase credentials. If you need to use your own Supabase project, update:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 8080 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run unit tests |

---

## Smart Contracts (optional)

The `hardhat/` folder contains the Solidity contracts. To compile them:

```bash
cd hardhat
npm install
npx hardhat compile
```

---

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui + Radix UI
- **Auth/DB:** Supabase
- **Web3:** wagmi + RainbowKit + viem
- **Contracts:** Hardhat + Solidity
# new-nexol
