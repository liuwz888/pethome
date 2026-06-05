# PetHome Platform

A comprehensive pet service platform with e-commerce, ordering, and AI-powered content interaction capabilities.

## 🚀 Quick Start

### Development Setup

1. **Start Frontend** (in one terminal):
   ```bash
   cd frontend
   npm run dev
   # Runs on http://localhost:3001
   ```

2. **Start Backend** (in another terminal):
   ```bash
   cd backend
   mvn spring-boot:run
   # Runs on http://localhost:8080
   ```

3. **Test APIs**:
   ```bash
   node test-api.js
   ```

### Docker Deployment

```bash
docker-compose up -d
```

This will start:
- MySQL database on port 3306
- Spring Boot backend on port 8080  
- React frontend on port 3001

## 🏗️ Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.2 + Java 21
- **Database**: MySQL with JPA/Hibernate
- **Security**: JWT-ready authentication system
- **Real-time**: WebSocket support for live updates
- **AI Integration**: Claude API hooks for content moderation

### Frontend (React + TypeScript)
- **UI Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: CSS-in-JS with responsive design
- **State Management**: LocalStorage + Context API
- **API Client**: Axios for HTTP requests

## 📦 Key Features

### User System
- Role-based authentication (Admin, Supplier, Customer, Service Provider)
- Secure password encryption
- Session management

### Product Management
- CRUD operations for products
- Category filtering (Food, Toys, Accessories, Healthcare)
- Tag-based search and filtering
- Image support

### Order System
- Complete order lifecycle tracking
- Real-time status updates via WebSocket
- Shopping cart functionality
- Order history

### Payment Integration
- Multiple payment methods (Alipay, WeChat Pay, Offline)
- Transaction tracking
- Webhook-ready payment confirmation

### AI Content Features
- Content moderation and sentiment analysis
- Smart interaction capabilities
- Automated response generation

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `GET /api/products/category/{category}` - Filter by category
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}/status` - Update order status

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment details
- `POST /api/payments/confirm` - Confirm payment

### AI Content
- `POST /api/ai/analyze` - Analyze content sentiment
- `POST /api/ai/moderate` - Moderate content
- `POST /api/ai/chat` - Generate AI responses

## 🔧 Configuration

### Environment Variables
```env
ANTHROPIC_API_KEY=your_claude_api_key
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/pethome
SPRING_DATASOURCE_USERNAME=pethome
SPRING_DATASOURCE_PASSWORD=password
```

### Database Schema
The application uses MySQL with the following main tables:
- `users` - User accounts and roles
- `products` - Product catalog
- `orders` - Order management
- `payments` - Payment transactions
- `product_tags` - Product tagging system

## 🚀 Deployment

### Prerequisites
- Docker & Docker Compose
- MySQL 8.0+
- Node.js 18+ (for frontend development)

### Production Deployment
1. Set environment variables
2. Run `docker-compose up -d`
3. Configure reverse proxy (nginx recommended)
4. Set up SSL certificates

### Development
- Use `npm run dev` for frontend hot-reload
- Use `mvn spring-boot:run` for backend development
- Hot reloading available for both services

## 🧪 Testing

Run API tests:
```bash
node test-api.js
```

## 📱 Mobile Support

The platform is designed for mobile-first experience:
- Responsive layouts work on all screen sizes
- Touch-friendly interface elements
- Optimized for mobile browsing and ordering

## 🤖 AI Integration

The platform includes built-in AI capabilities:
- Content moderation using Claude API
- Sentiment analysis for user interactions
- Automated customer service responses
- Smart product recommendations

## 🔒 Security

- Password hashing with BCrypt
- CORS configuration for frontend-backend communication
- Input validation and sanitization
- Rate limiting ready for production deployment
- JWT token structure prepared for authentication

## 📈 Scalability

- Microservices-ready architecture
- Database connection pooling
- Caching strategy prepared
- Load balancing compatible
- Message queue integration points

---

**Next Steps:**
- Implement actual payment gateway integration
- Add mobile app (React Native)
- Deploy to cloud infrastructure
- Set up monitoring and logging
- Implement advanced AI features