# Система визуализации BPMN-диаграмм (Команда The One Market) для хакатона от TATNEFT

## 📦 Требования

- [Docker](https://www.docker.com/) и [Docker Compose](https://docs.docker.com/compose/) установлены
- NVIDIA Container Toolkit:
```bashsudo apt-get install -y nvidia-container-toolkit
- sudo nvidia-ctk runtime configure --runtime=docker
- sudo systemctl restart docker
```
## Запуск проекта

Проект настроен для запуска через Docker Compose. Выполните следующие команды для запуска:

```bash
    docker compose build
    docker compose up
```
## Внимание! Первая сборка потребует загрузки 73гб информации о моделях

### Настройка портов через переменные окружения

Вы можете настроить порты всех сервисов, создав файл `.env` в корневой директории проекта. Пример файла с настройками по умолчанию:

```
# Порт PostgreSQL базы данных
DB_PORT=5432
# Порт для доступа к pgAdmin
PGADMIN_PORT=5050
# Порт для бэкенд-приложения
BACKEND_PORT=3000
# Порт для фронтенд-приложения
FRONTEND_PORT=5173
# Порт для Ollama API
OLLAMA_PORT=11434
# Порт для FastAPI приложения для транскрипции речи
FASTAPI_PORT=8821
# Имя хоста, на котором развернут фронтенд (для API запросов)
FRONTEND_HOST=localhost
# Использовать ли самоподписанный SSL сертификат? (необходим для возможности транскрибации)
USE_SSL=false
```

Образец файла также доступен как `.env.example` в корне проекта.\
\
Файлы `.env.example` в папках `backend` и `frontend` нужны для демонстрации при локальном запуске проектов. \
При использовании docker создавать файл .env в папках `backend` и `frontend` **не нужно**.

## Структура проекта

- `backend/` - API сервер
- `frontend/` - Клиентское приложение
- `Modelfile.txt` - Файл конфигурации для модели Ollama
- `trans.py` - Файл конфигурации для модели транскрибации

## Доступные сервисы

*Используются значения портов по умолчанию*

- Frontend: http://localhost:5173
- API: http://localhost:3000
- PgAdmin: http://localhost:5050
- Ollama API: http://localhost:11434
- FastAPI Transcription: http://localhost:8821

## Особенности контейнеризации
- Ollama а также Python зависимости для транскрибации устанавливаются во время запуска контейнера
- Порты для всех сервисов настраиваются через переменные окружения (*файл `.env` в корне проекта*)
