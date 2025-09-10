<template>
    <q-header class="custom-header" color="white">
      <q-toolbar color="secondary" class="toolbar row inline items-center">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          color="black"
          @click="emit('toggleLeftDrawer')"
          class="custom-menu-btn"
        />

        <q-toolbar-title class="custom-title">
          <img src="../assets/svg/the-one-logo.svg" alt="logo" class="logo" height="40px">
        </q-toolbar-title>
        <q-space />
        <q-btn
          v-if="route?.meta?.showAgentButton"
          flat
          dense
          round
          color="black"
          icon="sym_o_splitscreen_right"
          aria-label="Menu"
          @click="emit('toggleAgentDrawer')"
        />
      </q-toolbar>
    </q-header>
</template>

<script setup lang="ts">
import { QHeader, QToolbar, QToolbarTitle, QBtn, QSpace } from 'quasar';
import { useRoute } from 'vue-router';

const route = useRoute()
const emit = defineEmits(['toggleLeftDrawer', 'toggleAgentDrawer'])
</script>

<style lang="sass">

.custom-header
  background-color: $light
  color: $text-main
  height: 60px

.custom-title
  color: $text-main
  font-weight: 600
  letter-spacing: -0.025em

.custom-menu-btn
  color: $text-main

.custom-menu-btn:hover
  background-color: $surface


.toolbar
  background: $light

.q-toolbar
  min-height: 60px
  padding: 0 16px
</style>