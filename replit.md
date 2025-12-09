# ConcurseIA - Brazilian Exam Preparation Platform

## Overview

ConcurseIA is a full-stack web application designed to help Brazilian students prepare for competitive public exams (concursos públicos), ENEM, and vestibulares. The platform leverages AI to generate personalized practice exams, provide intelligent feedback, create study material summaries, and track learning progress through comprehensive analytics dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark/light theme support
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API under `/api` prefix
- **Authentication**: Replit OpenID Connect (OIDC) with Passport.js
- **Session Management**: Express sessions stored in PostgreSQL via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Managed via drizzle-kit with `db:push` command

### Key Design Decisions

1. **Monorepo Structure**: Client (`client/`), server (`server/`), and shared code (`shared/`) in single repository for type safety across stack boundaries.

2. **Shared Schema**: Database schema defined once in `shared/schema.ts` and used for both database operations and API validation, ensuring type consistency.

3. **Build System**: Vite for frontend development/bundling, esbuild for production server bundling with selective dependency bundling for faster cold starts.

4. **Portuguese Localization**: UI text, date formatting, and content are in Brazilian Portuguese (pt-BR).

5. **Design System**: Utility-focused design system inspired by Linear and Notion, prioritizing clarity for study environments with comprehensive CSS custom properties for theming.

## External Dependencies

### AI Services
- **Google Gemini AI** (`@google/genai`): Powers question generation, essay evaluation, study recommendations, material summarization, and question explanations
- Requires `GEMINI_API_KEY` environment variable

### Database
- **PostgreSQL**: Primary data store
- Requires `DATABASE_URL` environment variable
- Tables: users, sessions, subjects, questions, materials, exams, exam_attempts, question_answers, user_performance, ai_recommendations

### Authentication
- **Replit OIDC**: OAuth2/OpenID Connect authentication
- Requires `REPL_ID`, `ISSUER_URL`, and `SESSION_SECRET` environment variables

### Payment Processing
- **Stripe** (configured but implementation partial): Subscription management for Pro tier
- Schema includes `stripeCustomerId` and `stripeSubscriptionId` fields

### Frontend Libraries
- Full shadcn/ui component set with Radix UI primitives
- TanStack Query for data fetching
- Recharts for performance analytics visualization
- date-fns for date manipulation