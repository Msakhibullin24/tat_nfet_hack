
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeEmits, NodeProps } from './nodeProps';
import { useNode } from '@/composables/useNode';
import NodeActions from './NodeActions.vue';
import { computed } from 'vue';
import { BaseNodeMeta, EventType } from '@/types/diagram';

const props = defineProps<NodeProps & {
    meta: {
        eventType: EventType
    }
}>()

const emit = defineEmits<NodeEmits>()
const { colorStyle, emitEditNode, emitDeleteNode } = useNode(props, emit as any)

const typeClass = computed(() => {
    switch(props.eventType) {
        case EventType.Start:
            return 'start-node'
        case EventType.End:
            return 'end-node'
        case EventType.ErrorBoundary:
            return 'error-node'
        case EventType.Error:
            return 'error-node'
        case EventType.Timer:
            return 'timer-node'
    }
})
</script>

<template>
    <div 
        :class="[
            'node',
            'node-event',
            typeClass
        ]" 
        :style="colorStyle"
    >
      <NodeActions @edit-node="emitEditNode" @delete-node="emitDeleteNode" />
      <div class="node-content">
        <q-icon v-if="meta.eventType === EventType.End" name="check" size="24px" />
        <q-icon v-if="meta.eventType === EventType.ErrorBoundary" name="error" size="24px" />
        <q-icon v-if="meta.eventType === EventType.Error" name="error" size="24px" />
        <q-icon v-if="meta.eventType === EventType.Timer" name="timer" size="24px" />
        <div class="node-label">{{ data.label }}</div>
      </div>
      <Handle type="target" :position="Position.Top" />
      <Handle type="source" :position="Position.Bottom" />
    </div>
  </template>

<style lang="sass" scoped>
@import '../../assets/quasar-variables.sass';
@import './node-common.sass';
    
.node-event
    border-radius: 100%;
    border: 2px solid black;
    min-width: auto;
    width: 70px;
    height: 70px;
    min-width: auto;

    display: flex;
    align-items: center;
    justify-content: center;

    &.start-node

    &.end-node
        border-width: 4px;

    &.error-node
        border-color: $negative;
        border-style: dashed;

    &.timer-node
        border-color: $warning;

    .node-label
        position: absolute
        left: 50%
        transform: translateX(-50%)
        bottom: -40px
        margin: 0 auto
        width: 150px
        text-align: center
        line-height: 1.2
        font-weight: 500
</style>
