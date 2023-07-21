<script setup lang="ts">
defineProps({
    id: {
        type: Number,
        default: 0,
    },
    picUrl: String,
    name: String,
    playCount: {
        type: Number,
        default: 0,
    },
})

const $emit = defineEmits(['onPlayListClick'])

function numberCount(num: number) {
    if (num < 1000) {
        return num + ''
    }
    if (num >= 1000 && num < 10000) {
        return (num / 1000).toFixed(2) + 'K'
    }

    if (num > 100000) {
        return (num / 10000).toFixed(2) + 'W'
    }
}

// 展示歌单全部歌曲
function onClick(id: number) {
    if (id > 0) {
        $emit('onPlayListClick', id)
    }
}

function onPlayClick() {}
</script>

<template>
    <v-lazy :options="{ threshold: 0.5 }" transition="fade-transition">
        <v-card @click="onClick(id)">
            <v-img
                :src="picUrl"
                class="align-end"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                height="140px"
                cover
            >
                <v-card-title
                    class="text-white !text-[15px] h-10"
                    v-text="name"
                ></v-card-title>
                <v-card-subtitle
                    >{{ numberCount(playCount) }}次播放</v-card-subtitle
                >
                <v-card-actions>
                    <v-btn
                        @click.stop="onPlayClick"
                        class="ms-2"
                        icon="mdi-play"
                        variant="text"
                    ></v-btn>
                </v-card-actions>
            </v-img> </v-card
    ></v-lazy>
</template>
