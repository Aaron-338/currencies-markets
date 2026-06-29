# IVREX - Investment & Risk Exchange Platform

A comprehensive financial platform built with modern web technologies, providing portfolio management, market data analysis, and investment tracking capabilities.

## 🏗️ Architecture Overview

IVREX is a full-stack application consisting of:

- **Backend**: NestJS (TypeScript) REST API with TypeORM
- **Frontend**: Next.js (TypeScript) with Tailwind CSS
- **Database**: MySQL/PostgreSQL with TypeORM migrations
- **Authentication**: JWT-based with bcrypt password hashing
- **Process Management**: PM2 for production deployment

## 📁 Project Structure

```
ivrex/
├── backend/                    # NestJS API Server
│   ├── src/
│   │   ├── auth/              # Authentication & JWT management
│   │   ├── users/             # User management & roles
│   │   ├── portfolios/        # Portfolio management
│   │   ├── market-data/       # Market data integration
│   │   ├── market-news/       # Financial news aggregation
│   │   ├── economic-events/   # Economic calendar
│   │   ├── transactions/      # Transaction tracking
│   │   ├── signals/           # Trading signals
│   │   ├── subscriptions/     # User subscriptions
│   │   ├── notifications/     # Notification system
│   │   ├── profiles/          # User profiles
│   │   ├── challenges/        # Investment challenges
│   │   ├── portfolio-assets/  # Asset management
│   │   ├── migrations/        # Database migrations
│   │   └── scripts/           # Utility scripts
│   ├── uploads/               # File uploads (avatars, etc.)
│   ├── test/                  # Test files
│   └── dist/                  # Compiled JavaScript
├── frontend/                  # Next.js Frontend
│   ├── app/                   # Next.js 13+ App Router
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── types/                 # TypeScript type definitions
│   ├── styles/                # Global styles
│   └── public/                # Static assets
└── docs/                      # Documentation files
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **MySQL** or **PostgreSQL** database
- **PM2** (for production deployment)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ivrex
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install
# or
pnpm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database and API credentials

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or
pnpm install

# Copy environment file and configure
cp .env.local.example .env.local
# Edit .env.local with your API endpoints

# Start development server
npm run dev
```

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=ivrex_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# Email Configuration (for notifications)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# API Keys (Financial Data Providers)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FMP_API_KEY=your_fmp_key
MARKETAUX_API_KEY=your_marketaux_key
FRED_API_KEY=your_fred_key

# Application Settings
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# External Services
NEXT_PUBLIC_DERIV_API_URL=wss://ws.binaryws.com/websockets/v3
```

## 🗄️ Database Setup

### 1. Create Database

```sql
CREATE DATABASE ivrex_db;
CREATE USER 'ivrex_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ivrex_db.* TO 'ivrex_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Run Migrations

```bash
cd backend
npm run migration:run
```

### 3. Seed Initial Data (Optional)

```bash
npm run seed
```

## 👥 User Management & Roles

### User Roles

- **USER**: Standard user with basic portfolio access
- **ADMIN**: Administrative privileges with user management capabilities


## 🔧 Development

### Backend Development

```bash
cd backend

# Start in development mode with hot reload
npm run start:dev

# Run tests
npm run test
npm run test:e2e

# Lint and format
npm run lint
npm run format

# Build for production
npm run build
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

### Database Operations

```bash
cd backend

# Generate new migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

## 🚀 Production Deployment

### Using PM2 (Recommended)

#### 1. Build Applications

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

#### 2. PM2 Configuration

Create `ecosystem.config.js` in the project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'ivrex-backend',
      cwd: './backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'ivrex-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
```

#### 3. Deploy with PM2

```bash
# Start all applications
pm2 start ecosystem.config.js

# Monitor applications
pm2 monit

# View logs
pm2 logs

# Restart applications
pm2 restart all

# Stop applications
pm2 stop all

# Save PM2 configuration
pm2 save
pm2 startup
```

### Manual Deployment

#### Backend

```bash
cd backend
npm run build
NODE_ENV=production npm run start:prod
```

#### Frontend

```bash
cd frontend
npm run build
npm start
```

## 🔌 API Documentation

### Authentication Endpoints

```
POST /auth/signup     - User registration
POST /auth/login      - User login
POST /auth/logout     - User logout
POST /auth/refresh    - Refresh JWT token
GET  /auth/profile    - Get user profile
```

### User Management

```
GET    /users         - Get all users (Admin only)
GET    /users/:id     - Get user by ID
POST   /users         - Create user
PATCH  /users/:id     - Update user
DELETE /users/:id     - Delete user
PATCH  /users/:id/permissions - Update user permissions (Admin only)
```

### Portfolio Management

```
GET    /portfolios         - Get user portfolios
POST   /portfolios         - Create portfolio
GET    /portfolios/:id     - Get portfolio details
PATCH  /portfolios/:id     - Update portfolio
DELETE /portfolios/:id     - Delete portfolio
```

### Market Data

```
GET /market-data/stocks/:symbol    - Get stock data
GET /market-data/forex/:pair       - Get forex data
GET /market-data/crypto/:symbol    - Get cryptocurrency data
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
cd frontend

# Run tests (if configured)
npm run test
```

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Application logs
pm2 logs ivrex-backend
pm2 logs ivrex-frontend

# System information
pm2 info ivrex-backend
```

### Log Files

- Backend logs: `backend/logs/`
- PM2 logs: `~/.pm2/logs/`

## 🔒 Security Considerations

- **JWT Tokens**: Secure secret keys and appropriate expiration times
- **Password Hashing**: bcrypt with salt rounds (10)
- **CORS**: Properly configured for production domains
- **Environment Variables**: Never commit sensitive data to version control
- **Input Validation**: All inputs validated using class-validator
- **Rate Limiting**: Implement rate limiting for API endpoints
- **HTTPS**: Use HTTPS in production

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in `.env`
   - Ensure database server is running
   - Verify network connectivity

2. **JWT Token Issues**
   - Check JWT_SECRET configuration
   - Verify token expiration settings
   - Clear browser localStorage/cookies

3. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3001
   
   # Kill process
   kill -9 <PID>
   ```

4. **PM2 Process Issues**
   ```bash
   # Restart all processes
   pm2 restart all
   
   # Delete and restart
   pm2 delete all
   pm2 start ecosystem.config.js
   ```

### Debug Mode

```bash
# Backend debug mode
cd backend
npm run start:debug

# Frontend debug mode
cd frontend
DEBUG=* npm run dev
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Built with ❤️ by the IVREX Team**
