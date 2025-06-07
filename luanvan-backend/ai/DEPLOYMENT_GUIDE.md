# Hướng Dẫn Triển Khai Production

## 1. Yêu Cầu Hệ Thống

### 1.1. Server Requirements
- **OS**: Ubuntu 20.04 LTS hoặc mới hơn
- **CPU**: Tối thiểu 2 cores
- **RAM**: Tối thiểu 4GB
- **Storage**: Tối thiểu 20GB
- **Network**: Public IP với ports 80, 443, 22 mở

### 1.2. Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Nginx (cho reverse proxy)
- Certbot (cho SSL certificate)
- Git

## 2. Chuẩn Bị Môi Trường

### 2.1. Cài Đặt Docker
```bash
# Update package index
sudo apt update

# Install dependencies
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

# Install Docker
sudo apt update
sudo apt install docker-ce

# Add user to docker group
sudo usermod -aG docker ${USER}
```

### 2.2. Cài Đặt Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2.3. Cài Đặt Nginx
```bash
sudo apt install nginx
```

## 3. Clone và Cấu Hình Project

### 3.1. Clone Repository
```bash
cd /opt
sudo git clone https://github.com/quangtruong2003/luanvan-fullstack
cd luanvan
```

### 3.2. Tạo Environment File
```bash
sudo nano .env
```

Nội dung file .env:
```env
# Database
MYSQL_ROOT_PASSWORD=strong_password_here
MYSQL_PASSWORD=another_strong_password

# JWT
JWT_SECRET=your_production_jwt_secret_min_256_bits
JWT_EXPIRATION=86400000

# Email
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Momo Payment
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_RETURN_URL=https://yourdomain.com/payment/return
MOMO_NOTIFY_URL=https://yourdomain.com/api/payments/momo/notify

# VNPay Payment
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_RETURN_URL=https://yourdomain.com/payment/return

# Clerk
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 4. Cấu Hình Nginx

### 4.1. Tạo Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/luanvan
```

Nội dung:
```nginx
upstream backend {
    server localhost:8080;
}

upstream frontend {
    server localhost:5173;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # API Backend
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Actuator endpoints (restrict access)
    location /actuator {
        proxy_pass http://backend;
        allow 127.0.0.1;
        deny all;
    }

    # Swagger UI
    location /swagger-ui {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    client_max_body_size 10M;
}
```

### 4.2. Enable Site và Restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/luanvan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. Cài Đặt SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## 6. Deploy Application

### 6.1. Build và Start Services
```bash
cd /opt/luanvan
sudo docker-compose -f docker-compose.yml up -d --build
```

### 6.2. Kiểm Tra Logs
```bash
# Backend logs
sudo docker logs luanvan-backend -f

# MySQL logs
sudo docker logs luanvan-mysql -f

# All services
sudo docker-compose logs -f
```

## 7. Monitoring và Maintenance

### 7.1. Health Check
```bash
# Check service health
curl https://yourdomain.com/api/actuator/health

# Check metrics
curl https://yourdomain.com/api/actuator/metrics
```

### 7.2. Backup Database
```bash
# Create backup script
sudo nano /opt/backup-mysql.sh
```

Script content:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="luanvan-mysql"

mkdir -p $BACKUP_DIR
docker exec $CONTAINER mysqldump -u root -p$MYSQL_ROOT_PASSWORD luanvan_db > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### 7.3. Setup Cron Jobs
```bash
sudo crontab -e
```

Add:
```cron
# Database backup daily at 2 AM
0 2 * * * /opt/backup-mysql.sh

# Restart services weekly
0 3 * * 0 cd /opt/luanvan && docker-compose restart
```

## 8. Security Hardening

### 8.1. Firewall Configuration
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 8.2. Fail2ban Installation
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 8.3. Security Headers
Add to Nginx configuration:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 9. Troubleshooting

### 9.1. Container Issues
```bash
# Restart all containers
sudo docker-compose restart

# Rebuild specific service
sudo docker-compose up -d --build backend

# View container logs
sudo docker-compose logs -f [service-name]
```

### 9.2. Database Connection Issues
```bash
# Check MySQL container
sudo docker exec -it luanvan-mysql mysql -u root -p

# Test connection from backend
sudo docker exec -it luanvan-backend ping mysql
```

### 9.3. Memory Issues
```bash
# Check memory usage
sudo docker stats

# Clean up unused resources
sudo docker system prune -a
```

## 10. Performance Tuning

### 10.1. MySQL Configuration
Create custom MySQL config:
```bash
sudo nano mysql-custom.cnf
```

Content:
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_size = 32M
query_cache_type = 1
```

### 10.2. JVM Tuning
Modify Dockerfile:
```dockerfile
ENTRYPOINT ["java", "-Xms512m", "-Xmx2g", "-jar", "app.jar"]
```

## 11. Monitoring Setup

### 11.1. Install Prometheus + Grafana (Optional)
```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3000:3000"
```

### 11.2. Application Logs
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/luanvan

/opt/luanvan/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

## 12. CI/CD Pipeline (GitHub Actions)

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
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/luanvan
            git pull origin main
            docker-compose down
            docker-compose up -d --build
```

## 13. Post-Deployment Checklist

- [ ] Verify all services are running
- [ ] Test API endpoints
- [ ] Check payment integration
- [ ] Verify email sending
- [ ] Test file upload/download
- [ ] Check SSL certificate
- [ ] Monitor logs for errors
- [ ] Verify backup scripts
- [ ] Test health endpoints
- [ ] Load testing
- [ ] Security scan 