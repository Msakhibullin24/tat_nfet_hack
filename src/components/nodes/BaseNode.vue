<template>
  <div :class="['node', `node-${type}`, colorClass]">
    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <div v-if="data.condition" class="node-condition">{{ data.condition }}</div>
      <div v-if="data.duration" class="node-duration">{{ data.duration }}</div>
    </div>
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { DiagramNodeRaw } from '@/__data__/const'
import { computed } from 'vue'

const props = defineProps<{
  id: string
  type: DiagramNodeRaw['type']
  data: DiagramNodeRaw['data']
  meta?: DiagramNodeRaw['meta']
}>()

const colorClass = computed(() => {
  if (!props.meta?.color) return ''
  return `node-${props.meta.color}`
})
</script>

<style scoped>
.node {
  padding: 10px;
  border-radius: 4px;
  min-width: 150px;
  max-width: 200px;
  text-align: center;
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-label {
  font-weight: bold;
}

.node-condition,
.node-duration {
  font-size: 0.8em;
  color: #666;
}

.node-task {
  background: #fff;
  border: 2px solid #1a192b;
}

.node-decision {
  background: #fff;
  border: 2px solid #1a192b;
  /* transform: rotate(45deg); */
}

.node-decision .node-content {
  /* transform: rotate(-45deg); */
}

.node-gateway {
  background: #fff;
  border: 2px solid #1a192b;
  /* clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); */
}

.node-event {
  background: #fff;
  border: 2px solid #1a192b;
  border-radius: 50%;
}

.node-timer {
  background: #fff;
  border: 2px solid #1a192b;
  border-radius: 50%;
}

/* Цветовые классы для узлов */
.node-success {
  background-color: #e6f7e6;
  border-color: #4caf50;
}

.node-warning {
  background-color: #fff8e1;
  border-color: #ff9800;
}

.node-error {
  background-color: #ffebee;
  border-color: #f44336;
}
</style> 