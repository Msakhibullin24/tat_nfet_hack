// Import the framework and instantiate it
import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { getFormattedResponse } from './utils.js'
import 'dotenv/config'
import diagramController from './controllers/diagram.js'
import speechController from './controllers/speech.js'
import fs from 'node:fs'

const fastify = Fastify({
  logger: true,
    https: fs.existsSync('./ssl/key.pem') && fs.existsSync('./ssl/cert.pem')
    ? {
        key: fs.readFileSync('./ssl/key.pem'),
        cert: fs.readFileSync('./ssl/cert.pem'),
    }
    : false
})
await fastify.register(cors, {
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})
await fastify.register(multipart)


fastify.post('/diagram', async function handler (request, reply) {
    try {
        const diagram = await diagramController.create(request, reply)
        reply.send(getFormattedResponse({data: diagram}))
      } catch (err) {
        reply
            .status(400)
            .send(
                getFormattedResponse({data: null, errors: [err.message ?? 'Ошибка при получении диаграммы']})
            )
      }
})

fastify.get('/diagram/:id', async function handler (request, reply) {
    try {
        const diagram = await diagramController.get(request, reply)
        reply.send(getFormattedResponse({data: diagram}))
    } catch (err) {
        reply
            .status(400)
            .send(
                getFormattedResponse({data: null, errors: [err.message ?? 'Ошибка при получении диаграммы']})
            )
    }
})

fastify.put('/diagram/:id', async function handler (request, reply) {
    try {
        const diagram = await diagramController.update(request, reply)
        reply.send(getFormattedResponse({data: diagram}))
    } catch (err) {
        console.log('err', err);
        reply
            .status(400)
            .send(
                getFormattedResponse({data: null, errors: [err.message ?? 'Ошибка при обновлении диаграммы']})
            )
    }
})

fastify.get('/diagram/:id/validate', async function handler (request, reply) {
    try {
        const diagram = await diagramController.validate(request, reply)
        reply.send(getFormattedResponse({data: diagram}))
    } catch (err) {
        reply
            .status(400)
            .send(
                getFormattedResponse({data: null, errors: [err.message ?? 'Ошибка при валидации диаграммы']})
            )
    }
})

fastify.get('/diagram/:id/version/:messageId', async function handler (request, reply) {
    try {
        const version = await diagramController.getVersion(request, reply)
        reply.send(getFormattedResponse({data: version}))
    } catch (err) {
        reply
            .status(400)
            .send(
                getFormattedResponse({data: null, errors: [err.message ?? 'Ошибка при получении версии диаграммы']})
            )
    }
})

fastify.get('/diagram/:id/apply-message/:messageId', async function handler (request, reply) {
    try {
        const diagram = await diagramController.updateDataFromMessage(request, reply)
        reply.send(getFormattedResponse({data: diagram}))
    } catch (err) {
        reply
            .status(400)
            .send(
                getFormattedResponse({data: null, errors: [err.message ?? 'Ошибка при применении данных из сообщения']})
            )
    }
})

fastify.get('/diagrams', async function handler (request, reply) {
    try {
        const diagrams = await diagramController.getList(request, reply)
        reply.send(getFormattedResponse({data: diagrams}))
    } catch (err) {
        reply
            .status(400)
            .send(
                getFormattedResponse({data: null, errors: [err.message ?? 'Ошибка при получении диаграмм']})
            )
    }
})

fastify.post('/speech', async function handler (request, reply) {
    try {
        const transcription = await speechController.transcribe(request, reply)
        reply.send(getFormattedResponse({data: transcription}))
    } catch (err) {
        reply
            .status(400)
            .send(
                getFormattedResponse({data: null, errors: [err.message ?? 'Ошибка при транскрибации']})
            )
    }
})

fastify.delete('/diagram/:id', async function handler (request, reply) {
    try {
        const diagram = await diagramController.deleteDiagram(request, reply)
        reply.send(getFormattedResponse({data: diagram}))
    } catch (err) {
        reply
            .status(400)
            .send(
                getFormattedResponse({data: null, errors: [err.message ?? 'Ошибка при удалении диаграммы']})
            )
    }
})

try {
  await fastify.listen({ port: 3000, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}

console.log('ENV:', process.env)