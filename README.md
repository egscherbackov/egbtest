# EGORBUYER.COM

Premium buying service web application built with Next.js 15, TypeScript, Tailwind CSS v4, Prisma ORM, and SQLite.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma ORM** + SQLite (dev) / PostgreSQL (prod)
- **iron-session** — secure cookie sessions
- **nanoid** — login code / invite token generation

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run migrations (creates dev.db)
npx prisma migrate dev --name init

# 4. Seed database (creates admin + sample data)
npm run db:seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite path or PostgreSQL URL |
| `SESSION_SECRET` | *(set in .env)* | **Min 32 chars** secret for session encryption |
| `ADMIN_PASSWORD` | `admin123` | Initial admin password |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public URL (used for invite links) |

## Admin Access

URL: [http://localhost:3000/adminpanel](http://localhost:3000/adminpanel)

- **Login:** `admin`
- **Password:** value of `ADMIN_PASSWORD` env variable (default: `admin123`)

## User Login

Users log in via a **login code** (e.g. `ABCD1234`).

- Admin creates users at `/adminpanel/users`
- Code is shown in the admin panel
- User enters code at `/login`

## Invite Links

- Admin creates invite links at `/adminpanel/invites`
- Share the link: `https://yourdomain.com/invite/[TOKEN]`
- User fills in name + contact, account activates automatically

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | User login by code |
| `/invite/[token]` | Invite activation |
| `/instructions` | Instructions list (auth required) |
| `/instructions/[slug]` | Step-by-step instruction |
| `/adminpanel` | Admin dashboard |
| `/adminpanel/users` | User management |
| `/adminpanel/users/[id]` | User detail |
| `/adminpanel/invites` | Invite links |
| `/adminpanel/instructions` | Instructions overview |

## Build

```bash
npm run build
npm start
```

## Database GUI

```bash
npm run db:studio
```
