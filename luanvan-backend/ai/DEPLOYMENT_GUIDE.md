# Hướng Dẫn Triển Khai Production (Traditional Java)

## 1. Yêu Cầu Hệ Thống

### 1.1. Server Requirements
- **OS**: Ubuntu 20.04 LTS hoặc mới hơn
- **CPU**: Tối thiểu 2 cores
- **RAM**: Tối thiểu 4GB
- **Storage**: Tối thiểu 20GB
- **Network**: Public IP với ports 80, 443, 22, 8080, 3306 mở

### 1.2. Software Requirements
- Java JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Nginx (cho reverse proxy)
- Certbot (cho SSL certificate)
- Git
- Node.js 18+ (cho frontend)

## 2. Chuẩn Bị Môi Trường

### 2.1. Cài Đặt Java JDK 17
```bash
# Update package index
sudo apt update

# Install OpenJDK 17
sudo apt install openjdk-17-jdk

# Verify installation
java -version
javac -version

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
source ~/.bashrc
```

### 2.2. Cài Đặt Maven
```bash
# Install Maven
sudo apt install maven

# Verify installation
mvn -version
```

### 2.3. Cài Đặt MySQL
```bash
# Install MySQL Server
sudo apt install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Login to MySQL and create database
sudo mysql -u root -p
```

SQL commands:
```sql
CREATE DATABASE luanvan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'luanvan'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON luanvan_db.* TO 'luanvan'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.4. Cài Đặt Node.js
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -version
npm -version
```

### 2.5. Cài Đặt Nginx
```bash
sudo apt install nginx
```

## 3. Clone và Build Project

### 3.1. Clone Repository
```bash
cd /opt
sudo git clone https://github.com/quangtruong2003/luanvan-fullstack luanvan
cd luanvan
sudo chown -R $USER:$USER /opt/luanvan
```

### 3.2. Tạo Environment Variables
```bash
nano ~/.bashrc
```

Thêm vào cuối file:
```bash
# Luận văn environment variables
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/luanvan_db
export SPRING_DATASOURCE_USERNAME=luanvan
export SPRING_DATASOURCE_PASSWORD=your_password_here
export JWT_SECRET=your_production_jwt_secret_min_256_bits
export JWT_EXPIRATION=86400000
export MAIL_USERNAME=your_email@gmail.com
export MAIL_PASSWORD=your_app_password
export MOMO_PARTNER_CODE=your_momo_partner_code
export MOMO_ACCESS_KEY=your_momo_access_key
export MOMO_SECRET_KEY=your_momo_secret_key
export VNPAY_TMN_CODE=your_vnpay_tmn_code
export VNPAY_HASH_SECRET=your_vnpay_hash_secret
export CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Apply changes:
```bash
source ~/.bashrc
```

### 3.3. Build Backend
```bash
cd /opt/luanvan/luanvan-backend

# Build với Maven
mvn clean package -DskipTests

# Tạo thư mục cho uploads
mkdir -p uploads
```

### 3.4. Build Frontend
```bash
cd /opt/luanvan/luanvan-frontend

# Install dependencies
npm install

# Build for production
npm run build
```

## 4. Cấu Hình Application Properties

### 4.1. Tạo Production Properties
```bash
nano /opt/luanvan/luanvan-backend/src/main/resources/application-prod.properties
```

Nội dung:
```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/

# Database Configuration
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Payment Configuration
payment.momo.partner-code=${MOMO_PARTNER_CODE}
payment.momo.access-key=${MOMO_ACCESS_KEY}
payment.momo.secret-key=${MOMO_SECRET_KEY}
payment.momo.api-endpoint=https://payment.momo.vn/v2/gateway/api
payment.momo.return-url=https://yourdomain.com/payment/return
payment.momo.notify-url=https://yourdomain.com/api/payments/momo/notify

payment.vnpay.tmn-code=${VNPAY_TMN_CODE}
payment.vnpay.hash-secret=${VNPAY_HASH_SECRET}
payment.vnpay.api-url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
payment.vnpay.return-url=https://yourdomain.com/payment/return

# File Upload Configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
app.upload.dir=/opt/luanvan/luanvan-backend/uploads

# Logging Configuration
logging.level.root=INFO
logging.level.com.luanvan.luanvanbackend=INFO

