import { NodeType, type AppNode, type DiagramNodeRaw } from '@/types/diagram'
import { MarkerType, type Edge, type Node } from '@vue-flow/core'

/**
 * Рассчитывает позиции узлов диаграммы на основе их связей, если позиции узлов не заданы, то они будут рассчитаны
 * @param nodes Узлы диаграммы
 * @param edges Ребра диаграммы
 * @returns Узлы с рассчитанными позициями
 */
export function calculateNodePositions(nodes: DiagramNodeRaw[], edges: Edge[]): Node[] {
  console.log('NODES', nodes)
  // Создаем карту для хранения позиций узлов
  const positions = new Map<string, { x: number, y: number }>()
  
  // Создаем карту для хранения связей между узлами
  const connections = new Map<string, string[]>()
  
  // Инициализируем карту связей
  nodes.forEach(node => {
    connections.set(node.id, node.data.children || [])
  })
  
  // Находим корневые узлы (без входящих связей)
  const rootNodes = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  )
  
  // Функция для рекурсивного расчета позиций
  function layoutNodes(nodeIds: string[], level: number, startX: number, counter = 0) {
    if (nodeIds.length === 0) return
    counter++
    if(counter > 100) {
      throw new Error('Too many tries')
    }
    
    const HORIZONTAL_SPACING = 550
    const VERTICAL_SPACING = 150
    
    // Распределяем узлы по горизонтали
    const totalWidth = nodeIds.length * HORIZONTAL_SPACING
    let currentX = startX - totalWidth / 2 + HORIZONTAL_SPACING / 2
    
    for (const nodeId of nodeIds) {
      // Устанавливаем позицию текущего узла
      positions.set(nodeId, { 
        x: currentX, 
        y: level * VERTICAL_SPACING 
      })
      
      // Получаем дочерние узлы
      const children = connections.get(nodeId) || []
      
      // Рекурсивно рассчитываем позиции дочерних узлов
      if (children.length > 0) {
        layoutNodes(children, level + 1, currentX, counter)
      }
      
      currentX += HORIZONTAL_SPACING
    }
  }
  
  // Начинаем с корневых узлов
  if (rootNodes.length > 0) {
    layoutNodes(rootNodes.map(node => node.id), 0, 0)
  } else if (nodes.length > 0) {
    // Если нет корневых узлов, начинаем с первого узла
    layoutNodes([nodes[0].id], 0, 0)
  }
  
  // Возвращаем узлы с рассчитанными позициями
  return nodes.map(node => ({
    ...node,
    position: node.position ?? positions.get(node.id) ?? { x: 0, y: 0 }
  }))
}

export function generateEdges(nodes: (DiagramNodeRaw | AppNode)[]): Edge[] {
  const edges: Edge[] = []
  const nodesMap = new Map<string, AppNode>()

  for (const node of nodes) {
    nodesMap.set(node.id, node)
  }

  for (const node of nodes) {
    if (node.data.children) {
      for (const child of node.data.children) {
        edges.push({ 
          id: `${node.id}-${child}`,
          source: node.id,
          target: child,
          type: 'smoothstep',
          markerEnd: MarkerType.Arrow,
        })
      }
    }
  }
  return edges
}

export function convertNodesToAppNodes(nodes: Node[]): AppNode[] {
  return nodes.map(node => ({
    id: node.id,
    type: node.type,
    data: node.data,
    position: node.position
  }))
}

export function isNodeRaw(node: AppNode | DiagramNodeRaw): node is DiagramNodeRaw {
  return !('position' in node)
}