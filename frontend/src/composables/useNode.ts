import { ColorMap } from "@/__data__/const";
import { NodeProps } from "@/components/nodes/nodeProps";
import { computed, EmitFn } from "vue";

export const useNode = (props: NodeProps, emit: EmitFn<any, any>) => {
    const colorStyle = computed(() => {
        if (!props?.color) return ''
        return {
            backgroundColor: ColorMap[props.color] ?? props.color
        }
    })


    function emitEditNode(event: MouseEvent) {
        event.stopPropagation()
        emit('editNode', props.id)
    }

    function emitDeleteNode(event: MouseEvent) {
        event.stopPropagation()
        emit('deleteNode', props.id)
    }

    return {
        colorStyle,
        emitEditNode,
        emitDeleteNode
    }
}