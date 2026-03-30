# Giftamine API

Backend service for **Giftamine** — a platform that helps users manage wishlists, discover gifts, and share them with friends or partners.

Built with **NestJS**, **Prisma**, and **PostgreSQL**.

---

# Tech Stack

- NestJS
- Prisma ORM
- PostgreSQL
- Redis (for queue / cache)
- JWT Authentication
- BullMQ (background jobs)
- pnpm (package manager)

---

# Project Structure

```
src
│
├ prisma
│   ├ prisma.module.ts
│   └ prisma.service.ts
│
├ modules
│   ├ auth
│   ├ user
│   ├ wishlist
│   └ gift
│
├ common
│   ├ guards
│   ├ decorators
│   └ filters
│
├ config
│   └ env.validation.ts
│
└ app.module.ts
```

---

# Requirements

- Node.js >= 18
- pnpm
- PostgreSQL

---

# Installation

Clone the repository:

```
git clone https://github.com/your-repo/giftamine-api.git
cd giftamine-api
```

Install dependencies:

```
pnpm install
```

---

# Environment Variables

Create a `.env` file in the root directory:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/giftamine"

JWT_SECRET="supersecret"

REDIS_URL="redis://localhost:6379"
```

---

# Database Setup

Generate Prisma client:

```
pnpm prisma generate
```

Run migrations:

```
pnpm prisma migrate dev --name init
```

Open Prisma Studio:

```
pnpm prisma studio
```

---

# Running the Server

Development:

```
pnpm start:dev
```

Production build:

```
pnpm build
pnpm start
```

Server runs at:

```
http://localhost:3000
```

---

# Docker

## Development

To run the application with Docker Compose in development mode:

```
docker-compose -f docker-compose.dev.yml up --build
```

This will start the NestJS app with hot reload, PostgreSQL database, and mount your source code.

## Production

To run the application in production mode:

```
docker-compose up --build
```

This will build and run the optimized production image with PostgreSQL.

## Environment Variables

For Docker, environment variables are set in the `docker-compose.yml` files. You can override them by creating a `.env` file or modifying the compose files.

Default database connection:

- Host: postgres
- Port: 5432
- Database: giftamine
- User: giftamine
- Password: password

---

## Auth

```
POST /auth/register
POST /auth/login
POST /auth/refresh
```

---

## User

```
GET /users/me
PATCH /users/me
```

---

## Wishlist

```
POST /wishlist
GET /wishlist
PATCH /wishlist/:id
DELETE /wishlist/:id
```

---

## Gift

```
POST /gifts
GET /gifts
PATCH /gifts/:id
DELETE /gifts/:id
```

---

# Development Commands

Run linter:

```
pnpm lint
```

Run tests:

```
pnpm test
```

---

# Future Features

- Friend system
- Gift reservation
- Event reminders (birthday, anniversary)
- AI gift suggestion
- Notifications
- Recommendation system

---

# License

MIT
