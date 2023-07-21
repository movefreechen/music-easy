<script setup lang="ts">
import { Album, Artist } from '@/types'
import { PropType } from 'vue'

defineProps({
    id: {
        type: Number,
        default: 0,
    },
    name: String,
    playCount: {
        type: Number,
        default: 0,
    },
    artist: {
        type: Array as PropType<Artist[]>,
        default: undefined,
    },
    album: {
        type: Object as PropType<Album>,
    },
    reason: String,
})

function onPlayClick() {}
</script>

<template>
    <v-lazy :options="{ threshold: 0.5 }" transition="fade-transition">
        <v-card>
            <v-img
                :src="album?.picUrl"
                class="align-end"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                height="140px"
                cover
            >
                <v-card-title
                    class="text-white !text-[16px] h-10"
                    v-text="name"
                ></v-card-title>
                <v-card-subtitle v-if="reason">
                    <v-chip
                        variant="elevated"
                        color="#D32F2F"
                        class="!text-white"
                    >
                        {{ reason }}
                    </v-chip>
                </v-card-subtitle>
                <v-card-actions>
                    <v-btn
                        @click.stop="onPlayClick"
                        class="ms-2"
                        icon="mdi-play"
                        variant="text"
                    ></v-btn>
                </v-card-actions>
            </v-img>
        </v-card>
    </v-lazy>
</template>
