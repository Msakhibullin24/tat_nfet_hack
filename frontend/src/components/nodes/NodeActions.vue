<template>
    <div class="node-actions">
        <q-btn class="node-edit-btn" icon="edit" size="xs" round @click="emit('editNode', $event)" />
        <q-btn class="node-delete-btn" icon="delete" size="xs" round @click="emit('deleteNode', $event)" />
    </div>
</template>

<script lang="ts" setup>
import { QIcon, QBtn } from 'quasar';
import type { NodeEmits } from './nodeProps';

const emit = defineEmits<NodeEmits>()
</script>

<style lang="sass">
.node-actions
  opacity: 0
  justify-content: flex-end
  margin-bottom: 5px
  position: absolute
  top: 0
  left: calc(100% + 60px)
  right: 5px
  transition: opacity 0.2s

  display: grid
  grid-template-columns: 1fr 1fr
  gap: 5px

.node-edit-btn
  cursor: pointer
  color: #666
  transition: color 0.2s
  &:hover
    color: #000
</style>