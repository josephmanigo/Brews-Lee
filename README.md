# Brews Lee

A premium matcha & coffee marketplace rooted in Davao, inspired by Japanese minimalism. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion (Framer), Lenis (smooth scroll)
- **Routing:** Wouter
- **Backend / Auth / DB:** Supabase (PostgreSQL + Auth)
- **Email:** Resend + Express server

## Getting Started

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. (Optional) Start the email server in a separate terminal:
   ```bash
   npm run server
   ```

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, philosophy, featured delights |
| `/menu` | Menu — matcha, coffee, pastries with cart |
| `/story` | Brand story — philosophy, sourcing, craft |
| `/checkout` | Order checkout |
| `/login` / `/signup` | Auth |
| `/dashboard` | User account, orders, addresses |
