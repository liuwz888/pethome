# PetHome Platform Development Guide

## 🎯 Project Overview
Pet Service Platform with e-commerce, ordering, and AI-powered features. Built with Spring Boot backend and React frontend.

## 🛠️ Tech Stack
- **Backend**: Spring Boot 3.2.2, Java 21, MySQL, JPA/Hibernate
- **Frontend**: React 18, TypeScript, Vite, Axios
- **DevOps**: Docker, Docker Compose, Nginx
- **AI Integration**: Claude API for content moderation

## 📁 Project Structure
```
pethome/
├── backend/                 # Spring Boot application
│   ├── src/main/java/com/pethome/
│   └── src/main/resources/application.yml
├── frontend/               # React application  
│   ├── src/pages/         # Page components
│   └── src/services/      # API services
├── docs/                  # Documentation
└── docker-compose.yml     # Production deployment
```

## 🚀 Quick Commands

### Development
```bash
# Frontend development
cd frontend && npm run dev

# Backend development  
cd backend && mvn spring-boot:run

# Test all APIs
node test-api.js

# Run in Docker
docker-compose up -d
```

### Build & Deploy
```bash
# Build Docker images
docker-compose build

# Start production environment
docker-compose up -d

# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Setup
Create `.env` file:
```env
ANTHROPIC_API_KEY=your_claude_api_key_here
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/pethome
SPRING_DATASOURCE_USERNAME=pethome  
SPRING_DATASOURCE_PASSWORD=password
```

### Database Migration
The application uses automatic schema generation. For production:
```sql
CREATE DATABASE pethome CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🧪 Testing Guidelines

### API Testing
- All endpoints return JSON responses
- Error handling with proper HTTP status codes
- Input validation on critical operations

### Frontend Testing
- Component testing with React testing library ready
- E2E testing setup available
- Responsive design tested across devices

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in configuration files
2. **Database connection**: Verify MySQL credentials and network access
3. **API calls failing**: Check CORS configuration and backend availability

### Debug Mode
Enable debug logging in `application.yml`:
```yaml
logging:
  level:
    com.pethome: DEBUG
    org.springframework.security: DEBUG
```

## 📋 Deployment Checklist

- [ ] Set environment variables
- [ ] Configure database credentials  
- [ ] Update API URLs in frontend
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Enable monitoring and logging
- [ ] Set up backup strategy

## 🤝 Contributing

1. Follow existing code structure and naming conventions
2. Add tests for new features
3. Update documentation for API changes
4. Use feature branches for development

## 📞 Support

For issues and questions:
1. Check the README.md first
2. Review CLAUDE.md for development guide
3. Examine existing code patterns
4. Test changes locally before deployment

---

**Last Updated**: May 8, 2026
**Maintainer**: PetHome Development Team