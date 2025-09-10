<template>
  <div class="diagram-edit">
    <VueFlow 
      v-model="elements" 
      class="diagram-flow"
      :default-viewport="{ zoom: 0.7, x: 500, y: 50 }"
      @node-drag-stop="updateNodes"
      @connect="onConnect"
      @edge-double-click="handleEdgeDelete"
    >
      <template #node-task="nodeProps">
        <BaseNode 
            :id="nodeProps.id" 
            :type="NodeType.Task" 
            :data="nodeProps.data" 
            :meta="nodeProps.data || {}"
            @edit-node="openEditNodePopup"
            @delete-node="handleNodeDelete"
        />
      </template>
      <template #node-gateway="nodeProps">
        <GatewayNode 
            :id="nodeProps.id" 
            :type="NodeType.Gateway" 
            :data="nodeProps.data" 
            :meta="nodeProps.data || {}"
            @edit-node="openEditNodePopup"
            @delete-node="handleNodeDelete"
        />
      </template>
      <template #node-event="nodeProps">
        <EventNode 
            :id="nodeProps.id" 
            :type="NodeType.Event" 
            :data="nodeProps.data" 
            :meta="nodeProps.data || {}"
            @edit-node="openEditNodePopup"
            @delete-node="handleNodeDelete"
        />
      </template>

      <Background :pattern-color="'#aaa'" :gap="8" />
      <Controls @open-create-node-popup="openCreateNodePopup" />
      <MiniMap />
    </VueFlow>
    
    <NodePopup 
      :is-open="isNodePopupOpen" 
      :node-id="selectedNodeId" 
      :is-creating="isCreatingNode"
      @close="closeNodePopup" 
      @update="onNodeUpdate"
      @create="onNodeCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, inject } from 'vue'
import { Connection, ConnectionHandle, EdgeEventsEmit, EdgeEventsHandler, EdgeEventsOn, EdgeMouseEvent, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
// import '@vue-flow/background/dist/style.css'
// import '@vue-flow/controls/dist/style.css'
// import '@vue-flow/minimap/dist/style.css'
import BaseNode from '@/components/nodes/BaseNode.vue'
import EventNode from '@/components/nodes/EventNode.vue'
import GatewayNode from '@/components/nodes/GatewayNode.vue'
import { convertNodesToAppNodes } from '@/utils/layout'
import { DiagramState, NodeType } from '@/types/diagram'
import { useRoute, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { getDiagramQueryKey } from '@/__data__/queryKeys'
import { isDiagramEdited, elements } from '@/__data__/store'
import Controls from './Controls.vue'
import NodePopup from '@/components/NodePopup.vue'
import { useDiagramQuery } from '@/composables/useDiagramQuery'
import { TOGGLE_AGENT_SIDEBAR_KEY, VALIDATE_DIAGRAM_KEY } from '@/__data__/injectionKeys'

const isNodePopupOpen = ref(false)
const selectedNodeId = ref('')
const isCreatingNode = ref(false)
const router = useRouter()

const queryClient = useQueryClient()
const { getNodes, getEdges, removeEdges, addEdges, removeNodes } = useVueFlow()
const route = useRoute()
const queryKey = computed(() => getDiagramQueryKey(route.params.id as string))
const { diagramQuery } = useDiagramQuery()

const updateNodes = () => {
  const nodes = getNodes.value
  const appNodes = convertNodesToAppNodes(nodes)
  const diagramState = queryClient.getQueryData<DiagramState>(queryKey.value)
  
  if (diagramState) {
    queryClient.setQueryData(queryKey.value, {
      ...diagramState,
      data: appNodes
    })
  }

  isDiagramEdited.value = true
}

function closeNodePopup() {
  isNodePopupOpen.value = false
  selectedNodeId.value = ''
  isCreatingNode.value = false
}

function onNodeUpdate(node: any) {
  updateNodes()
}

function onNodeCreate(node: any) {
  updateNodes()
}

function openEditNodePopup(nodeId: string) {
  selectedNodeId.value = nodeId
  isCreatingNode.value = false
  isNodePopupOpen.value = true
}

function openCreateNodePopup() {
  selectedNodeId.value = ''
  isCreatingNode.value = true
  isNodePopupOpen.value = true
}

function onConnect(connection: Connection) {
  // Создаем новое ребро из полученного соединения
  const newEdge = {
    id: `e-${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'smoothstep'
  }
  
  // Добавляем новое ребро в vue-flow
  addEdges([newEdge])
  
  // Находим родительскую ноду (источник)
  const nodes = getNodes.value
  const sourceNode = nodes.find(node => node.id === connection.source)
  
  if (sourceNode) {
    // Инициализируем массив children если его нет
    if (!sourceNode.data.children) {
      sourceNode.data.children = []
    }
    
    // Добавляем id дочерней ноды, если его еще нет в массиве
    if (!sourceNode.data.children.includes(connection.target)) {
      sourceNode.data.children.push(connection.target)
    }
    
    // Обновляем ноды
    updateNodes()
  }
}

function handleEdgeDelete(event: EdgeMouseEvent) {
  const nodes = getNodes.value
  const sourceNode = nodes.find(node => node.id === event.edge.source)

  if (sourceNode) {
    sourceNode.data.children = sourceNode.data.children.filter((child: string) => child !== event.edge.target)
  }

  removeEdges([event.edge])
  updateNodes()
}

function handleNodeDelete(nodeId: string) {
  const nodes = getNodes.value
  const node = nodes.find(node => node.id === nodeId)
  const edges = getEdges.value
  const edgesToRemove = edges.filter(edge => edge.source === nodeId || edge.target === nodeId)

  if (node) {
    removeNodes([node])
    removeEdges(edgesToRemove)
    updateNodes()
  }
}

const toggleAgentDrawer = inject(TOGGLE_AGENT_SIDEBAR_KEY)
const validateDiagram = inject(VALIDATE_DIAGRAM_KEY)

onBeforeMount(() => {
  if(route.query.sendValidation) {
      validateDiagram({
          diagramId: diagramQuery.data.value?.id!,
          model: 'theonemarket'
      })
      setTimeout(() => {
        router.replace({ query: {} })
      }, 5000)
  }
  if(route.query.showChat === 'true' && typeof toggleAgentDrawer === 'function') {
    toggleAgentDrawer()
  }
})
</script>

<style scoped>
.diagram-edit {
  width: 100%;
  height: 100vh;
}

.diagram-flow {
  width: 100%;
  height: 100%;
}
</style>
