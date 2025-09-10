<template>
  <div class="diagram-creator q-pa-md">
    <q-card class="diagram-form-card" :bordered="false" :flat="true">
      <q-card-section>
        <div class="text-h4 text-weight-bold q-mb-md text-main">Создание диаграммы</div>
        <div class="text-subtitle1 q-mb-md text-secondary">Опишите что вы хотите визуализировать, и мы создадим диаграмму за вас</div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md">

            <div class="form-section text-field-container">
              <q-input
                v-model="diagramDescription"
                outlined
                autogrow
                type="textarea"
                label="Описание диаграммы"
                rows="8"
                class="description-field"
                bg-color="surface"
              >
                <template #prepend>
                  <q-btn
                    v-if="isVoiceSupported"
                    :color="isRecording ? 'negative' : 'primary'"
                    :icon="isRecording ? 'stop_circle' : 'mic'"
                    :loading="isTranscribing"
                    round
                    flat
                    class="voice-btn"
                    @click="handleVoiceRecording"
                  >
                    <q-tooltip>{{ isRecording ? 'Остановить запись' : 'Голосовой ввод' }}</q-tooltip>
                  </q-btn>
                </template>

                <template #append>
                  <q-btn
                    v-show="diagramDescription"
                    icon="chevron_right"
                    class="create-btn"
                    unelevated
                    :disable="!diagramDescription"
                    :loading="isPending"
                    @click="onSubmit"
                  >
                    <q-tooltip>Сгенерировать</q-tooltip>
                  </q-btn>
                </template>
              </q-input>
              <div class="recording-status" v-if="isRecording">
                <q-spinner color="negative" size="1em" class="q-mr-sm" />
                <span class="text-negative">Запись голоса...</span>
              </div>
            </div>

            <div class="bottom-row">
              <q-btn icon="settings" label="test" @click="testDiagram"></q-btn>
              <ModelPicker v-model="model" />
              <q-space></q-space>
              <q-btn icon="note_add" color="secondary" @click="createEmptyDiagram">
                <q-tooltip>Создать пустую диаграмму</q-tooltip>
              </q-btn>
            </div>

        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  QCard, 
  QCardSection, 
  QForm, 
  QInput, 
  QBtn, 
  QSpinner, 
  QTooltip,
  QChip,
  useQuasar,
  QSpace
} from 'quasar';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ai } from '../../services/diagram';
import { DEFAULT_MODEL, TEST_PROMPTS } from '@/__data__/const';
import { useRouter } from 'vue-router';
import { getDiagramQueryKey } from '@/__data__/queryKeys';
import { DiagramState } from '@/types/diagram';
import { useSpeech } from '@/composables/useSpeech';
import ModelPicker from '@/components/ModelPicker.vue';

const q = useQuasar();
const diagramDescription = ref('');
const model = ref(DEFAULT_MODEL);
const router = useRouter();
const queryClient = useQueryClient();

const { 
  isRecording, 
  isTranscribing, 
  isVoiceSupported, 
  toggleVoiceRecording
} = useSpeech();

const handleVoiceRecording = () => {
  toggleVoiceRecording((text) => {
    diagramDescription.value = text;
  });
};

const {mutate: createDiagram, isPending, isError} = useMutation({
  mutationFn: (description: string) => ai.generateDiagram(description, model.value),
  onSuccess: (res, description) => {
    q.notify({
      color: 'positive',
      position: 'top',
      message: 'Диаграмма успешно создана',
    })
    queryClient.setQueryData<DiagramState>(getDiagramQueryKey(res.id), res)
    
    router.push({ name: 'diagram', params: { id: res.id }, query: { 
      showChat: description ? `true` : undefined,
      sendValidation: description ? `true` : undefined
    } })
  },
  onError: (error) => {
    console.log('GOT ERR', error)
    q.notify({
      color: 'negative',
      message: error.message ?? 'Ошибка при создании диаграммы',
    })
  }
})

function onSubmit() {
  if(diagramDescription.value.trim() === '') {
    q.notify({
      color: 'negative',
      message: 'Описание диаграммы не может быть пустым',
      caption: 'Чтобы создать пустую диаграмму, нажмите на кнопку +',
    })
    return
  }
  createDiagram(diagramDescription.value);
}

function testDiagram() {
  diagramDescription.value = TEST_PROMPTS[Math.floor(Math.random() * TEST_PROMPTS.length)];
  createDiagram(diagramDescription.value);
}

function createEmptyDiagram() {
  createDiagram('');
}
</script>

<style lang="sass">
@import '../../assets/quasar-variables.sass'

.diagram-creator
  display: flex
  justify-content: center
  align-items: center
  min-height: 90vh
  background-color: $light

.diagram-form-card
  max-width: 800px
  width: 100%
  border-radius: 12px
  background-color: $light

.form-container
  width: 100%
  display: flex
  flex-direction: column
  gap: 16px

.form-section
  width: 100%
  margin-bottom: 16px

.description-field
  width: 100%
  border-radius: 8px

.description-field :deep(.q-field__control)
  background-color: $surface

.recording-status
  display: flex
  align-items: center
  margin-top: 8px
  font-size: 0.9rem

.voice-btn
  transition: all 0.3s ease

.voice-btn:hover
  transform: scale(1.05)

.text-field-container
  position: relative

.diagram-type-selector
  display: flex
  flex-wrap: wrap
  gap: 12px

.diagram-type-chip
  transition: all 0.2s ease
  font-weight: 500
  padding: 8px 16px
  border: 1px solid $border
  background-color: $surface
  color: $text-secondary

.diagram-type-chip-selected
  background-color: $primary !important
  color: white !important
  border-color: $primary !important
  box-shadow: $shadow-sm

.create-btn
  background: $primary
  color: white
  font-weight: 600
  letter-spacing: 0.025em
  transition: all 0.2s ease

.create-btn:hover:not(:disabled)
  box-shadow: $shadow-md
  transform: translateY(-1px)

.bottom-row
  display: flex
  justify-content: flex-end
  gap: 5px
  margin-top: 16px
</style>