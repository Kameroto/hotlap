# HotLap System Architecture

## Overview

HotLap is a modern e-commerce platform for Remote Controlled (RC) cars, spare parts, 3D printed accessories, and RC racing events.

The project uses a monorepo architecture with a separate frontend and backend service.

---

## Project Structure

```
hotlap/
├── apps/
│   └── web/
├── services/
│   └── api/
├── packages/
├── docs/
├── docker/
├── scripts/
```

---

## Technology Stack

### Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui

### Backend
- Fastify
- Prisma ORM
- PostgreSQL

### Infrastructure
- Docker
- Turborepo
- pnpm

---

## Design Principles

- Separate frontend and backend services
- Modular folder structure
- Reusable UI components
- Shared TypeScript types
- Production-ready architecture
- AI-assisted development workflow