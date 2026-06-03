# Deployment Guide

## Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 13+ installed with pgvector
- [ ] OpenAI API key obtained
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Dependencies installed and verified

## Step 1: Database Setup

### Install PostgreSQL (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install pgvector Extension
```bash
sudo apt-get install build-essential postgresql-server-dev-13

git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Enable extension
sudo -u postgres psql -c "CREATE EXTENSION vector;"
```

### Create Database and User
```bash
sudo -u postgres psql
```

```sql
-- Create database
CREATE DATABASE rag_assistant;

-- Create user
CREATE USER rag_user WITH PASSWORD 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rag_assistant TO rag_user;

-- Connect to database
\c rag_assistant

-- Enable pgvector
CREATE EXTENSION vector;

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO rag_user;
```

### Verify Setup
```bash
psql -U rag_user -d rag_assistant -h localhost
\d  # List tables (should be empty initially)
```

## Step 2: Environment Configuration

### Create .env File
```bash
cd server
cp .env.example .env
```

### Edit server/.env
```env
NODE_ENV=production
PORT=5000

DATABASE_URL=postgresql://rag_user:secure_password@localhost:5432/rag_assistant
DB_HOST=localhost
DB_PORT=5432
DB_USER=rag_user
DB_PASSWORD=secure_password
DB_NAME=rag_assistant

OPENAI_API_KEY=sk-your-api-key-here

CORS_ORIGIN=https://yourdomain.com

MAX_CHUNK_SIZE=1000
CHUNK_OVERLAP=200
SIMILARITY_THRESHOLD=0.3
TOP_K_RESULTS=5
RERANKING_ENABLED=false
```

### Create .env for Client
```bash
cd client
touch .env.local
```

```env
VITE_API_URL=https://api.yourdomain.com
```

## Step 3: Application Setup

### Install Dependencies
```bash
# Root level
npm install

# Backend
cd server && npm install && cd ..

# Frontend
cd client && npm install && cd ..
```

### Database Migrations
```bash
npm run db:migrate
```

### Build Frontend
```bash
npm run client:build
```

## Step 4: Production Deployment

### Option 1: Using PM2 (Recommended for Single Server)

#### Install PM2
```bash
npm install -g pm2
```

#### Start Application
```bash
cd server
pm2 start index.js --name "rag-server" --env production

cd ../client
pm2 start --name "rag-client" npm -- run dev

pm2 save
pm2 startup
```

#### Monitor Application
```bash
pm2 logs rag-server
pm2 monit
pm2 status
```

### Option 2: Using Docker (Recommended for Containers)

#### Create Dockerfile for Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm ci --production
RUN cd server && npm ci --production && cd ..

COPY server ./server
COPY client/dist ./public

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server/index.js"]
```

#### Create Docker Compose
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: rag_user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: rag_assistant
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    environment:
      DATABASE_URL: postgresql://rag_user:password@postgres:5432/rag_assistant
      NODE_ENV: production
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "5000:5000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

#### Deploy with Docker
```bash
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend npm run db:migrate
```

### Option 3: Using Cloud (AWS, GCP, Azure)

#### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Initialize EB
eb init -p node.js-18 rag-assistant

# Create environment
eb create rag-prod

# Deploy
eb deploy

# Monitor
eb logs
```

#### GCP Cloud Run
```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/rag-server

# Deploy
gcloud run deploy rag-server \
  --image gcr.io/PROJECT_ID/rag-server \
  --platform managed \
  --region us-central1 \
  --set-env-vars OPENAI_API_KEY=sk-...
```

## Step 5: Reverse Proxy Setup (Nginx)

### Install Nginx
```bash
sudo apt-get install nginx
```

### Configure Nginx
```nginx
# /etc/nginx/sites-available/rag-assistant

upstream backend {
  server localhost:5000;
  keepalive 64;
}

server {
  listen 80;
  server_name api.yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json;

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
  limit_req zone=api burst=20 nodelay;

  location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/rag-assistant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx

sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Step 6: Monitoring and Maintenance

### Application Monitoring
```bash
# System metrics
top
free -h
df -h
iostat -x 1

# Application health
curl http://localhost:5000/health

# Database connections
sudo -u postgres psql -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

### Log Rotation
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/rag-assistant
```

```
/var/log/rag-assistant/*.log {
  daily
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 nobody nobody
  sharedscripts
  postrotate
    pm2 restart rag-server
  endscript
}
```

### Database Backups
```bash
# Manual backup
pg_dump -U rag_user -h localhost rag_assistant > backup.sql

# Restore from backup
psql -U rag_user -h localhost rag_assistant < backup.sql

# Automated backups (cron)
0 2 * * * /usr/bin/pg_dump -U rag_user -h localhost rag_assistant | gzip > /backups/rag_$(date +\%Y\%m\%d).sql.gz
```

### Update Dependencies
```bash
# Check for vulnerabilities
npm audit

# Update packages
npm update
npm audit fix

# Test updates
npm test
```

## Step 7: Performance Tuning

### PostgreSQL Configuration
```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

```conf
# Connection settings
max_connections = 200
shared_buffers = 256MB

# Memory settings
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Query optimization
random_page_cost = 1.1
effective_io_concurrency = 200

# WAL settings
wal_buffers = 16MB
default_statistics_target = 100
```

### Application Configuration
```bash
# Increase file descriptors
ulimit -n 65535

# Increase network backlog
sysctl -w net.core.somaxconn=65535
```

### Caching Strategy
```javascript
// Increase cache size in production
const CACHE_SIZE = 50000;  // Up from 10000
const TTL_MINUTES = 120;   // Up from 60
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql -U rag_user -h localhost -d rag_assistant

# Check if postgres is running
sudo systemctl status postgresql

# View connection attempts
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Application Won't Start
```bash
# Check logs
pm2 logs rag-server

# Verify environment variables
env | grep DATABASE_URL
env | grep OPENAI_API_KEY

# Check port availability
lsof -i :5000
```

### High Memory Usage
```bash
# Check which process
ps aux | grep node

# Check database queries
sudo -u postgres psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Clear query cache if needed
psql -c "DISCARD PLANS;"
```

### Slow Queries
```bash
# Enable slow query log
sudo -u postgres psql
SET log_min_duration_statement = 1000;

# Analyze query
EXPLAIN ANALYZE SELECT ... FROM ...;
```

## Security Hardening

### API Security
```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Validate input
const { body, validationResult } = require('express-validator');

// Set secure headers
app.use(helmet());
```

### Database Security
```sql
-- Create limited user for application
CREATE USER app_user WITH PASSWORD 'complex_password';
GRANT CONNECT ON DATABASE rag_assistant TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;

-- Disable superuser for daily operations
ALTER USER rag_user NOCREATEDB NOCREATEROLE;
```

### System Security
```bash
# Enable UFW firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp

# SSH hardening
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

## Rollback Procedure

### Application Rollback
```bash
# Using PM2
pm2 save
pm2 kill
git revert HEAD~1
npm install
pm2 resurrect
```

### Database Rollback
```bash
# Using backup
psql -U rag_user -d rag_assistant < backup_before_change.sql
```

## Success Criteria

- ✓ Application accessible at domain
- ✓ API responding within 200ms P95
- ✓ Database queries completing in <100ms
- ✓ Zero downtime during peak load
- ✓ Backups working and restorable
- ✓ Monitoring and alerts active
- ✓ Logs being retained and rotated
