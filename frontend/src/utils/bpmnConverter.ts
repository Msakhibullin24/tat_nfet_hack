import { NodeType, GatewayType, type AppNode, type AppEdge } from '@/types/diagram'
import { type Edge } from '@vue-flow/core'

/**
 * Конвертирует массив узлов (AppNode) и связей (AppEdge) в XML формат BPMN
 * @param nodes Массив узлов диаграммы
 * @param edges Массив связей между узлами
 * @returns Строка в формате BPMN XML
 */
export function convertToBPMN(nodes: AppNode[], edges: AppEdge[]): string {
  // Создаем уникальный ID для процесса
  const processId = `Process_${generateUUID()}`
  const diagramId = `Diagram_${generateUUID()}`
  
  // Создаем базовый XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions 
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
  id="Definitions_${generateUUID()}" 
  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${processId}" isExecutable="false">
`

  // Добавляем элементы в процесс
  for (const node of nodes) {
    xml += generateBPMNElement(node)
  }

  // Добавляем последовательные потоки (sequence flows)
  for (const edge of edges) {
    xml += generateSequenceFlow(edge)
  }

  // Закрываем тег процесса
  xml += `  </bpmn:process>\n`

  // Добавляем графические элементы диаграммы
  xml += `  <bpmndi:BPMNDiagram id="${diagramId}">
    <bpmndi:BPMNPlane id="BPMNPlane_${processId}" bpmnElement="${processId}">
`

  // Добавляем отображение для каждого элемента
  for (const node of nodes) {
    xml += generateBPMNShape(node)
  }

  // Добавляем отображение для каждого потока
  for (const edge of edges) {
    xml += generateBPMNEdge(edge, nodes)
  }

  // Закрываем теги диаграммы и определения
  xml += `    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

  return xml
}

/**
 * Генерирует BPMN элемент на основе типа узла
 */
function generateBPMNElement(node: AppNode): string {
  const { id, type, data } = node
  
  switch (type) {
    case NodeType.Task:
      return `    <bpmn:task id="${id}" name="${escapeXml(data.label)}">
      ${generateOutgoingFlows(data.children, id)}
    </bpmn:task>\n`
    
    case NodeType.Gateway:
      const gatewayType = data.gatewayType
      let gatewayElement = ''
      
      switch (gatewayType) {
        case GatewayType.AND:
          gatewayElement = `    <bpmn:parallelGateway id="${id}" name="${escapeXml(data.label)}">
      ${generateOutgoingFlows(data.children, id)}
    </bpmn:parallelGateway>\n`
          break
          
        case GatewayType.OR:
          gatewayElement = `    <bpmn:inclusiveGateway id="${id}" name="${escapeXml(data.label)}">
      ${generateOutgoingFlows(data.children, id)}
    </bpmn:inclusiveGateway>\n`
          break
          
        case GatewayType.XOR:
          gatewayElement = `    <bpmn:exclusiveGateway id="${id}" name="${escapeXml(data.label)}">
      ${generateOutgoingFlows(data.children, id)}
    </bpmn:exclusiveGateway>\n`
          break
          
        case GatewayType.EventBased:
          gatewayElement = `    <bpmn:eventBasedGateway id="${id}" name="${escapeXml(data.label)}">
      ${generateOutgoingFlows(data.children, id)}
    </bpmn:eventBasedGateway>\n`
          break
          
        default:
          gatewayElement = `    <bpmn:exclusiveGateway id="${id}" name="${escapeXml(data.label)}">
      ${generateOutgoingFlows(data.children, id)}
    </bpmn:exclusiveGateway>\n`
      }
      
      return gatewayElement
    
    case NodeType.Event:
      // Проверяем, является ли событие начальным или конечным
      // Для простоты: если у события нет детей, считаем его конечным
      // иначе - начальным
      const isEndEvent = !data.children || data.children.length === 0
      
      if (isEndEvent) {
        return `    <bpmn:endEvent id="${id}" name="${escapeXml(data.label)}" />\n`
      } else {
        return `    <bpmn:startEvent id="${id}" name="${escapeXml(data.label)}">
      ${generateOutgoingFlows(data.children, id)}
    </bpmn:startEvent>\n`
      }
    
    default:
      // Обрабатываем как обычную задачу в случае неизвестного типа
      // Приводим data к типу BaseNodeData для безопасного доступа к свойствам
      const nodeData = data as {
        label?: string;
        children?: string[];
      };
      
      if (nodeData && typeof nodeData.label === 'string') {
        return `    <bpmn:task id="${id}" name="${escapeXml(nodeData.label)}">
      ${generateOutgoingFlows(nodeData.children, id)}
    </bpmn:task>\n`
      }
      return `    <bpmn:task id="${id}" name="Неизвестный элемент" />\n`
  }
}

