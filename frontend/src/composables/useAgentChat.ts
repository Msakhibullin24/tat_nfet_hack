import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { ai } from "@/services/diagram";
import { getDiagramQueryKey, getValidationKey } from "@/__data__/queryKeys";
import { elements } from "@/__data__/store";
import { useElements } from "./useElements";
import { DiagramState } from "@/types/diagram";
import { calculateNodePositions, convertNodesToAppNodes } from "@/utils/layout";

interface MessagePayload {
    content: string;
    diagramId?: string;
    model: string;
}

export function useAgentChat() {
    const text = ref('')
    const queryClient = useQueryClient()
    const { setElements } = useElements()

    const sendMessage = (diagramId: string, model: string) => {
        if (!text.value.trim()) return

        sendMessageMutation.mutate({
            content: text.value,
            diagramId: diagramId,
            model: model
        })

        text.value = ''
    }

    // Мутация для отправки сообщения в чат
    const sendMessageMutation = useMutation({
        mutationFn: (payload: MessagePayload) => {
            if (!payload.diagramId) return Promise.reject('Диаграмма не выбрана');
            return ai.sendMessage(payload.diagramId, payload.content, payload.model);
        },
        onSuccess: (data, variables) => {
            console.log('SEND MESSAGE DATA,', data)
            if (variables.diagramId) {
                queryClient.setQueryData(getDiagramQueryKey(variables.diagramId), data);
            }

            setElements(data)
            validateDiagram({
                diagramId: variables.diagramId!,
                model: variables.model
            })
        },
        onError: (error, variables) => {
            console.trace({ error, variables });
        }
    });

    const sendMessageLoading = computed(() => sendMessageMutation.isPending.value)
    const sendMessageVariables = computed(() => sendMessageMutation.variables.value)

    const { mutate: validateDiagram, isPending: isValidationLoading } = useMutation({
        mutationKey: getValidationKey(),
        mutationFn: (payload: { diagramId: string, model?: string }) => {
            return ai.validateDiagram(payload.diagramId, payload.model ?? 'theonemarket');
        },
        onSuccess: (data, variables) => {
            console.log('VALIDATION DATA,', data)
            if (variables.diagramId) {
                queryClient.setQueryData(getDiagramQueryKey(variables.diagramId), data);
            }
            setElements(data)
        },
        onError: (error, variables) => {
            console.log({ error, variables });
        }
    })

    const { mutate: restoreMessage } = useMutation({
        mutationFn: async ({ messageId, diagramId }: { messageId: string, diagramId: string }) => {
            const newState = await ai.rollbackDiagram(diagramId, messageId)
            const diagramState = queryClient.getQueryData<DiagramState>(getDiagramQueryKey(diagramId))

            if (diagramState) {
                queryClient.setQueryData([getDiagramQueryKey(diagramId)], {
                    ...diagramState,
                    data: newState.data
                })
                setElements(newState)
            }
            return newState
        }
    })


    return {
        text,
        sendMessage,
        restoreMessage,
        sendMessageMutation,
        validateDiagram,
        isValidationLoading,
        sendMessageLoading,
        sendMessageVariables,
    }
}