import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from transformers import pipeline
import io
import uvicorn
import traceback
import os 


MODEL_NAME = os.getenv("ASR_MODEL", "bond005/whisper-large-v3-ru-podlodka")

FORCE_CPU = os.getenv("FORCE_CPU", "false").lower() == "true"
if FORCE_CPU:
    DEVICE = "cpu"
    print("Принудительное использование CPU.")
elif torch.cuda.is_available():
    DEVICE = "cuda"
    print("CUDA доступна, используется GPU.")
else:
    DEVICE = "cpu"
    print("CUDA недоступна, используется CPU.")

TORCH_DTYPE = torch.float16 if DEVICE == "cuda" else torch.float32
CHUNK_LENGTH_S = int(os.getenv("CHUNK_LENGTH_S", "30"))
SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0") 
SERVER_PORT = int(os.getenv("SERVER_PORT", "8821"))


app = FastAPI(
    title="Whisper ASR API",
    description="API для транскрибации аудио с использованием модели Whisper.",
    version="1.0.0"
)

asr_pipeline = None

@app.on_event("startup")
async def load_model():
    """Загружает модель ASR при старте приложения."""
    global asr_pipeline
    print(f"Загрузка модели {MODEL_NAME} на устройство {DEVICE} с типом {TORCH_DTYPE}...")
    try:
        asr_pipeline = pipeline(
            "automatic-speech-recognition",
            model=MODEL_NAME,
            device=DEVICE,
            torch_dtype=TORCH_DTYPE,
            chunk_length_s=CHUNK_LENGTH_S,
    
        )
        print("Модель ASR успешно загружена.")
    except Exception as e:
        print(f"Ошибка при загрузке модели ASR: {e}")
        print(traceback.format_exc())
        asr_pipeline = None 

@app.post(
    "/transcribe/",
    summary="Транскрибировать аудиофайл",
    description="Загрузите аудиофайл (например, mp3, wav, flac, ogg, m4a) для получения его текстовой расшифровки."
)
async def transcribe_audio(
    file: UploadFile = File(..., description="Аудиофайл для транскрибации."),
    return_timestamps: bool = False,
    language: str = "ru" 
):
    """Эндпоинт для транскрибации загруженного аудиофайла."""
    if not asr_pipeline:
         raise HTTPException(status_code=503, detail="Модель ASR недоступна или не загружена.")

    # Проверка формата файла
    supported_formats = (".mp3", ".wav", ".flac", ".ogg", ".m4a", ".opus") 
    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if not file_ext or file_ext not in supported_formats:
         raise HTTPException(
             status_code=400,
             detail=f"Неподдерживаемый формат файла '{file_ext}'. Поддерживаются: {', '.join(supported_formats)}"
         )

    print(f"Получен файл: {file.filename}, Запрос меток: {return_timestamps}, Язык: {language}")

    try:
        # Чтение файла в байты
        audio_bytes = await file.read()
        if not audio_bytes:
             raise HTTPException(status_code=400, detail="Загруженный файл пуст.")

        print(f"Начало транскрибации файла: {file.filename} ({len(audio_bytes)} байт)...")

        result = asr_pipeline(
            audio_bytes,
            return_timestamps="word" if return_timestamps else True, 
            generate_kwargs={"language": language}
        )

        print(f"Транскрибация файла {file.filename} завершена.")

        # Формируем ответ
        response = {"text": result.get("text", "").strip()}

        if return_timestamps and "chunks" in result:
             # Форматируем таймстемпы для удобства
             response["timestamps"] = [
                 {"text": chunk["text"].strip(), "start": chunk["timestamp"][0], "end": chunk["timestamp"][1]}
                 for chunk in result["chunks"]
             ]
        elif return_timestamps:
             response["timestamps"] = [] 

        return response

    except Exception as e:
        print(f"Ошибка при обработке файла {file.filename}: {e}")
        print(traceback.format_exc()) # Лог для отладки
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера при транскрибации: {str(e)}")

@app.get("/", summary="Проверка состояния API", description="Возвращает сообщение, если API работает.")
def read_root():
    """Корневой эндпоинт для проверки доступности API."""
    status = "доступна" if asr_pipeline else "недоступна (ошибка загрузки)"
    return {"message": f"Whisper ASR API работает. Модель {MODEL_NAME} {status}."}


if __name__ == "__main__":
    print(f"Запуск сервера FastAPI на http://{SERVER_HOST}:{SERVER_PORT}")
    print(f"Используемое устройство для ASR: {DEVICE}")
    if DEVICE == "cuda":
        print(f"Версия PyTorch: {torch.__version__}")
        print(f"Доступно CUDA: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
             print(f"Используемый GPU: {torch.cuda.get_device_name(0)}")
    # Запускаем uvicorn программно
    uvicorn.run(app, host=SERVER_HOST, port=SERVER_PORT)
