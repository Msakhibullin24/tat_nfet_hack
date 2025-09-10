import { transcribeSpeech } from '../services/ai.js'

async function transcribe(request) {
    // Получаем файл из multipart request
    const data = await request.file()
    const fileBuffer = await data.toBuffer()
    const fileInfo = {
        buffer: fileBuffer,
        filename: data.filename,
        mimetype: data.mimetype
    }
    
    const transcription = await transcribeSpeech(fileInfo)
    return transcription
}

const speechController = {
    transcribe
}

export default speechController