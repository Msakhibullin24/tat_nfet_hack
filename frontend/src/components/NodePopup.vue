<script lang="ts" setup>
import { Ref, ref, watch } from 'vue'
import { QDialog, QCard, QCardSection, QCardActions, QBtn, QInput, QSelect, QColor, QPopupProxy } from 'quasar'
import { AppNode, EventType, GatewayType, NodeType } from '@/types/diagram'
import { useVueFlow } from '@vue-flow/core'
import { isDiagramEdited } from '@/__data__/store'
import { ColorMap } from '@/__data__/const'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  nodeId: {
    type: String,
    default: '',
  },
  isCreating: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'update', 'create'])

const { findNode, addNodes } = useVueFlow()

const dialog = ref(false)
const initialNodeData = {
    label: '',
    meta: {
        gatewayType: undefined,
        eventType: undefined,
        color: '#FFF',
    }
}
const nodeData: Ref<Partial<AppNode['data']>> = ref(initialNodeData)

const nodeType = ref()

const nodeTypes = [
  { label: 'Задача', value: NodeType.Task },
  { label: 'Шлюз', value: NodeType.Gateway },
  { label: 'Событие', value: NodeType.Event },
]

const gatewayTypes = [
  { label: 'Параллельный (AND)', value: GatewayType.AND },
  { label: 'Включающий (OR)', value: GatewayType.OR },
  { label: 'Исключающий (XOR)', value: GatewayType.XOR },
]

const eventTypes = [
  { label: 'Старт', value: EventType.Start },
  { label: 'Таймер', value: EventType.Timer },
  { label: 'Ошибка', value: EventType.ErrorBoundary },
  { label: 'Конец', value: EventType.End },
]

watch(() => props.isOpen, (val) => {
  dialog.value = val
  if (val && !props.isCreating) {
    loadNodeData()
  } else if (val && props.isCreating) {
    resetForm()
  }
})

function loadNodeData() {
  if (!props.nodeId) return
  
  const node = findNode(props.nodeId)
  if (node) {
    nodeData.value = node.data
    nodeData.value!.color = ColorMap[node.data.color as keyof typeof ColorMap] ?? node.data.color ?? '#FFF'
    nodeType.value = node.type || NodeType.Task
  }
}

function resetForm() {
  nodeType.value = NodeType.Task
  nodeData.value = {...initialNodeData}
}

function onClose() {
  resetForm()
  emit('close')
}

function onSave() {
  if (props.isCreating) {
    const id = `node-${Date.now()}`
    const newNode = {
      id: id,
      data: nodeData.value,
      type: nodeType.value,
      position: { x: 100, y: 100 },
    }
    
    addNodes([newNode])
    emit('create', newNode)
    resetForm()
  } else {
    const node = findNode(props.nodeId)
    if (node) {
      node.type = nodeType.value
      node.data.color = nodeData.value!.color
      if (nodeType.value === NodeType.Gateway) {
        node.data.gatewayType = nodeData.value!.gatewayType
      }
      if (nodeType.value === NodeType.Event) {
        node.data.eventType = nodeData.value!.eventType
      }
      emit('update', node)
    }
  }
  
  isDiagramEdited.value = true
  onClose()
}
</script>

<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ props.isCreating ? 'Создать новый элемент' : 'Редактировать элемент' }}</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="nodeData.label"
          label="Название"
          outlined
          dense
          autofocus
        />
        
        <q-select
          v-model="nodeType"
          :options="nodeTypes"
          label="Тип элемента"
          outlined
          dense
          emit-value
          map-options
          class="q-mt-md"
        />

        <q-select 
          v-if="nodeType === NodeType.Gateway" 
          v-model="nodeData!.gatewayType" 
          :options="gatewayTypes"
          label="Тип шлюза" 
          outlined 
          dense
          emit-value 
          map-options 
          class="q-mt-md"
         />

        <q-select 
          v-if="nodeType === NodeType.Event" 
          v-model="nodeData!.eventType" 
          :options="eventTypes"
          label="Тип события" 
          outlined 
          dense
          emit-value 
          map-options 
          class="q-mt-md"
         />

         <q-input
            v-model="nodeData!.color"
            outlined
            dense
            class="q-mt-md"
        >
            <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="nodeData!.color" /> 
                </q-popup-proxy>
            </q-icon>
            </template>
        </q-input>

      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Отмена" color="grey" @click="onClose" />
        <q-btn flat label="Сохранить" color="primary" @click="onSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
