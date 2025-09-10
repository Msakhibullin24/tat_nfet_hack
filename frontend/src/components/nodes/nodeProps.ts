import type { DiagramNodeRaw } from '@/types/diagram';

export type NodeProps = {
    id: string
    type: DiagramNodeRaw['type']
    data: DiagramNodeRaw['data']
    meta?: DiagramNodeRaw['data']
}

export type NodeEmits = {
    'deleteNode': [string]
    'editNode': [string]
}