import { getDiagramQueryKey } from "@/__data__/queryKeys"
import { ai } from "@/services/diagram"
import { useQuery } from "@tanstack/vue-query"
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useElements } from "./useElements"

export function useDiagramQuery() {
    const route = useRoute()
    const queryKey = computed(() => getDiagramQueryKey(route.params.id as string))
    const { setElements } = useElements()

    const diagramQuery = useQuery({
        queryKey,
        queryFn: async () => {
            const diagramState = await ai.getDiagram(route.params.id as string)

            const {nodes} = setElements(diagramState)
        
            return {
                ...diagramState,
                data: nodes
            }
        },
        throwOnError: true,
        enabled: computed(() => !!route.params.id),
        retry: false
    })

    return {
        diagramQuery
    }
}