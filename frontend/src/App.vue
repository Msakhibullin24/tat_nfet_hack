<script setup lang="ts">
import Main from '@/layouts/main.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  components: { Main }
})

const route = useRoute()
const layout = computed(() => route.meta.layout || 'main')
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