# Actuator Configuration
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
```

## 5. Cấu Hình Systemd Services

### 5.1. Tạo Backend Service
```bash
sudo nano /etc/systemd/system/luanvan-backend.service
```

Nội dung:
```ini
[Unit]
Description=Luận Văn Backend Service
After=mysql.service
Requires=mysql.service

[Service]
Type=simple
User=luanvan
Group=luanvan
WorkingDirectory=/opt/luanvan/luanvan-backend
ExecStart=/usr/bin/java -Xms512m -Xmx2g -jar target/luanvan-backend-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
Environment=SPRING_PROFILES_ACTIVE=prod

[Install]
WantedBy=multi-user.target
```

### 5.2. Tạo User cho Service
```bash
sudo useradd -r -s /bin/false luanvan
sudo chown -R luanvan:luanvan /opt/luanvan
```

### 5.3. Enable và Start Backend Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable luanvan-backend
sudo systemctl start luanvan-backend

# Check status
sudo systemctl status luanvan-backend
```

## 6. Cấu Hình Nginx

### 6.1. Tạo Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/luanvan
```

Nội dung:
```nginx
# Upstream cho backend
upstream backend {
    server localhost:8080;
}

# HTTP server (redirect to HTTPS)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

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

    # Frontend static files
    location / {
        root /opt/luanvan/luanvan-frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # File uploads
    client_max_body_size 10M;
}
```

### 6.2. Enable Site và Test Nginx
```bash
sudo ln -s /etc/nginx/sites-available/luanvan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Cài Đặt SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## 8. Database Migration

### 8.1. Run Initial Migration
```bash
cd /opt/luanvan/luanvan-backend

# Import initial data
mysql -u luanvan -p luanvan_db < src/main/resources/db/migration/import.sql
```

## 9. Monitoring và Maintenance

### 9.1. View Application Logs
```bash
# Backend logs
sudo journalctl -u luanvan-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### 9.2. Health Check
```bash
# Check service status
sudo systemctl status luanvan-backend
sudo systemctl status nginx
sudo systemctl status mysql

# Check application health
curl https://yourdomain.com/api/actuator/health
```

### 9.3. Backup Database
```bash
# Create backup script
sudo nano /opt/backup-mysql.sh
```

Script content:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_USER="luanvan"
DB_PASS="your_password_here"
DB_NAME="luanvan_db"

mkdir -p $BACKUP_DIR
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

Make executable and setup cron:
```bash
sudo chmod +x /opt/backup-mysql.sh
sudo crontab -e
```

Add to crontab:
```cron
# Database backup daily at 2 AM
0 2 * * * /opt/backup-mysql.sh

# Restart backend service weekly
0 3 * * 0 systemctl restart luanvan-backend
```

## 10. Security Hardening

### 10.1. Firewall Configuration
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 10.2. Fail2ban Installation
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 10.3. MySQL Security
```bash
# Secure MySQL
sudo mysql_secure_installation

# Configure MySQL firewall (if needed)
sudo ufw allow from 127.0.0.1 to any port 3306
```

## 11. Performance Tuning

### 11.1. JVM Tuning
Edit service file:
```bash
sudo nano /etc/systemd/system/luanvan-backend.service
```

Update ExecStart:
```ini
ExecStart=/usr/bin/java -Xms1g -Xmx2g -XX:+UseG1GC -jar target/luanvan-backend-0.0.1-SNAPSHOT.jar
```

### 11.2. MySQL Configuration
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add:
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_size = 32M
query_cache_type = 1
```

## 12. Troubleshooting

### 12.1. Common Issues
```bash
# Restart backend service
sudo systemctl restart luanvan-backend

# Check backend logs
sudo journalctl -u luanvan-backend --since "1 hour ago"

# Test database connection
mysql -u luanvan -p luanvan_db -e "SELECT 1;"

# Check port usage
sudo netstat -tlnp | grep :8080
```

### 12.2. Update Application
```bash
cd /opt/luanvan

# Pull latest code
git pull origin main

# Rebuild backend
cd luanvan-backend
mvn clean package -DskipTests

# Restart service
sudo systemctl restart luanvan-backend

# Rebuild frontend
cd ../luanvan-frontend
npm run build

# Reload nginx
sudo systemctl reload nginx
```

## 13. Post-Deployment Checklist

- [ ] Backend service running và healthy
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] SSL certificate valid
- [ ] Payment integration working
- [ ] Email sending functional
- [ ] File upload working
- [ ] Backup scripts configured
- [ ] Monitoring setup
- [ ] Security hardening applied
- [ ] Performance testing completed 