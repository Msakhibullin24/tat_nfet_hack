import { BaseResponse } from "@/types"

export const speech = {
    transcribe: async (files: File[]) => {
        const formData = new FormData()
        files.forEach(file => {
            formData.append('file', file)
        })

        const response = await fetch(import.meta.env.VITE_API_URL + '/speech', {
            method: 'POST',
            body: formData
        })

        const data = await response.json() as BaseResponse<{text: string}>
        return data
    }
}