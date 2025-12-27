# 📚 Bookzilla - Microservices Architecture

A production-ready bookstore backend built with microservices architecture.

## 🏗️ Architecture

```
┌─────────────────┐
│   API Gateway   │ :3000
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ Auth │  │ User │
│:3001 │  │:3008 │
└──────┘  └──────┘
    │         │
┌───▼─────────▼───┐
│    Catalog      │ :3002
│    Cart         │ :3003
│    Order        │ :3004
│    Payment      │ :3005
│    Review       │ :3007
│    Admin        │ :3009
│    Media        │ :3010
│    Notification │ :3006
└─────────────────┘
```

## 🚀 Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 3000 | Entry point, routing |
| Auth Service | 3001 | Authentication & JWT |
| Catalog Service | 3002 | Books, categories |
| Cart Service | 3003 | Shopping cart |
| Order Service | 3004 | Order management |
| Payment Service | 3005 | Payment processing |
| Notification Service | 3006 | Email, SMS, Push |
| Review Service | 3007 | Reviews & ratings |
| User Service | 3008 | User profiles |
| Admin Service | 3009 | Admin dashboard |
| Media Service | 3010 | File uploads |

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Containerization**: Docker

## 📦 Installation

```bash
# Install dependencies for all services
for dir in */; do
  if [ -f "$dir/package.json" ]; then
    echo "Installing $dir..."
    cd "$dir" && npm install && cd ..
  fi
done
```

## 🏃 Running the Application

### Using Docker (Recommended)
```bash
docker-compose up -d
```

### Running Individual Services
```bash
# Navigate to any service
cd auth-service

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## 🧪 Testing

```bash
# Test individual service
cd auth-service
npm test

# Test all services
npm run test:all
```

## 📝 Environment Variables

Each service has its own `.env` file. Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/bookzilla
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## 🔗 API Documentation

API documentation is available at:
- Swagger: http://localhost:3000/api-docs
- Postman Collection: `./postman/bookzilla.json`

## 📊 Monitoring

- RabbitMQ Management: http://localhost:15672
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License
