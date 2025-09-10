<template>
   
   <q-list class="custom-list">
        <q-item class="q-mb-md">
          <q-item-section>
            <q-btn 
              href="/"
              label="Создать диаграмму" 
              color="primary" 
              class="custom-btn"
              rounded
            />
          </q-item-section>
        </q-item>
        <q-separator></q-separator>
        <q-item-label
          header
          class="custom-list-header"
        >
          Ваши диаграммы
        </q-item-label>
    
        <q-item v-for="diagram in diagrams" :key="diagram.id" :href="`/diagram/${diagram.id}`">
            <q-item-section class="diagram-item">
                <q-item-label>
                  <q-icon name="home" />
                  {{ diagram.shortText ?? diagram.name }}
                </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-btn 
                icon="delete" 
                size="xs"
                flat 
                round 
                color="primary" 
                class="delete-btn"
                @click.stop="handleDeleteDiagram(diagram.id)"
                />
            </q-item-section>
        </q-item>
      </q-list>
</template>

<script setup lang="ts">
import { QList, QItem, QItemLabel, QSeparator, QItemSection, QBtn, QToolbar, QToolbarTitle } from 'quasar';
import { ai } from '@/services/diagram';
import { DiagramListItem } from '@/types/diagram';
import { useQueryClient } from '@tanstack/vue-query';
import { useRouter, useRoute } from 'vue-router';
defineOptions({
    name: 'SidebarList'
})

defineProps<{
    diagrams: DiagramListItem[]
}>()

const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient();

const handleDeleteDiagram = async (id: string) => {
    if(route.params.id === id) {
        router.push('/')
    }
    await ai.deleteDiagram(id);
    queryClient.invalidateQueries({ queryKey: ['diagrams'] });
}
</script>

<style lang="sass">
@import '../assets/quasar-variables.sass'

.diagram-item
    display: flex
    flex-direction: row
    justify-content: space-between
    align-items: center

.delete-btn
  opacity: 0
  &:hover
    opacity: 1
</style>
