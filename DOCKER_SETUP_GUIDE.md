# Docker Setup Guide - Hotstar Microservices

## 🔧 What Was Fixed

### 1. MongoDB Configuration
- **Issue**: docker-compose.yml had a local MongoDB container defined
- **Fix**: Removed MongoDB service and volumes since you're using MongoDB Atlas
- **Impact**: All services now connect to MongoDB Atlas using `MONGO_URI` from .env file

### 2. Service Dependencies
- **Issue**: Services had healthcheck dependencies on MongoDB
- **Fix**: Removed MongoDB dependencies, kept RabbitMQ dependencies only
- **Impact**: Services start faster without waiting for local MongoDB

### 3. Environment Variables
- **Issue**: MONGO_URI was hardcoded for local MongoDB
- **Fix**: Updated all services to use `${MONGO_URI}` from .env
- **Impact**: Easy to switch between local and cloud MongoDB

### 4. Frontend Dockerfile
- **Issue**: Next.js build output path was incorrect (`/app/build` doesn't exist)
- **Fix**: Implemented standalone build mode with proper multi-stage build
- **Impact**: Frontend now builds correctly and runs as a standalone Node.js app

### 5. Next.js Configuration
- **Issue**: Missing standalone output configuration
- **Fix**: Added `output: 'standalone'` to next.config.js
- **Impact**: Enables production-ready Docker deployment

### 6. RabbitMQ Configuration
- **Issue**: Missing authentication configuration
- **Fix**: Added default credentials with environment variable support
- **Impact**: RabbitMQ is now properly secured

### 7. Port Mappings
- **Issue**: Frontend port was inconsistent
- **Fix**: Standardized to 3000:3000 for frontend
- **Impact**: Consistent port configuration across all services

---

## 📋 Final docker-compose.yml Structure

```
Services:
├── rabbitmq (port 5672, 15672) - Message broker
├── api-gateway (port 5000) - API Gateway
├── auth-service (port 5001) - Authentication
├── user-service (port 5002) - User management
├── video-service (port 5003) - Video management
├── notification-service (port 5006) - Email notifications
├── streaming-service (port 5005) - Video streaming
└── frontend (port 3000) - Next.js frontend

External Services:
├── MongoDB Atlas (cloud) - Database
└── AWS S3 (cloud) - Video storage
```

---

## 🚀 How to Run

### Step 1: Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
# IMPORTANT: Update MONGO_URI with your MongoDB Atlas connection string
```

### Step 2: Start All Services
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### Step 3: Verify Services
```bash
# Check all containers are running
docker-compose ps

# View logs for a specific service
docker-compose logs -f auth-service
docker-compose logs -f api-gateway
docker-compose logs -f frontend
```

---

## 🔍 Debug Commands

### Check Container Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs auth-service
docker-compose logs video-service
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f api-gateway
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart auth-service
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Execute Commands in Container
```bash
# Access a container shell
docker-compose exec auth-service sh
docker-compose exec api-gateway sh

# Run a command
docker-compose exec auth-service node -v
```

---

## ⚠️ Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution**: 
- Verify your MONGO_URI in .env is correct
- Ensure your MongoDB Atlas cluster allows access from your IP
- Check network connectivity

### Issue: RabbitMQ Connection Failed
**Solution**:
- Wait for RabbitMQ to fully start (takes 10-20 seconds)
- Check RabbitMQ logs: `docker-compose logs rabbitmq`
- Verify RabbitMQ is healthy: `docker-compose ps`

### Issue: Service Not Starting
**Solution**:
- Check logs: `docker-compose logs <service-name>`
- Verify environment variables in .env
- Check for port conflicts on your machine

### Issue: Frontend Build Failed
**Solution**:
- Ensure `output: 'standalone'` is in next.config.js
- Check Node.js version compatibility
- Clear Docker cache: `docker-compose build --no-cache frontend`

### Issue: Cannot Access Services
**Solution**:
- Verify services are running: `docker-compose ps`
- Check port mappings in docker-compose.yml
- Ensure firewall allows the ports

---

## 📦 Environment Variables Reference

Create a `.env` file with these variables:

```env
# MongoDB Atlas (REQUIRED)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hotstar?retryWrites=true&w=majority

# JWT Secret (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key

# AWS S3 (for video storage)
AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name

# Email Service (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password

# RabbitMQ (optional, defaults provided)
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=password
```

---

## 🌐 Access Points

Once running, you can access:

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:5000
- **RabbitMQ Management**: http://localhost:15672 (admin/password)
- **Auth Service**: http://localhost:5001
- **User Service**: http://localhost:5002
- **Video Service**: http://localhost:5003
- **Streaming Service**: http://localhost:5005
- **Notification Service**: http://localhost:5006

---

## 🛡️ Production Tips

1. **Security**
   - Change default RabbitMQ credentials
   - Use strong JWT secrets
   - Enable MongoDB Atlas IP whitelisting
   - Use environment-specific .env files

2. **Performance**
   - Use Docker image caching
   - Implement service healthchecks
   - Add load balancing for API Gateway
   - Use CDN for static assets

3. **Monitoring**
   - Add logging aggregation (ELK, etc.)
   - Implement metrics collection (Prometheus)
   - Set up alerts for service failures
   - Monitor RabbitMQ queues

4. **Scaling**
   - Use Docker Swarm or Kubernetes for orchestration
   - Implement horizontal scaling for stateless services
   - Use Redis for caching
   - Consider CDN for video streaming

---

## 📝 Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| docker-compose.yml | Removed MongoDB service | Using MongoDB Atlas |
| docker-compose.yml | Updated MONGO_URI to use env var | Cloud MongoDB support |
| docker-compose.yml | Removed MongoDB dependencies | Faster startup |
| docker-compose.yml | Fixed frontend port mapping | Consistency |
| Dockerfile (frontend) | Implemented standalone build | Correct Next.js output |
| next.config.js | Added output: 'standalone' | Docker deployment |
| .env.example | Created | Template for env vars |

---

## ✅ Verification Checklist

Before running in production:

- [ ] Update MONGO_URI with your MongoDB Atlas connection string
- [ ] Change JWT_SECRET to a strong random value
- [ ] Configure AWS S3 credentials
- [ ] Set up email service credentials
- [ ] Update RabbitMQ credentials
- [ ] Test all services individually
- [ ] Verify service-to-service communication
- [ ] Test with docker-compose up --build
- [ ] Check logs for any errors
- [ ] Verify frontend can access backend APIs

---

## 🆘 Need Help?

If you encounter issues:

1. Check logs: `docker-compose logs`
2. Verify .env configuration
3. Ensure Docker Desktop is running
4. Check port availability
5. Review service dependencies

For detailed debugging:
```bash
# View all logs
docker-compose logs --tail=100

# Check service health
docker-compose ps

# Inspect a container
docker inspect hotstar-api-gateway
```
