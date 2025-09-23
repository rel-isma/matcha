# Matcha - Dating App Backend

A clean, well-structured authentication backend for the Matcha dating app built with Express.js, TypeScript, and PostgreSQL.

## 🚀 Features

- **User Registration** with email, username, first name, last name, and secure password validation
- **Email Verification** via unique verification links
- **User Login** with username and password
- **Password Reset** functionality via email
- **JWT Authentication** for secure session management
- **Rate Limiting** to prevent abuse
- **Input Validation** with comprehensive security checks
- **Password Security** that rejects common English words
- **API Documentation** with Swagger UI
- **Docker Support** for easy development and deployment

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/         # Database and Swagger configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Authentication, validation, rate limiting
│   ├── models/         # Database models
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions (auth, email, validation)
├── docker/             # Docker configuration and database initialization
├── Dockerfile          # Production Docker configuration
├── Dockerfile.dev      # Development Docker configuration
└── package.json        # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Gmail account (for email functionality)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd matcha
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Email Configuration (Required for verification/reset emails)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Gmail App Password

# JWT Secrets (Change in production!)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
```

### 3. Start Development Environment

```bash
# Option 1: Use the setup script (recommended)
./scripts/setup-dev.sh

# Option 2: Manual start
docker-compose -f docker-compose.dev.yml up --build
```

### 4. Access Services

- **API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Database Admin**: http://localhost:8080 (Adminer)
  - Server: `postgres`
  - Username: `matcha_user`
  - Password: `matcha_password`
  - Database: `matcha_db`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/auth/register` | Register new user | 5/15min |
| POST | `/api/auth/login` | User login | 5/15min |
| POST | `/api/auth/verify` | Verify email address | None |
| POST | `/api/auth/forgot-password` | Request password reset | 3/hour |
| POST | `/api/auth/reset-password` | Reset password with token | None |
| GET | `/api/auth/me` | Get current user info | Protected |
| POST | `/api/auth/logout` | User logout | Protected |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api-docs` | API documentation |

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Cannot contain common English words

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Password Reset**: 3 requests per hour

### Security Headers
- Helmet.js for security headers
- CORS configured for frontend domain
- JWT tokens with expiration
- Bcrypt password hashing (12 rounds)

## 🐳 Docker Commands

### Development
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

### Production
```bash
# Start production services (without Adminer)
docker-compose up -d

# Start with Adminer for debugging
docker-compose --profile dev up -d
```

## 🧪 Testing the API

### Using Swagger UI
1. Go to http://localhost:5000/api-docs
2. Try the endpoints directly in the browser
3. Use the "Authorize" button for protected endpoints

### Using curl

#### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "password": "SecurePass123!"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
3. Use the generated password in `EMAIL_PASSWORD`

### Email Templates
- **Verification**: Welcome email with verification link
- **Password Reset**: Secure reset link with 1-hour expiration

## 🗃️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) UNIQUE NOT NULL,
    username VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Development

### Local Development (without Docker)
```bash
cd backend
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Code Quality
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm test              # Run tests (when implemented)
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
DB_PASSWORD=secure-production-password
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=your-production-app-password
```

### Docker Production Build
```bash
docker-compose up -d
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running: `docker-compose logs postgres`
   - Check database credentials in `.env`

2. **Email Not Sending**
   - Verify Gmail App Password is correct
   - Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

3. **CORS Issues**
   - Update `FRONTEND_URL` in `.env`
   - Ensure frontend URL matches exactly

4. **JWT Token Invalid**
   - Check `JWT_SECRET` configuration
   - Ensure token is included in Authorization header: `Bearer <token>`

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

## 📝 Next Steps

1. **Frontend Integration**: Connect your React/Next.js frontend
2. **Google OAuth**: Implement Google authentication (placeholder ready)
3. **Profile Management**: Add user profile endpoints
4. **File Upload**: Add avatar/photo upload functionality
5. **Email Templates**: Customize email designs
6. **Testing**: Add comprehensive unit and integration tests
7. **Monitoring**: Add logging and monitoring solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Happy Coding! 🚀**
