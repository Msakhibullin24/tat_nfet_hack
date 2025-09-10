import { BaseResponse } from "@/types"
import type { AppNode, DiagramListItem, DiagramNodeRaw, DiagramState } from "@/types/diagram"

export interface DiagramMessage {
    id: string
    diagramId: string
    role: 'user' | 'assistant'
    content: string
    data?: any
    createdAt: string
    hasData: boolean
}

type DiagramResponse<DataType = DiagramNodeRaw> = {
    id: string
    name: string
    data: DataType[]
    createdAt: string
    updatedAt: string
    messages: DiagramMessage[]
}

function diagramResponseToDiagramState(res: DiagramResponse): DiagramState {
    return res
}

export const ai = {
    generateDiagram: async (prompt: string, model: string) => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + '/diagram?model=' + model, {
                method: 'POST',
                body: JSON.stringify({ 
                    prompt,
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const fullResponse = await response.json() as BaseResponse<DiagramResponse>
            if(fullResponse.errors?.length > 0) {
                throw new Error(fullResponse.errors[0])
            }
            return diagramResponseToDiagramState(fullResponse.data)
        } catch (error) {
            console.error(error)
            throw error
        }
    },
    validateDiagram: async (id: string, model: string) => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + `/diagram/${id}/validate?model=${model}`)
            const fullResponse = await response.json() as BaseResponse<DiagramResponse>
            return diagramResponseToDiagramState(fullResponse.data)
        } catch (error) {
            console.error(error)
            throw error
        }
    },
    rollbackDiagram: async (id: string, messageId: string) => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + `/diagram/${id}/apply-message/${messageId}`)
            const fullResponse = await response.json() as BaseResponse<DiagramResponse>
            return diagramResponseToDiagramState(fullResponse.data)
        } catch (error) {
            console.error(error)
            throw error
        }
    },
    getDiagram: async (id: string) => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + `/diagram/${id}`)
            const fullResponse = await response.json() as BaseResponse<DiagramResponse>
            return diagramResponseToDiagramState(fullResponse.data)
        } catch (error) {
            console.error(error)
            throw error
        }
    },
    updateDiagram: async (id: string, diagramState: Partial<DiagramState>, model: string) => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + `/diagram/${id}?model=${model}`, {
                method: 'PUT',
                body: JSON.stringify(diagramState),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const fullResponse = await response.json() as BaseResponse<DiagramResponse<AppNode>>
            return diagramResponseToDiagramState(fullResponse.data)
        } catch (error) {
            console.error(error)
            throw error
        }
    },
    sendMessage: async (id: string, prompt: string, model: string) => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + `/diagram/${id}?model=${model}`, {
                method: 'PUT',
                body: JSON.stringify({ prompt }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const fullResponse = await response.json() as BaseResponse<DiagramResponse>
            return diagramResponseToDiagramState(fullResponse.data)
        } catch (error) {
            console.error(error)
            throw error
        }
    },
    getDiagramVersion: async (id: string, messageId: string) => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + `/diagram/${id}/version/${messageId}`)
            const fullResponse = await response.json() as BaseResponse<{ 
                id: string
                version: string
                data: any
                createdAt: string 
            }>
            return fullResponse.data
        } catch (error) {
            console.error(error)
            throw error
        }
    },
    getDiagrams: async () => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + '/diagrams')
            const fullResponse = await response.json() as BaseResponse<DiagramListItem[]>
            return fullResponse.data
        } catch (error) {
            console.error(error)
            throw error
        }
    },
    deleteDiagram: async (id: string) => {
        try {
            await fetch(import.meta.env.VITE_API_URL + `/diagram/${id}`, {
                method: 'DELETE'
            })
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}