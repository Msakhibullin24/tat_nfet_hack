import { diagramChat, validateDiagram, shortenPrompt } from '../services/ai.js'
import { PrismaClient } from '@prisma/client';
import { isValidDiagram } from '../utils.js'
import { DEFAULT_MODEL } from '../const/const.js'
const prisma = new PrismaClient();

async function create(request) {
    const { prompt } = request.body
    const { model } = request.query
    if (!model) model = DEFAULT_MODEL
    // Получаем данные из API без предыдущей истории
    const result = prompt !== '' ? await diagramChat({ prompt, model }) : {}

    // Создаем новую диаграмму сразу, без ожидания сокращенного текста
    const diagram = await prisma.diagram.create({
        data: {
            name: `diagram-${Date.now()}`,
            data: result.diagramData || {},
            shortText: null,
            messages: prompt ? {
                create: {
                    role: 'user',
                    content: prompt,
                    data: null
                }
            } : {}
        },
        include: {
            messages: true
        }
    });

    // Создаем сообщение от ассистента
    if (result.message) {
        await prisma.diagramMessage.create({
            data: {
                diagramId: diagram.id,
                role: result.message.role,
                content: result.message.content,
                data: result.message.data
            }
        });
    }

    // Запрашиваем сокращенный текст и обновляем диаграмму асинхронно
    if (prompt !== '' && result.diagramData) {
        shortenPrompt(prompt)
            .then(async (shortText) => {
                await prisma.diagram.update({
                    where: { id: diagram.id },
                    data: { shortText }
                });
            })
            .catch(err => {
                console.error('Ошибка при получении сокращенного текста:', err);
            });
    }

    // Получаем обновленную диаграмму со всеми сообщениями
    const updatedDiagram = await prisma.diagram.findUnique({
        where: { id: diagram.id },
        include: { messages: true }
    });

    return updatedDiagram;
}

async function update(request) {
    const { id } = request.params
    const { prompt, data } = request.body
    const { model } = request.query
    if (!model) model = DEFAULT_MODEL

    // Если это обновление данных диаграммы без нового запроса к ИИ
    if (data && !prompt) {
        const diagram = await prisma.diagram.update({
            where: { id },
            data: { data },
            include: { messages: true }
        });
        return diagram;
    }

    // Если это новое сообщение для диаграммы
    if (prompt) {
        // Получаем историю сообщений для данной диаграммы
        const existingMessages = await prisma.diagramMessage.findMany({
            where: { diagramId: id },
            orderBy: { createdAt: 'asc' }
        });

        // Создаем сообщение пользователя или ассистента
        await prisma.diagramMessage.create({
            data: {
                diagramId: id,
                role: request.initMessageType || 'user',
                content: prompt,
                data: null,
            }
        });

        try {
            // Отправляем запрос с историей сообщений
            const result = await diagramChat({
                prompt,
                diagramId: id,
                messageHistory: existingMessages,
                model
            });

            // Обновляем данные диаграммы
            let updateData = {};
            if (result.diagramData) {
                updateData.data = result.diagramData;
            }

            await prisma.diagram.update({
                where: { id },
                data: updateData,
                include: { messages: true }
            });

            // Создаем сообщение от ассистента
            if (result.message) {
                await prisma.diagramMessage.create({
                    data: {
                        diagramId: id,
                        role: result.message.role,
                        content: result.message.content,
                        data: result.message.data
                    }
                });
            }

            // Получаем обновленную диаграмму со всеми сообщениями
            const updatedDiagram = await prisma.diagram.findUnique({
                where: { id },
                include: { messages: { orderBy: { createdAt: 'asc' } } }
            });

            return updatedDiagram;
        } catch (err) {
            await prisma.diagramMessage.create({
                data: {
                    diagramId: id,
                    role: 'assistant',
                    content: 'Ошибка при получении данных от ИИ, попробуйте еще раз',
                    data: null
                }
            });

            return -1
        }
    }

    throw new Error('Требуется prompt или data для обновления диаграммы');
}

async function validate(request) {
    const { id } = request.params
    const { model } = request.query
    if (!model) model = DEFAULT_MODEL

    const diagram = await prisma.diagram.findFirst({
        where: { id },
    })

    const result = await validateDiagram(JSON.stringify(diagram.data), model)
    console.log('VALIDATION RESULT', result)
    if (!result) {
        throw new Error('Ошибка при получении данных о валидации от ИИ, попробуйте еще раз')
    }

    // Отправляем полученную строку в метод update
    const updatedDiagram = await update({
        params: { id },
        body: { prompt: `Результат валидации диаграммы:\n\n${result}` },
        query: { model },
        initMessageType: 'assistant'
    });

    return updatedDiagram;
}

async function get(request) {
    const { id } = request.params
    const diagram = await prisma.diagram.findUnique({
        where: { id },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    })

    if (diagram.messages && diagram.messages.length) {
        diagram.messages = diagram.messages.map(message => ({
            ...message,
            data: undefined,
            hasData: message.data !== null && Object.keys(message.data || {}).length > 0
        }));
    }

    return diagram;
}

async function getList() {
    // Получаем все диаграммы
    const diagrams = await prisma.diagram.findMany({
        select: {
            id: true,
            name: true,
            createdAt: true,
            shortText: true,
        }
    })
    return diagrams;
}

// Получение определенной версии диаграммы
async function getVersion(request) {
    const { id, messageId } = request.params;

    const message = await prisma.diagramMessage.findUnique({
        where: { id: messageId }
    });

    if (!message || message.diagramId !== id) {
        throw new Error('Сообщение не найдено или не принадлежит указанной диаграмме');
    }

    // Если в сообщении есть данные диаграммы, возвращаем их
    if (message.data) {
        return {
            id,
            version: message.id,
            data: message.data,
            createdAt: message.createdAt,
            shortText: message.shortText
        };
    }

    throw new Error('Данная версия не содержит данных диаграммы');
}

async function updateDataFromMessage(request) {
    const { id, messageId } = request.params;

    // Находим сообщение
    const message = await prisma.diagramMessage.findUnique({
        where: { id: messageId }
    });

    if (!message || message.diagramId !== id) {
        throw new Error('Сообщение не найдено или не принадлежит указанной диаграмме');
    }

    // Проверяем, есть ли в сообщении данные диаграммы
    if (!message.data) {
        throw new Error('Выбранное сообщение не содержит данных диаграммы');
    }

    // Проверяем валидность данных диаграммы
    if (!isValidDiagram(message.data)) {
        throw new Error('Данные диаграммы в сообщении некорректны');
    }

    // Обновляем диаграмму данными из сообщения
    const updatedDiagram = await prisma.diagram.update({
        where: { id },
        data: { data: message.data },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
    });

    return updatedDiagram;
}

async function deleteDiagram(request) {
    const { id } = request.params
    await prisma.diagram.delete({
        where: { id }
    })
    return {
        message: 'OK'
    }
}

const diagramController = { create, get, validate, update, getList, getVersion, updateDataFromMessage, deleteDiagram }

export default diagramController