<template>
  <q-layout view="lHh Lpr lFf" class="custom-layout">

    <Topbar 
      @toggleLeftDrawer="toggleLeftDrawer"
      @toggleAgentDrawer="toggleAgentDrawer"
    />
    <!-- Область для активации сайдбара при наведении -->
    <div 
      class="drawer-trigger" 
      @mouseenter="showDrawer"
    ></div>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      class="custom-drawer"
      @mouseleave="hideDrawer"
    >
      <DiagramSidebarList :diagrams="diagrams" />
    </q-drawer>

    <q-drawer
      v-model="agentDrawerOpen"
      bordered
      side="right"
      :width="600"
      class="agent-drawer"
    >
      <AgentSidebar 
        :messages="agentMessages" 
        :chatName="agentChatName"
        @closeSidebar="agentDrawerOpen = false" 
      />
    </q-drawer>

    <q-page-container class="custom-page-container">
      <q-page class="custom-page">
        <slot></slot>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import Topbar from '@/components/Topbar.vue';
import DiagramSidebarList from '@/components/DiagramSidebarList.vue';
import AgentSidebar from '@/components/AgentSidebar.vue';
import { QLayout, QDrawer, QPageContainer, QPage } from 'quasar';
import { useQuery } from '@tanstack/vue-query';
import { ai } from '@/services/diagram';
import { TOGGLE_AGENT_SIDEBAR_KEY, VALIDATE_DIAGRAM_KEY, VALIDATE_DIAGRAM_LOADING_KEY } from '@/__data__/injectionKeys';
import { useAgentChat } from '@/composables/useAgentChat';
const leftDrawerOpen = ref(false);
const agentDrawerOpen = ref(false);
const agentMessages = ref<any[]>([]);
const agentChatName = ref('Ассистент');
const { validateDiagram, isValidationLoading } = useAgentChat()

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function showDrawer() {
  leftDrawerOpen.value = true;
}

function hideDrawer() {
  leftDrawerOpen.value = false;
}

function toggleAgentDrawer() {
  agentDrawerOpen.value = !agentDrawerOpen.value;
}


const { data: diagrams } = useQuery({
  queryKey: ['diagrams'],
  queryFn: () => {
    return ai.getDiagrams()
  },
  initialData: []
})

provide(TOGGLE_AGENT_SIDEBAR_KEY, toggleAgentDrawer)
provide(VALIDATE_DIAGRAM_KEY, validateDiagram)
provide(VALIDATE_DIAGRAM_LOADING_KEY, computed(() => isValidationLoading.value))
</script>

<style lang="sass">
@import '../assets/quasar-variables.sass'

.custom-layout
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
  background-color: $light
  color: $text-main

.custom-drawer
  background-color: $light
  border-right: 1px solid $border
  box-shadow: none !important
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)

.agent-drawer
  background-color: $light
  border-left: 1px solid $border
  box-shadow: none !important
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)

.drawer-trigger
  position: fixed
  top: 60px // Высота шапки
  left: 0
  width: 15px
  height: calc(100vh - 60px)
  z-index: 100
  background-color: transparent

.custom-list-header
  color: $text-main
  font-weight: 600
  padding: 16px
  font-size: 0.875rem
  letter-spacing: 0.025em
  text-transform: uppercase

.custom-list
  padding: 8px 0

.q-drawer__content
  padding-top: 12px


// Кнопки и элементы управления
.q-btn
  transition: all 0.2s ease

.q-btn--standard
  background-color: $accent
  color: white

.q-btn--standard:hover
  background-color: $accent-hover

.custom-page-container
  background-color: $light

.custom-page
  // max-width: 1200px
  margin: 0 auto
  // padding: 16px
</style>