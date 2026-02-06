# FarmLokal Backend API

A scalable and production-ready RESTful API backend for FarmLokal, built with Node.js, Express, and MongoDB. This backend provides comprehensive product management, OAuth authentication, external API integration with resilience patterns, and advanced caching mechanisms.

## Features

### Core Functionality
- **Product Management**: Full CRUD operations with filtering, pagination, search, and autocomplete
- **Category Management**: Hierarchical category system with slug-based routing
- **Order Management**: Complete order processing with status tracking and payment integration
- **User Authentication**: OAuth 2.0 integration with Google and GitHub providers
- **JWT Authorization**: Secure token-based authentication with role-based access control

### Advanced Capabilities
- **Redis Caching**: Multi-tier caching strategy for improved performance
- **Circuit Breaker Pattern**: Fault-tolerant external API integration
- **Retry Logic**: Exponential backoff for transient failures
- **Rate Limiting**: IP-based request throttling to prevent abuse
- **Security Headers**: Helmet.js integration for enhanced security
- **CORS Configuration**: Flexible cross-origin resource sharing
- **Error Handling**: Centralized error management with detailed logging
- **API Documentation**: Interactive Swagger/OpenAPI documentation

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: Passport.js (OAuth 2.0)
- **Security**: Helmet, express-rate-limit, CORS
- **Logging**: Winston
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)
- npm or yarn package manager

## Installation

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd FarmLokal
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/farmlokal
REDIS_URL=redis://localhost:6379

JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

FRONTEND_URL=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

EXTERNAL_API_URL=https://fakestoreapi.com
```

4. Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:5000`

### Docker Deployment

1. Build and start containers:
```bash
docker-compose up -d
```

2. View logs:
```bash
docker-compose logs -f
```

3. Stop containers:
```bash
docker-compose down
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/logout` - Logout user (Protected)

### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/search/autocomplete` - Autocomplete search
- `GET /api/products/popular` - Get popular products

### External API
- `GET /api/external/supplier-products` - Fetch external supplier products
- `GET /api/external/status` - Get circuit breaker status

### System
- `GET /health` - Health check endpoint
- `GET /` - API information
- `GET /api/docs` - Swagger documentation

## Project Structure

```
FarmLokal/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js
│   │   ├── passport.js
│   │   ├── redis.js
│   │   └── swagger.js
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── externalController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── security.js
│   ├── models/          # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   └── Order.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── external.js
│   ├── services/        # Business logic
│   │   ├── cacheService.js
│   │   ├── circuitBreaker.js
│   │   ├── externalApi.js
│   │   └── retryService.js
│   ├── utils/           # Utility functions
│   │   └── logger.js
│   ├── app.js           # Express application
│   └── server.js        # Server entry point
├── tests/               # Test files
├── .env.example         # Environment template
├── .eslintrc.json       # ESLint configuration
├── .prettierrc          # Prettier configuration
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Docker image definition
├── jest.config.js       # Jest configuration
└── package.json         # Project dependencies
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Required |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Required |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Required |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | Required |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `EXTERNAL_API_URL` | External API base URL | `https://fakestoreapi.com` |

## Security Features

- **Helmet.js**: Sets security-related HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents brute-force attacks
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Mongoose schema validation
- **Error Sanitization**: Prevents information leakage

## Performance Optimization

- **Redis Caching**: Multi-level caching strategy
- **Database Indexing**: Optimized MongoDB indexes
- **Connection Pooling**: Efficient database connections
- **Compression**: Response compression middleware
- **Lean Queries**: Optimized Mongoose queries

## Error Handling

The API uses a centralized error handling system that:
- Catches all errors and formats them consistently
- Logs errors with Winston for debugging
- Returns appropriate HTTP status codes
- Sanitizes error messages in production

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Logging

Winston logger is configured with:
- Console transport for development
- File transport for production
- Structured JSON logging
- Log rotation for file management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the repository.

## Acknowledgments

- Express.js community
- MongoDB team
- Redis community
- All open-source contributors
