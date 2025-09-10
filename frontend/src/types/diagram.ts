import type { Node, Edge } from "@vue-flow/core"
import { DiagramMessage } from '@/services/diagram'

export enum NodeType {
    Task = 'task', // задача
    Gateway = 'gateway', // шлюз
    Event = 'event', // событие
}

export enum GatewayType {
    AND = 'and',
    OR = 'or',
    XOR = 'xor',
    EventBased = 'event-based',
}

export enum EventType {
    Start = 'start',
    Timer = 'timer',
    End = 'end',
    ErrorBoundary = 'error-boundary',
    Error = 'error',
}

export type BaseNodeData<Meta = BaseNodeMeta> = {
    label: string
    condition?: string
    duration?: string
    children?: string[]
} & Meta

export interface BaseNodeMeta {
    color?: 'success' | 'warning' | 'error' | string
    isSuccess?: boolean
}

export interface TaskNode {
    id: string
    type: NodeType.Task
    data: BaseNodeData
    position: {
        x: number
        y: number
    }
}

export interface GatewayNode {
    id: string
    type: NodeType.Gateway
    data: BaseNodeData<BaseNodeMeta & {
        gatewayType: GatewayType
    }>
    position: {
        x: number
        y: number
    }
}

export interface EventNode {
    id: string
    type: NodeType.Event
    data: BaseNodeData<BaseNodeMeta & {
        eventType: EventType
    }>
    position: {
        x: number
        y: number
    }
}

export type DiagramNodeRaw = TaskNode | GatewayNode | EventNode

export type AppNode = DiagramNodeRaw

export interface AppEdge {
    id: string
    source: string
    target: string
    type?: string
}

export interface DiagramState {
    id: string
    name: string
    data: DiagramNodeRaw[] | AppNode[]
    createdAt: string
    updatedAt: string
    shortText?: string
    messages?: DiagramMessage[]
}

// DiagramListItem is used to display a list of diagrams in the sidebar
export type DiagramListItem = {
    id: string
    name: string
    createdAt: string
    shortText?: string
}