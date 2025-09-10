#!/bin/sh

# Ждём, пока Postgres поднимется
echo "Waiting for postgres..."
until nc -z -v -w30 db 5432
do
  echo "Waiting for database connection..."
  sleep 2
done

echo "Database is up, running migrations..."

# Генерируем Prisma Client
npx prisma generate

# Применяем миграции (используем npx для явного указания пути)
cd /app && NODE_ENV=development npx prisma migrate deploy

# Запускаем приложение
npm run dev