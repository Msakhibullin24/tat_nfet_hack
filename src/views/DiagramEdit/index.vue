<template>
  <div class="diagram-edit">
    <VueFlow v-model="elements" class="diagram-flow" :default-viewport="{ zoom: 1.5 }">
      <template #node-task="nodeProps">
        <BaseNode 
            :id="nodeProps.id" 
            :type="NodeType.Task" 
            :data="nodeProps.data" 
            :meta="nodeProps.data?.meta || {}"
        />
      </template>
      <template #node-decision="nodeProps">
        <BaseNode
            :id="nodeProps.id" 
            :type="NodeType.Decision" 
            :data="nodeProps.data" 
            :meta="nodeProps.data?.meta || {}"
        />
      </template>
      <template #node-gateway="nodeProps">
        <BaseNode 
            :id="nodeProps.id" 
            :type="NodeType.Gateway" 
            :data="nodeProps.data" 
            :meta="nodeProps.data?.meta || {}"
        />
      </template>
      <template #node-event="nodeProps">
        <BaseNode 
            :id="nodeProps.id" 
            :type="NodeType.Event" 
            :data="nodeProps.data" 
            :meta="nodeProps.data?.meta || {}"
        />
      </template>
      <template #node-timer="nodeProps">
        <BaseNode 
            :id="nodeProps.id" 
            :type="NodeType.Timer" 
            :data="nodeProps.data" 
            :meta="nodeProps.data?.meta || {}"
        />
      </template>
      
      <Background :pattern-color="'#aaa'" :gap="8" />
      <Controls />
      <MiniMap />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
// import '@vue-flow/background/dist/style.css'
// import '@vue-flow/controls/dist/style.css'
// import '@vue-flow/minimap/dist/style.css'
import BaseNode from '@/components/nodes/BaseNode.vue'
import { TEST_DIAGRAM_DATA, NodeType } from '@/__data__/const'
import type { DiagramNodeRaw } from '@/__data__/const'
import { calculateNodePositions } from '@/utils/layout'

// Инициализируем элементы с рассчитанными позициями
const elements = ref<any[]>([])

onMounted(() => {
  // Рассчитываем позиции узлов
  const nodesWithPositions = calculateNodePositions(TEST_DIAGRAM_DATA.nodes, TEST_DIAGRAM_DATA.edges)
  
  // Обновляем элементы
  elements.value = [...nodesWithPositions, ...TEST_DIAGRAM_DATA.edges]
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