/**
 * Генерирует исходящие потоки для элемента
 */
function generateOutgoingFlows(children?: string[], nodeId?: string): string {
  if (!children || children.length === 0) {
    return ''
  }
  
  return children.map(childId => `<bpmn:outgoing>${generateFlowId(nodeId || '', childId)}</bpmn:outgoing>`).join('\n      ')
}

/**
 * Генерирует элемент последовательного потока
 */
function generateSequenceFlow(edge: AppEdge): string {
  const flowId = generateFlowId(edge.source, edge.target)
  
  return `    <bpmn:sequenceFlow id="${flowId}" sourceRef="${edge.source}" targetRef="${edge.target}" />\n`
}

/**
 * Генерирует ID потока на основе исходного и целевого элементов
 */
function generateFlowId(sourceId: string, targetId: string): string {
  return `Flow_${sourceId}_${targetId}`
}

/**
 * Генерирует графический элемент для узла
 */
function generateBPMNShape(node: AppNode): string {
  const { id, type, position } = node
  let width = 100
  let height = 80
  
  // Разные размеры для разных типов элементов
  if (type === NodeType.Gateway) {
    width = 50
    height = 50
  } else if (type === NodeType.Event) {
    width = 36
    height = 36
  }
  
  return `      <bpmndi:BPMNShape id="BPMNShape_${id}" bpmnElement="${id}">
        <dc:Bounds x="${position.x}" y="${position.y}" width="${width}" height="${height}" />
      </bpmndi:BPMNShape>\n`
}

/**
 * Генерирует графический элемент для потока
 */
function generateBPMNEdge(edge: AppEdge, nodes: AppNode[]): string {
  const flowId = generateFlowId(edge.source, edge.target)
  
  // Находим исходный и целевой узлы
  const sourceNode = nodes.find(node => node.id === edge.source)
  const targetNode = nodes.find(node => node.id === edge.target)
  
  if (!sourceNode || !targetNode) {
    return `      <bpmndi:BPMNEdge id="BPMNEdge_${flowId}" bpmnElement="${flowId}">
        <di:waypoint x="0" y="0" />
        <di:waypoint x="0" y="0" />
      </bpmndi:BPMNEdge>\n`
  }
  
  // Рассчитываем waypoints на основе позиций узлов
  // Получаем центры узлов
  const sourceWidth = sourceNode.type === NodeType.Gateway ? 50 : (sourceNode.type === NodeType.Event ? 36 : 100)
  const sourceHeight = sourceNode.type === NodeType.Gateway ? 50 : (sourceNode.type === NodeType.Event ? 36 : 80)
  
  const targetWidth = targetNode.type === NodeType.Gateway ? 50 : (targetNode.type === NodeType.Event ? 36 : 100)
  const targetHeight = targetNode.type === NodeType.Gateway ? 50 : (targetNode.type === NodeType.Event ? 36 : 80)
  
  const sourceX = sourceNode.position.x + sourceWidth / 2
  const sourceY = sourceNode.position.y + sourceHeight / 2
  
  const targetX = targetNode.position.x + targetWidth / 2
  const targetY = targetNode.position.y + targetHeight / 2
  
  // Для более естественного соединения, создаем два промежуточных waypoint
  const midX1 = sourceX
  const midY1 = sourceY + (targetY - sourceY) / 3
  
  const midX2 = targetX
  const midY2 = targetY - (targetY - sourceY) / 3
  
  return `      <bpmndi:BPMNEdge id="BPMNEdge_${flowId}" bpmnElement="${flowId}">
        <di:waypoint x="${Math.round(sourceX)}" y="${Math.round(sourceY)}" />
        <di:waypoint x="${Math.round(midX1)}" y="${Math.round(midY1)}" />
        <di:waypoint x="${Math.round(midX2)}" y="${Math.round(midY2)}" />
        <di:waypoint x="${Math.round(targetX)}" y="${Math.round(targetY)}" />
      </bpmndi:BPMNEdge>\n`
}

/**
 * Генерирует уникальный UUID
 */
function generateUUID(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

/**
 * Экранирует специальные символы XML
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Конвертирует массив vue-flow Edge в массив AppEdge
 * @param edges Массив ребер vue-flow
 * @returns Массив AppEdge
 */
export function convertVueFlowEdgesToAppEdges(edges: Edge[]): AppEdge[] {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type
  }))
} 