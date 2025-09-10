<script setup lang="ts">
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import type { NodeEmits, NodeProps } from './nodeProps';
import { useNode } from '@/composables/useNode';
import NodeActions from './NodeActions.vue';
import { QIcon } from 'quasar';
import { GatewayNode, NodeType, GatewayType } from '@/types/diagram';

const props = defineProps<NodeProps & {
    type: NodeType.Gateway
    meta: GatewayNode['data']
}>()

const emit = defineEmits<NodeEmits>()
const { colorStyle, emitEditNode, emitDeleteNode } = useNode(props, emit as any)
</script>

<template>
    <div :class="[
        'node',
        'node-gateway',
    ]"
    :style="colorStyle" 
    >
      <NodeActions @edit-node="emitEditNode" @delete-node="emitDeleteNode" />
      <div class="node-content" >
        <q-icon v-if="meta.gatewayType === GatewayType.AND" name="add" size="24px" />
        <q-icon v-if="meta.gatewayType === GatewayType.OR" name="radio_button_unchecked" size="24px" />
        <q-icon v-if="meta.gatewayType === GatewayType.XOR" name="close" size="24px" />
      </div>
      <p class="gateway-label node-label">{{ data.label }}</p>

      <Handle type="target" :position="Position.Top" />
      <Handle type="source" :position="Position.Bottom" />
    </div>
  </template>

<style lang="sass">
@import '../../assets/quasar-variables.sass';
@import './node-common.sass';
    
.node-gateway
    border: 2px solid $primary;
    min-width: auto;
    min-height: auto;
    width: 50px;
    height: 50px;

    display: flex;
    align-items: center;
    justify-content: center;

    .node-content

.gateway-label
    position: absolute
    text-align: center
    bottom: -60px
    left: 50%
    transform: translateX(-50%)
    font-weight: 500
    max-width: 150px
    width: max-content
</style>
