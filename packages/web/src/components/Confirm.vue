<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
    id: Symbol,
    title: String,
    content: String,
    onConfirm: Function,
    onCancel: Function,
})

const open = ref(true)

function onConfirm() {
    open.value = false
    props.onConfirm && props.onConfirm()
}

function onCancel() {
    open.value = false
    props.onCancel && props.onCancel()
}
</script>

<template>
    <v-dialog :modelValue="open" persistent width="auto">
        <v-card>
            <v-card-title class="text-h5" v-if="title">
                {{ props.title }}
            </v-card-title>
            <v-card-text v-if="content">
                {{ props.content }}
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="#FFD600" variant="text" @click="onCancel">
                    取消
                </v-btn>
                <v-btn color="#D84315" variant="text" @click="onConfirm">
                    确认
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
