<script lang="ts" setup>
import { QBtn, QTooltip } from 'quasar'
import { Panel, useVueFlow } from '@vue-flow/core'
import { useQuasar } from 'quasar'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ai } from '@/services/diagram'
import { getDiagramQueryKey } from '@/__data__/queryKeys'
import { AppNode, DiagramState, NodeType } from '@/types/diagram'
import { isDiagramEdited } from '@/__data__/store'
import { useRoute } from 'vue-router'
import { Node } from '@vue-flow/core'
import { convertNodesToAppNodes } from '@/utils/layout'
import { convertToBPMN } from '@/utils/bpmnConverter'
import { useElements } from '@/composables/useElements'

const { getNodes, getEdges } = useVueFlow()
const q = useQuasar()
const queryClient = useQueryClient()
const route = useRoute()

const emit = defineEmits(['openCreateNodePopup'])

const { setElements } = useElements()
function onSave() {
    updateDiagram()
}


const {mutate: updateDiagram, isPending: isUpdating} = useMutation({
  mutationFn: () => {
    const diagramState = queryClient.getQueryData<DiagramState>(getDiagramQueryKey(route.params.id as string))
    if (diagramState) {
      return ai.updateDiagram(route.params.id as string, diagramState)
    }
    throw new Error('Диаграмма не найдена')
  },
  onSuccess: () => {
    isDiagramEdited.value = false
    queryClient.invalidateQueries({ queryKey: getDiagramQueryKey(route.params.id as string) })
    q.notify({
      color: 'positive',
      message: 'Диаграмма успешно сохранена',
    })
  }
})

function onAdd() {
  emit('openCreateNodePopup')
}

function copyBPMNtoClipboard() {
    const appNodes = convertNodesToAppNodes(getNodes.value)

    // Получаем BPMN
    const bpmnXml = convertToBPMN(appNodes, getEdges.value)

    navigator.clipboard.writeText(bpmnXml)
    q.notify({
      color: 'positive',
      message: 'Диаграмма скопирована в буфер обмена',
    })
}

const pasteJson = async () => {
  const bpmnJson = await navigator.clipboard.readText()
  const bpmnState = JSON.parse(bpmnJson) as AppNode[]
  setElements(bpmnState)
}
</script>

<template>
  <Panel position="top-right">
    <div class="buttons">
      <q-btn 
        v-if="isDiagramEdited" 
        :loading="isUpdating"
        color="black"
        icon="save"
        round
        @click="onSave"
      >
        <q-tooltip>Сохранить</q-tooltip>
      </q-btn>
      <q-btn 
          icon="file_download"
          round
          color="black"
          @click="pasteJson"
      >
          <q-tooltip>Вставить из JSON</q-tooltip>
      </q-btn>
      <q-btn 
          icon="file_download"
          round
          color="accent"
          @click="copyBPMNtoClipboard"
      >
          <q-tooltip>Копировать в буфер обмена</q-tooltip>
      </q-btn>
      <q-btn 
        icon="add"
        round
        color="primary"
        @click="onAdd"
      >
        <q-tooltip>Добавить</q-tooltip>
      </q-btn>
    </div>
  </Panel>
</template>

<style lang="sass" scoped>
.buttons
  display: flex
  gap: 8px
</style>