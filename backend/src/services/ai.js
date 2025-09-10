import { parseJsonFromMarkdown } from '../utils.js'
import exampleDiagram from '../../__data__/example_ai.json' with { type: "json" };
import { Agent, fetch } from 'undici';
import { getValidateDiagramPrompt, getGenerateDiagramPrompt, getSummaryPrompt } from '../const/prompt.js'

export async function diagramChat({prompt, diagramId = null, messageHistory = [], model = 'theonemarket'}) {
    if (!prompt || typeof prompt !== 'string') {
        throw new Error(`Неверный формат промпта`)
    }
    if (process.env.IS_AI_ENABLED !== 'true') {
        return {
            diagramData: exampleDiagram,
            message: {
                role: "assistant",
                content: 'Вот пример того, как будет формироваться диаграмма от ии',
                data: exampleDiagram
            }
        }
    }

    const TYPE = 'string'
    const MODEL = model

    const body = getBody(TYPE, MODEL, getGenerateDiagramPrompt(prompt), messageHistory);

    try {
        console.log('Fetching diagram chat....');
        const agent = new Agent({
            connectTimeout: 300_000,       // подключение к серверу (по умолчанию 10 сек)
            headersTimeout: 3000_000,      // сколько ждать заголовки (по умолчанию 30 сек)
            bodyTimeout: 3000_000          // сколько ждать тело ответа (по умолчанию 30 сек)
        });
        const response = await fetch(getApiUrl(model), {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(1_000_000),
            dispatcher: agent
        });

        const data = await response.json();
        const content = transformResponse(data, TYPE);
        console.log('GEN CONTENT', content);
        const { json, content: messageContent } = parseJsonFromMarkdown(content)

        return {
            diagramData: json,
            message: {
                role: "assistant",
                content: messageContent,
                data: json
            }
        };
    } catch (err) {
        console.error({ err })
        throw new Error(`Ошибка при обработке чата диаграммы`)
    }
}

export async function validateDiagram(diagramPrompt, model = 'theonemarket') {
    if (!diagramPrompt || typeof diagramPrompt !== 'string') {
        throw new Error(`Неверный формат для валидации`)
    }
    console.log('Fetching validation....');

    const response = await fetch(getApiUrl(model), {
        method: 'POST',
        body: JSON.stringify({
            "model": model,
            "prompt": getValidateDiagramPrompt(diagramPrompt),
            "stream": false
        }),
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    let responseRes = data.response;

    return responseRes
}

export async function transcribeSpeech(fileInfo) {
    // Создаем boundary для multipart/form-data
    const boundary = `--------------------------${Math.random().toString(36).substring(2)}`;

    // Подготавливаем данные в формате multipart/form-data вручную
    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${fileInfo.filename}"\r\n`;
    body += `Content-Type: ${fileInfo.mimetype}\r\n\r\n`;

    // Создаем буфер из текстовой части и бинарной части
    const bodyBuffer = Buffer.from(body, 'utf-8');
    const endBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');

    // Объединяем все буферы
    const requestBody = Buffer.concat([
        bodyBuffer,
        fileInfo.buffer,
        endBuffer
    ]);

    const response = await fetch(process.env.AI_TRANSCRIPTION_URL, {
        method: 'POST',
        body: requestBody,
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`
        }
    });

    const data = await response.json();
    console.log('TRANSCRIPTION DATA', data);
    return data;
}

export async function shortenPrompt(prompt) {
    console.log('Fetching summary....');
    const response = await fetch(process.env.AI_API_URL, {
        method: 'POST',
        body: JSON.stringify({
            "model": 'theonemarket',
            "prompt": getSummaryPrompt(prompt),
            "stream": false
        }),
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();

    const content = transformResponse(data, 'string');
    console.log('SUMMARY DATA', content);
    return content;
}

// utils
const getMessages = (type = 'string', messageHistory = [], prompt = '') => {
    if (type === 'string') {
        let messageString = `
        ${prompt}`

        if (messageHistory && messageHistory.length > 0) {
            messageString += `
                ===
                ИСТОРИЯ СООБЩЕНИЙ:
                ${messageHistory.map(msg => `${msg.role}: ${msg.data ? JSON.stringify(msg.data) : ''}===${msg.content}`).join('\n===\n')}
            `
        }
        return messageString;
    }

    const messages = [
        // { "role": "system", "content": "You are the best system analyst" },
    ];

    if (messageHistory && messageHistory.length > 0) {
        messageHistory.forEach(msg => {
            messages.push({
                role: msg.role,
                content: `${msg.data ? JSON.stringify(msg.data) : ''}\n===\n${msg.content}\n`
            });
        });
    }

    // Добавляем текущий запрос
    messages.push({ "role": "user", "content": prompt });
    return messages;
}

const getApiUrl = (model) => {
  if(model === 'theonemarket') {
    return process.env.AI_API_URL
  }
  return process.env.AI_MAX_API_URL
}

const getBody = (type = 'string', model, prompt, messageHistory = []) => {
    const messages = getMessages(type, messageHistory, prompt);

    return type === 'string' ? {
        "model": model,
        "prompt": messages,
        "stream": false
    } : {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": -1,
        "stream": false
    }
}

const transformResponse = (response, type = 'string') => {
    if (type === 'string') {
        return response?.response;
    } else {
        return response.choices[0].message.content;
    }

}
