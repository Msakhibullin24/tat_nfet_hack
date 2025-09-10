FROM ollama/ollama:latest

RUN apt-get update && apt-get install -y --no-install-recommends \
wget \
curl \
python3 \
python3-pip \
ffmpeg \
&& rm -rf /var/lib/apt/lists/\*

RUN mkdir -p /app
RUN mkdir -p /modelfiles # Создаем папку для Modelfiles

COPY Modelfile_qat.txt /modelfiles/Modelfile_qat.txt
COPY Modelfile_fp16.txt /modelfiles/Modelfile_fp16.txt

# Скачивание базовых моделей удалено.
# Модели будут скачаны командой 'ollama create' в entrypoint.sh при необходимости
# и сохранены в подключенном томе (/root/.ollama).

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY requirements.txt /app/

RUN pip3 install -r /app/requirements.txt


COPY transcribe_app.py /app/

EXPOSE 11434
EXPOSE 8821

ENTRYPOINT ["/entrypoint.sh"]
