import { elements } from "@/__data__/store"
import { DiagramState, AppNode } from "@/types/diagram"
import { calculateNodePositions, generateEdges } from "@/utils/layout"
import { ref } from "vue"

export function useElements() {
    const elementsError = ref<string | null>(null)
    
    const setElements = (state: DiagramState | AppNode[]) => {
        elementsError.value = null
        const maybeRawNodes = Array.isArray(state) ? state: state.data
        if(!Array.isArray(maybeRawNodes)) {
            elementsError.value = 'Ошибка при получении данных о валидации от ИИ, попробуйте еще раз'
            return {nodes: [], edges: []}
        }
        const edges = generateEdges(maybeRawNodes)

        const nodesWithPositions = calculateNodePositions(maybeRawNodes, edges)
        elements.value = [...nodesWithPositions, ...edges]
        
        return {nodes: nodesWithPositions, edges}
    }
    
    return {
        elements,
        setElements,
        elementsError
     }
}