<template>
    <q-select 
        v-model="model"
        :options="items" 
        label="Модель"
        outlined
        dense
        emit-value
        map-options
    />
</template>

<script lang="ts" setup>
import { MODELS } from '@/__data__/const';
import { QSelect } from 'quasar';
import { ref } from 'vue';

defineOptions({
    name: 'ModelPicker'
})

const model = defineModel<string>()

const items = ref(MODELS)
</script>