import { generateEdges } from "@/utils/layout"

export enum NodeType {
  Task = 'task',
  Decision = 'decision',
  Gateway = 'gateway',
  Event = 'event',
  Timer = 'timer'
}

export interface DiagramNodeRaw {
  id: string
  type: NodeType
  data: {
    label: string
    condition?: string
    duration?: string
  },
  meta?: {
    color?: 'success' | 'warning' | 'error'
  },
  children?: string[]
}

export const NODES = [
    { 
        id: '1', 
        type: 'task', 
        data: { label: 'Клиент подает обращение' },
        children: ['2']
    },
    { 
        id: '2', 
        type: 'decision', 
        data: { label: 'Проверка наличия активной заявки по теме', condition: 'Есть ли активная заявка?' },
        children: ['3', '4', '9']
    },
    { 
        id: '3', 
        type: 'task', 
        data: { label: 'Объединение с существующей заявкой' },
        children: ['12']
    },
    { 
        id: '4', 
        type: 'task', 
        data: { label: 'Создание тикета' },
        children: ['5', '6']
    },
    { 
        id: '5', 
        type: 'task', 
        data: { label: 'Автоматическое назначение инженера по продукту' }
    },
    { 
        id: '6', 
        type: 'timer', 
        data: { label: 'Ожидание ответа инженера (24 часа)', duration: '24h' },
        children: ['10', '11']
    },
    { 
        id: '7', 
        type: 'task', 
        data: { label: 'Переход заявки старшему специалисту' },
        children: ['8', '13']
    },
    { 
        id: '8', 
        type: 'task', 
        data: { label: 'Обратная связь клиенту', meta: { color: 'success' } },
    },
    { 
        id: '9', 
        type: 'gateway', 
        data: { 
            label: 'Нет активной заявки',
            condition: 'Отсутствует активная заявка',
            meta: {
                color: 'error'
            }
        },
    },
    { 
        id: '10', 
        type: 'event', 
        data: { label: 'Инженер ответил' },
        children: ['7']
    },
    { 
        id: '11', 
        type: 'event', 
        data: { label: 'Срок ответа инженера истек' },
        children: ['7']
    },
    { 
        id: '12', 
        type: 'task', 
        data: { label: 'Тикет объединен' },
        children: ['4']
    },
    { 
        id: '13', 
        type: 'task', 
        data: { label: 'Старший специалист обрабатывает заявку', meta: { color: 'success' } },
        
    }
  ] as DiagramNodeRaw[]

export const TEST_DIAGRAM_DATA = {
  nodes: NODES,
  edges: generateEdges(NODES)
}