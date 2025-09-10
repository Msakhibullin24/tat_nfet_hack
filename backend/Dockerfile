FROM node:22

WORKDIR /app

# Устанавливаем netcat для проверки доступности сервисов
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Копируем package.json и устанавливаем зависимости (включая devDependencies)
COPY package*.json ./
RUN npm install --production=false

# Копируем prisma schema
COPY ./prisma ./prisma/

# Копируем все остальные файлы
COPY . .

# Создаем SSL директорию
RUN mkdir -p ssl

# Создаем скрипт для генерации SSL сертификатов
RUN echo '#!/bin/sh' > /generate-ssl.sh && \
    echo 'if [ "$USE_SSL" = "true" ]; then' >> /generate-ssl.sh && \
    echo '  echo "Generating SSL certificates..."' >> /generate-ssl.sh && \
    echo '  openssl req -x509 -newkey rsa:4096 -nodes -keyout /app/ssl/key.pem -out /app/ssl/cert.pem -days 365 -subj "/CN=localhost"' >> /generate-ssl.sh && \
    echo 'else' >> /generate-ssl.sh && \
    echo '  echo "Skipping SSL certificate generation (USE_SSL=false)"' >> /generate-ssl.sh && \
    echo 'fi' >> /generate-ssl.sh && \
    chmod +x /generate-ssl.sh

# Создаем entrypoint файл напрямую
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Получаем порты из переменных окружения или используем значения по умолчанию' >> /entrypoint.sh && \
    echo 'OLLAMA_PORT=${OLLAMA_QAT_PORT:-11434}' >> /entrypoint.sh && \
    echo 'OLLAMA_MAX_PORT=${OLLAMA_MAX_PORT:-11435}' >> /entrypoint.sh && \
    echo 'FASTAPI_PORT=${FASTAPI_QAT_PORT:-8821}' >> /entrypoint.sh && \
    echo 'FASTAPI_MAX_PORT=${FASTAPI_MAX_PORT:-8821}' >> /entrypoint.sh && \
    echo 'USE_SSL=${USE_SSL:-false}' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Генерируем SSL сертификаты если USE_SSL=true' >> /entrypoint.sh && \
    echo '/generate-ssl.sh' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Создаем .env файл с необходимыми переменными окружения' >> /entrypoint.sh && \
    echo 'echo "IS_AI_ENABLED=true" > .env' >> /entrypoint.sh && \
    echo 'echo "AI_API_URL=http://ollama_qat:$OLLAMA_PORT/api/generate" >> .env' >> /entrypoint.sh && \
    echo 'echo "AI_MAX_API_URL=http://ollama_max:$OLLAMA_MAX_PORT/api/generate" >> .env' >> /entrypoint.sh && \
    echo 'echo "AI_TRANSCRIPTION_URL=http://ollama:$FASTAPI_PORT/transcribe/" >> .env' >> /entrypoint.sh && \
    echo 'echo "AI_TRANSCRIPTION_MAX_URL=http://ollama:$FASTAPI_MAX_PORT/transcribe/" >> .env' >> /entrypoint.sh && \
        echo 'echo "DATABASE_URL=postgresql://postgres:postgres@db:5432/mydb" >> .env' >> /entrypoint.sh && \
    echo 'echo "USE_SSL=$USE_SSL" >> .env' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Ждём, пока Postgres поднимется' >> /entrypoint.sh && \
    echo 'echo "Waiting for postgres..."' >> /entrypoint.sh && \
    echo 'until nc -z -v -w30 db 5432' >> /entrypoint.sh && \
    echo 'do' >> /entrypoint.sh && \
    echo '  echo "Waiting for database connection..."' >> /entrypoint.sh && \
    echo '  sleep 2' >> /entrypoint.sh && \
    echo 'done' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo 'echo "Database is up, checking migrations..."' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Генерируем Prisma Client' >> /entrypoint.sh && \
    echo 'npx prisma generate' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Проверяем наличие директории migrations' >> /entrypoint.sh && \
    echo 'if [ ! -d "/app/prisma/migrations" ] || [ -z "$(ls -A /app/prisma/migrations)" ]; then' >> /entrypoint.sh && \
    echo '  echo "No migrations found, creating initial migration..."' >> /entrypoint.sh && \
    echo '  npx prisma migrate dev --name init --create-only' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Применяем миграции' >> /entrypoint.sh && \
    echo 'npx prisma migrate deploy' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Запускаем приложение с учетом SSL' >> /entrypoint.sh && \
    echo 'if [ "$USE_SSL" = "true" ] && [ -f "/app/ssl/key.pem" ] && [ -f "/app/ssl/cert.pem" ]; then' >> /entrypoint.sh && \
    echo '  echo "Starting with HTTPS..."' >> /entrypoint.sh && \
    echo '  # Здесь нужно добавить запуск с SSL, если ваш бэкенд его поддерживает' >> /entrypoint.sh && \
    echo '  node ./src/index.js' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '  echo "Starting with HTTP..."' >> /entrypoint.sh && \
    echo '  node ./src/index.js' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Проверяем наличие файла
RUN ls -la /entrypoint.sh
RUN cat /entrypoint.sh

# Указываем скрипт запуска
ENTRYPOINT ["/entrypoint.sh"]
