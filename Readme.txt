Docker-compose to launch:

version: '3'
services:
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: 1234
      POSTGRES_DB: NastyshaDisk
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U your_username -d your_database"]
      interval: 5s
      timeout: 5s
      retries: 5

  authentication-api:
    image: feodotevdima/authentication-api:v1.3
    ports:
      - "7002:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:80
    networks:
      - app-network

  file-api:
    image: feodotevdima/file-api:v1.3
    ports:
      - "7003:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:80
    volumes:
      - file-storage:/app/UsersFiles
    networks:
      - app-network

  user-api:
    image: feodotevdima/user-api:v1.3
    ports:
      - "7001:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:80
    networks:
      - app-network
  web:
    image: feodotevdima/web:v1.1
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=Production
    depends_on:
      - authentication-api
      - file-api
      - user-api
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
  file-storage:
    driver: local



Nginx nastyshadisk.conf:
server {
    listen 80;
    server_name nastyshadisk.ru;


    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }


    location /user-api/ {
        proxy_pass http://localhost:7001/;  # Обратите внимание на слеш в конце!
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        rewrite ^/user-api(/.*)$ $1 break;  # Удаляет префикс /user-api
    }


    location /authentication-api/ {
        proxy_pass http://localhost:7002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        rewrite ^/authentication-api(/.*)$ $1 break;
    }


    location /file-api/ {
        proxy_pass http://localhost:7003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        rewrite ^/file-api(/.*)$ $1 break;
    }
}