# Используем официальный образ Node.js 22
FROM node:22

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Создаём ssl папку
RUN mkdir -p ssl

# Генерируем self-signed сертификат только если переменная USE_SSL установлена в true
RUN echo '#!/bin/sh' > /generate-ssl.sh && \
    echo 'if [ "$USE_SSL" = "true" ]; then' >> /generate-ssl.sh && \
    echo '  echo "Generating SSL certificates..."' >> /generate-ssl.sh && \
    echo '  openssl req -x509 -newkey rsa:4096 -keyout /app/ssl/key.pem -out /app/ssl/cert.pem -days 365 -nodes -subj "/CN=localhost"' >> /generate-ssl.sh && \
    echo 'else' >> /generate-ssl.sh && \
    echo '  echo "Skipping SSL certificate generation (USE_SSL=false)"' >> /generate-ssl.sh && \
    echo 'fi' >> /generate-ssl.sh && \
    chmod +x /generate-ssl.sh

# Копируем остальной код
COPY . .

# Создаем скрипт entrypoint
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Получаем порты из переменных окружения или используем значения по умолчанию' >> /entrypoint.sh && \
    echo 'BACKEND_PORT=${BACKEND_PORT:-3000}' >> /entrypoint.sh && \
    echo 'USE_SSL=${USE_SSL:-false}' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Генерируем SSL сертификаты если USE_SSL=true' >> /entrypoint.sh && \
    echo '/generate-ssl.sh' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Создаем .env файл с необходимыми переменными окружения' >> /entrypoint.sh && \
    echo 'if [ "$USE_SSL" = "true" ] && [ -f "/app/ssl/key.pem" ] && [ -f "/app/ssl/cert.pem" ]; then' >> /entrypoint.sh && \
    echo '  echo "VITE_API_URL=https://\${FRONTEND_HOST:-localhost}:\$BACKEND_PORT" > .env' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '  echo "VITE_API_URL=http://\${FRONTEND_HOST:-localhost}:\$BACKEND_PORT" > .env' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Собираем проект' >> /entrypoint.sh && \
    echo 'npm run build' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Запускаем сервер' >> /entrypoint.sh && \
    echo 'if [ "$USE_SSL" = "true" ] && [ -f "/app/ssl/key.pem" ] && [ -f "/app/ssl/cert.pem" ]; then' >> /entrypoint.sh && \
    echo '  echo "Starting with HTTPS..."' >> /entrypoint.sh && \
    echo '  serve -s dist -l 3000 --ssl-cert /app/ssl/cert.pem --ssl-key /app/ssl/key.pem' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '  echo "Starting with HTTP (no SSL certificates found or USE_SSL=false)..."' >> /entrypoint.sh && \
    echo '  serve -s dist -l 3000' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Устанавливаем http-сервер serve
RUN npm install -g serve

# Указываем entrypoint
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 3000
