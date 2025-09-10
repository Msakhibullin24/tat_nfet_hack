<template>
    <div class="agent-sidebar">
        <div class="agent-sidebar-header" >
            <QChip :label="chatName ?? 'Новый чат'" size="sm" />
            <QSpace />
            <QBtn 
                icon="close"
                size="xs"
                flat
                round
                color="black"
                @click="closeSidebar"
            />
        </div>
        
        <div class="agent-messages" ref="messagesContainer">
            <div v-for="(message, index) in allMessages" :key="index" class="message-item" :class="message.role">
                <div class="message-avatar">
                    <div 
                        class="avatar-icon"
                        :class="message.role === 'user' ? 'bg-primary' : 'bg-secondary'"
                    >
                        {{ message.role === 'user' ? 'Вы' : 'AI' }}
                    </div>
                </div>
                <div class="message-content">
                    <p class="message-date">{{ new Date(message.createdAt).toLocaleString() }}</p>
                    <div class="message-text">
                        {{ message.content }}
                        <template v-if="
                            message.role === 'assistant' && 
                            isValidationLoading &&
                            (index === allMessages.length - 1 || index === allMessages.length - 2)
                        ">
                            <q-chip color="primary" class="q-mt-lg" label="Валидация результата..." />
                        </template>
                    </div>
                </div>
                <div class="message-buttons">
                    <QBtn
                        v-if="message.role === 'assistant' && message.hasData"
                        icon="restore"
                        size="xs"
                        flat
                        round
                        color="black"
                        @click="restoreMessage({messageId: message.id, diagramId: diagramQuery.data.value?.id})"
                    >
                        <QTooltip>Восстановить</QTooltip>
                    </QBtn>
                </div>
            </div>
        </div>
        
        <div class="agent-input-box">
            <QInput 
            v-model="text" 
            placeholder="Планируйте, ищите, создавайте" 
            :loading="sendMessageLoading || isValidationLoading"
            @keyup.enter="sendMessage(diagramQuery.data.value!.id, model)"
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
            </QInput>
            <div class="agent-input-box-actions">
                <QSpace />
                <ModelPicker v-model="model" />
                <QBtn 
                    icon="send"
                    size="xs"
                    color="primary"
                    :disable="!text.trim()"
                    @click="handleSendMessage"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { QInput, QBtn, QSpace, QChip, QTooltip } from 'quasar'
import { ref, watchEffect, nextTick, onMounted, computed, onBeforeMount, inject } from 'vue'
import { useSpeech } from '@/composables/useSpeech'
import { useAgentChat } from '@/composables/useAgentChat'
import { useDiagramQuery } from '@/composables/useDiagramQuery'
import ModelPicker from '@/components/ModelPicker.vue'
import { VALIDATE_DIAGRAM_LOADING_KEY } from '@/__data__/injectionKeys'
import { DEFAULT_MODEL } from '@/__data__/const'

defineOptions({
    name: 'AgentSidebar'
})

const emit = defineEmits<{
    closeSidebar: []
}>()


const messagesContainer = ref<HTMLElement | null>(null)

const { 
  isRecording, 
  isTranscribing, 
  isVoiceSupported, 
  toggleVoiceRecording
} = useSpeech();
const { 
    text, 
    sendMessage, 
    sendMessageLoading, 
    restoreMessage, 
    sendMessageVariables,
 } = useAgentChat()
const isValidationLoading = inject(VALIDATE_DIAGRAM_LOADING_KEY)

// Получаем текущую диаграмму из кэша запросов
const {diagramQuery} = useDiagramQuery()
const model = ref(DEFAULT_MODEL)

const messages = computed(() => {
  return diagramQuery.data.value?.messages || []
})
const chatName = computed(() => {
  return diagramQuery.data.value?.shortText || diagramQuery.data.value?.name || 'Новый чат'
})

const allMessages = computed(() => {
    const msg = [...messages.value]
    if(sendMessageLoading.value && sendMessageVariables.value) {
        console.log('var', sendMessageVariables.value)
        msg.push({
            content: sendMessageVariables.value.content,
            role: 'user',
            id: '1',
            diagramId: sendMessageVariables.value.diagramId!,
            createdAt: new Date().toISOString(),
            hasData: false
        })
    }
    return msg
})


const handleVoiceRecording = () => {
  toggleVoiceRecording((t) => {
    text.value = t;
  });
};

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}

function handleSendMessage() {
    sendMessage(diagramQuery.data.value?.id!, model.value)
    setTimeout(() => {
        scrollToBottom()
    }, 100)
}

const closeSidebar = () => {
    emit('closeSidebar')
}

watchEffect(() => {
    if (messages.value.length) {
        scrollToBottom()
    }
})

onMounted(() => {
    scrollToBottom()
})
</script>

<style lang="sass" scoped>
@import '../assets/quasar-variables.sass'

.agent-sidebar
    background-color: $light
    padding: 10px
    height: calc(100% - 60px)
    display: flex
    flex-direction: column

.agent-sidebar-header
    display: flex
    align-items: center
    justify-content: space-between
    margin-bottom: 10px

.agent-messages
    flex: 1
    overflow-y: auto
    display: flex
    flex-direction: column
    gap: 16px
    margin-bottom: 10px
    padding-right: 5px

.message-item
    display: flex
    gap: 8px
    position: relative
    width: fit-content

    &.user
        flex-direction: row-reverse
        text-align: right
        align-self: flex-end

    &:hover
        .message-buttons
            opacity: 1

.message-avatar
    width: 32px
    height: 32px
    flex-shrink: 0

.message-buttons
    position: absolute
    right: 0
    top: 0
    opacity: 0
    transition: opacity 0.3s ease

.avatar-icon
    width: 100%
    height: 100%
    display: flex
    align-items: center
    justify-content: center
    border-radius: 50%
    font-size: 12px
    background-color: $primary
    color: white

.user .avatar-icon
    background-color: $primary

.message-content
    flex: 1
    background-color: $surface
    border-radius: 8px
    padding: 8px 12px
    border: 1px solid $border

.message-date
    font-size: 12px
    color: $grey-6

.assistant .message-content
    background-color: lighten($primary, 40%)
    border-color: lighten($primary, 20%)

.message-text
    white-space: pre-wrap
    font-size: 14px

.agent-input-box
    border: 1px solid $border
    border-radius: 10px
    padding: 10px
    background-color: $surface

.agent-input-box-actions
    display: flex
    align-items: center
    gap: 5px
    margin-top: 5px
</style>