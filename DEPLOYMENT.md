# Health Beacon Guide - Deployment Guide

## 🚀 Production Deployment Guide

### Prerequisites
- Python 3.12+
- Node.js 18+
- MongoDB (cloud or local)
- Google Gemini API key
- SSL certificates for HTTPS
- Domain name configured

### 📋 Deployment Checklist

#### 1. Backend Deployment

**Environment Setup:**
```bash
cd backend-fastapi
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Variables:**
Create `.env` file in `backend-fastapi/`:
```properties
# Database
MONGODB_URI=your_production_mongodb_uri

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
MOCK_GEMINI=false

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Server Configuration
HOST=0.0.0.0
PORT=8002
ENVIRONMENT=production
```

**Start Backend with Production Server:**
```bash
# Using Gunicorn for production
pip install gunicorn
gunicorn app.main:app -w 4 -b 0.0.0.0:8002 --access-logfile - --error-logfile -

# Or using Uvicorn with multiple workers
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --workers 4
```

#### 2. Frontend Deployment

**Build for Production:**
```bash
cd frontend
npm install
npm run build
```

**Environment Variables:**
Create `.env.production` file in `frontend/`:
```properties
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_ENVIRONMENT=production
```

**Deployment Options:**

**Option A: Vercel (Recommended for React)**
```bash
npm install -g vercel
vercel --prod
```

**Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option C: Docker Container**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

#### 3. Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
```

**Docker Compose:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend-fastapi
    ports:
      - "8002:8002"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - CORS_ORIGINS=${CORS_ORIGINS}
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://backend:8002/api

volumes:
  mongo_data:
```

#### 4. Nginx Reverse Proxy Configuration

Create `nginx.conf`:
```nginx
upstream backend {
    server backend:8002;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin $http_origin;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, DELETE, PUT";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }

    # API Documentation
    location /docs {
        proxy_pass http://backend/docs;
        proxy_set_header Host $host;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### 5. MongoDB Atlas Setup

1. Create account at mongodb.com/cloud/atlas
2. Create a cluster
3. Configure network access (IP whitelist)
4. Get connection string
5. Update `MONGODB_URI` in `.env`

#### 6. SSL/TLS Certificate Setup

**Using Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 7. Health Checks & Monitoring

**Health Check Endpoint:**
```bash
curl https://yourdomain.com/api/health
```

**Monitoring Tools:**
- **PM2** for process management:
  ```bash
  npm install -g pm2
  pm2 start "python -m uvicorn app.main:app" --name health-beacon
  pm2 save
  pm2 startup
  ```

- **DataDog** for performance monitoring
- **Sentry** for error tracking

#### 8. Performance Optimization

**Backend:**
- Enable caching for API responses
- Implement rate limiting
- Use connection pooling for MongoDB
- Enable gzip compression

**Frontend:**
- Code splitting with dynamic imports
- Image optimization
- Lazy loading components
- CDN distribution

#### 9. Security Checklist

- ✅ HTTPS/SSL enabled
- ✅ Environment variables secured (not in code)
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input validation on all endpoints
- ✅ Medical disclaimers visible
- ✅ Data encryption at rest
- ✅ Regular security audits

#### 10. CI/CD Pipeline with GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          # Add your deployment commands
          echo "Deploying backend..."
      
      - name: Deploy Frontend
        run: |
          # Add your deployment commands
          echo "Deploying frontend..."
      
      - name: Run Tests
        run: |
          # Add your test commands
          echo "Running tests..."
```

### 📊 Deployment Platforms

#### Heroku
```bash
heroku create health-beacon
git push heroku main
heroku config:set GEMINI_API_KEY=your_key
```

#### AWS
- EC2 for backend
- S3 + CloudFront for frontend
- RDS for MongoDB (or DocumentDB)
- Route 53 for DNS

#### Google Cloud
- Cloud Run for backend
- Cloud Storage + CDN for frontend
- MongoDB Atlas for database

#### DigitalOcean
- App Platform for deployment
- Spaces for static files
- Managed Database for MongoDB

### 🔄 Continuous Deployment

1. Push to main branch
2. GitHub Actions triggered
3. Tests run automatically
4. Build production bundle
5. Deploy to production environment
6. Health checks verify deployment

### 📈 Post-Deployment

1. Monitor error logs
2. Check performance metrics
3. Verify API functionality
4. Test frontend loading
5. Monitor user sessions
6. Set up alerts for failures

### 🆘 Troubleshooting

**Backend not responding:**
- Check MongoDB connection
- Verify environment variables
- Check Gemini API key validity
- Review server logs

**Frontend not loading:**
- Clear CDN cache
- Check build output
- Verify API Base URL
- Check browser console

**API errors:**
- Check CORS configuration
- Verify request format
- Check payload size
- Review error logs

### 📞 Support & Monitoring

- Set up error tracking (Sentry)
- Configure logging (ELK stack)
- Set up uptime monitoring
- Configure alert notifications
- Document runbook for incidents

---

**Last Updated**: November 3, 2025
**Version**: 1.0
**Status**: Production Ready