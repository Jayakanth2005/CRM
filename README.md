# Fastor7 CRM Backend

A robust CRM backend system built with Node.js, Express, PostgreSQL, and Docker following clean architecture principles.

## 🚀 Features

- **Employee Management**: Complete registration and authentication system
- **Lead Management**: Public enquiry submission with employee claiming system
- **Security First**: JWT authentication, input validation, rate limiting, and security middleware
- **Clean Architecture**: Modular design with separation of concerns
- **Database Management**: PostgreSQL with Sequelize ORM and proper relationships
- **Testing**: Comprehensive test coverage with Jest and Supertest
- **Docker Ready**: Full containerization with Docker Compose
- **API Documentation**: Complete REST API with consistent response formats
- **Rate Limiting**: Protection against spam and abuse
- **Error Handling**: Centralized error handling with proper HTTP status codes

## 🛠 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15 with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose
- **Process Management**: Graceful shutdown handling

## 📋 Prerequisites

### For Docker Setup (Recommended)
- Docker 20.0+ 
- Docker Compose 2.0+

### For Local Setup
- Node.js 18.0.0 or higher
- PostgreSQL 13+
- npm 8+ or yarn 1.22+

## 🚀 Quick Start

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CRM-Nodejs
   ```

2. **Environment setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # The default .env works with Docker setup
   ```

3. **Start the application**
   ```bash
   # Build and start all services
   docker-compose up --build
   
   # Or run in background
   docker-compose up -d --build
   ```

4. **Verify installation**
   ```bash
   # Check API health
   curl http://localhost:3000/api/health
   
   # Should return: {"status":"ok","timestamp":"...","uptime":...,"database":"connected"}
   ```

5. **Run tests**
   ```bash
   docker-compose run --rm test
   ```

### Option 2: Local Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd CRM-Nodejs
   npm install
   ```

2. **Database setup**
   ```bash
   # Install PostgreSQL (Ubuntu/Debian)
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # Or use Homebrew (macOS)
   brew install postgresql
   brew services start postgresql
   
   # Create database
   sudo -u postgres createdb fastor7_crm
   
   # Or using psql
   sudo -u postgres psql
   CREATE DATABASE fastor7_crm;
   CREATE DATABASE fastor7_crm_test;  -- For testing
   \q
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your local database credentials:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=fastor7_crm
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## 📁 Project Structure

