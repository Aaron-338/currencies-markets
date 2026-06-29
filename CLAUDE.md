# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (NestJS)
Located in `/backend/` directory:

- **Start development server**: `npm run start:dev` (port 3002)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint with TypeScript, auto-fix enabled)
- **Format**: `npm run format` (Prettier)
- **Test**: `npm run test` (Jest unit tests)
- **Test with coverage**: `npm run test:cov`
- **E2E tests**: `npm run test:e2e`

### Frontend (Next.js)
Located in `/frontend/` directory:

- **Start development server**: `npm run dev` (port 3000)
- **Build**: `npm run build`
- **Production start**: `npm run start`
- **Lint**: `npm run lint` (Next.js ESLint)
- **Bundle analysis**: `npm run analyze`

### Database Commands (Backend)
TypeORM migrations:
- **Generate migration**: `npm run migration:generate -- -n MigrationName`
- **Run migrations**: `npm run migration:run`
- **Revert migration**: `npm run migration:revert`

## Architecture Overview

### Full-Stack Structure
This is a **financial trading platform** with separate backend and frontend applications:

- **Backend**: NestJS API server with PostgreSQL database
- **Frontend**: Next.js with TypeScript, Tailwind CSS, and Radix UI components
- **Real-time features**: WebSocket connections for notifications and live data

### Backend Architecture (NestJS)
**Core modules** (all follow standard NestJS module pattern):
- **Auth**: JWT-based authentication with session management
- **Users**: User management with roles, permissions, profiles
- **Assets**: Financial assets and portfolio management  
- **Portfolios**: Portfolio creation and management
- **Transactions**: Trading transaction history
- **Signals**: Trading signals system with create/review workflow
- **Subscriptions**: Subscription management with Deriv integration
- **Challenges**: Trading challenges with submissions
- **Economic Events**: Economic calendar integration
- **Market News**: Multi-source financial news aggregation
- **Notifications**: Real-time notifications via WebSocket

**Key technical details**:
- Uses TypeORM with PostgreSQL for database operations
- Entity files use `.entity.ts` convention
- Controllers handle HTTP endpoints, services contain business logic
- WebSocket gateway for real-time notifications at `/ws/notifications`
- File uploads stored in `/uploads/` directory with static serving
- API integrations: Alpha Vantage (primary news), Marketaux (secondary), Deriv API

### Frontend Architecture (Next.js)
**App Router structure** with TypeScript:
- **Pages**: `/app/` directory with route-based organization
- **Components**: Reusable UI components in `/components/`
- **API Routes**: Backend integration in `/app/api/`
- **Styles**: Tailwind CSS with component variants

**Key features**:
- NextAuth.js for authentication with custom backend integration
- Radix UI component library with custom theming
- Real-time data via WebSocket connections
- Bundle optimization with code splitting for Radix UI and charts
- Image optimization enabled

### Database Schema
PostgreSQL with TypeORM entities:
- **Users**: Authentication, profiles, roles, company affiliations
- **Assets/Portfolios**: Financial portfolio management
- **Signals**: Trading signals with approval workflow
- **Subscriptions**: User subscription management
- **Economic Events**: Calendar data storage
- **Challenges**: Trading competitions
- **Notifications**: User notification system

## Environment Setup

### Required Environment Variables

**Backend (.env)**:
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ivrex

# API Keys for financial data
ALPHAVANTAGE_API_KEY=your_key_here  # Primary news source (500 requests/day free)
MARKETAUX_API_TOKEN=your_token_here  # Secondary news source
NEWS_API_KEY=your_key_here  # Tertiary news source

# JWT & Auth
JWT_SECRET=your_jwt_secret_here

# Email (Mailtrap for development)
MAILTRAP_USERNAME=your_username
MAILTRAP_PASSWORD=your_password
```

**Frontend (Next.js)**:
- NextAuth configuration for backend API integration
- WebSocket connection to backend notification service

### API Integration Details
The system uses a **multi-tier news aggregation**:
1. **Alpha Vantage** (primary): Real-time financial news with sentiment analysis
2. **Marketaux** (secondary): Backup financial news source  
3. **News API** (tertiary): General news fallback
4. **Static content**: Fallback when all APIs fail

## Development Workflow

### Running the Full Stack
1. **Start PostgreSQL database**
2. **Backend**: `cd backend && npm run start:dev` (port 3002)
3. **Frontend**: `cd frontend && npm run dev` (port 3000)

### Code Style & Quality
- **Backend**: ESLint + Prettier with TypeScript strict checking
- **Frontend**: Next.js ESLint configuration
- **Database**: TypeORM with migration-based schema management (avoid `synchronize: true` in production)

### Testing
- **Backend**: Jest unit tests with coverage reporting
- **E2E tests**: Available via `npm run test:e2e`
- Test individual modules with specific patterns: `npm run test -- --testPathPattern=auth`

### Key File Locations
- **Main app module**: `/backend/src/app.module.ts`
- **Database config**: `/backend/src/config/typeorm.ts`
- **Frontend layout**: `/frontend/app/layout.tsx`
- **UI components**: `/frontend/components/ui/` (Radix UI based)
- **API routes**: `/frontend/app/api/`
- **Migrations**: `/backend/src/migrations/`