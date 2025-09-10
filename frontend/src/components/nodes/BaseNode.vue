<template>
  <div :class="['node', `node-${type}`]" :style="colorStyle">
    <NodeActions @edit-node="emitEditNode" @delete-node="emitDeleteNode" />
    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <div v-if="data.condition" class="node-condition">{{ data.condition }}</div>
      <div v-if="data.duration" class="node-duration">{{ data.duration }}</div>
    </div>
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { QIcon } from 'quasar'
import type { NodeEmits, NodeProps } from './nodeProps';
import { useNode } from '@/composables/useNode';
import NodeActions from './NodeActions.vue';

const props = defineProps<NodeProps>()
const emit = defineEmits<NodeEmits>()

const { colorStyle, emitEditNode, emitDeleteNode } = useNode(props, emit as any)
</script>

<style scoped>
.node {
  padding: 10px;
  border-radius: 4px;
  min-width: 150px;
  max-width: 200px;
  text-align: center;
  position: relative;
}

.node:hover .node-actions {
  opacity: 1;
}

.node-actions {
  opacity: 0;
  justify-content: flex-end;
  margin-bottom: 5px;
  position: absolute;
  top: 0;
  right: 5px;
  transition: opacity 0.2s;
}

.node-edit-btn {
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.node-edit-btn:hover {
  color: #000;
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