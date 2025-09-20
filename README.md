# 📚 E-Book Store Server

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

A robust, scalable backend server for an E-Book Store application built with modern JavaScript technologies. Features comprehensive ebook management, user authentication, payment processing, and real-time notifications.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Email verification system
- CSRF protection
- Rate limiting
- Role-based access control (User/Author/Admin)

### 📖 Book Management
- EPUB file upload and validation
- Cloud storage integration (Cloudinary)
- Book metadata management
- Access control and DRM
- Reading progress tracking
- Recommendation system

### 🛒 E-commerce Features
- Shopping cart functionality
- Stripe payment integration
- Order history and management
- Purchase verification

### 👥 User Management
- Author registration and profiles
- User reviews and ratings
- Reading history
- Notification system

### 🛠️ Developer Experience
- TypeScript for type safety
- Ultracite for code quality
- Winston logging
- Comprehensive error handling
- Health check endpoints

## 🏗️ Architecture

This application follows a modular, layered architecture:

```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic layer
├── models/          # Database schemas
├── middlewares/     # Express middlewares
├── routes/          # API route definitions
├── utils/           # Helper functions
├── validators/      # Input validation
├── config/          # Configuration files
└── types/           # TypeScript type definitions
```

### Design Patterns
- **Service Layer Pattern**: Business logic separated from controllers
- **Repository Pattern**: Data access abstraction
- **Middleware Pattern**: Request/response processing
- **Validation Pipeline**: Input sanitization and validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/bun
- MongoDB 5+
- Cloudinary account (for file storage)
- Mailtrap account (for email testing)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sachinthapa572/e-book-store--Server-.git
   cd e-book-store--Server-
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```


4. **Database Setup**
   ```bash
   # Start MongoDB
   mongod

   # Seed initial data (if available)
   bun run seed
   ```

5. **Start Development Server**
   ```bash
   bun run dev
   # Server will start on http://localhost:3000
   ```

## 📋 Available Scripts

```bash
# Development
bun run dev          # Start with hot reload
bun run debug        # Debug mode with ts-node

# Production
bun start            # Start production server

# Code Quality
bun run check        # Lint and type check
bun run fix          # Auto-fix issues
bun run prettier     # Format code

# Database
bun run seed         # Seed database
bun run clean        # Clean dependencies
```


## 🧪 Testing

```bash
# Run tests
bun test

# Run tests with coverage
bun run test:coverage

# Run e2e tests
bun run test:e2e
```


## 👨‍💻 Author

**Sachin Thapa**
- GitHub: [@sachinthapa572](https://github.com/sachinthapa572)


## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB for the robust database
- Cloudinary for file storage solutions
- All contributors and the open-source community

---

⭐ **Star this repo** if you find it helpful!
