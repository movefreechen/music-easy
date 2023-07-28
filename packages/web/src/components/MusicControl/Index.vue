<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
    name: 'music-control',
})
</script>

<template>
    <div class="play-control">
        <div
            class="relative z-10 w-full h-full bg-white px-[25px] py-[10px] rounded-lg"
        >
            <v-icon
                icon="mdi-close"
                class="play-control-base top-[10px] right-[10px] !text-[22px]"
            ></v-icon>
            <v-icon
                icon="mdi-rewind"
                class="play-control-icon left-[100px]"
            ></v-icon>
            <v-icon
                class="play-control-icon left-1/2 -translate-x-1/2"
                icon="mdi-play"
            ></v-icon>
            <v-icon
                icon="mdi-fast-forward"
                class="play-control-icon right-[100px]"
            ></v-icon>
            <div class="play-album">
                <v-img
                    class="w-full h-full object-cover"
                    src="http://p2.music.126.net/9Up1Bh_F5Y_a5DplC1aWAQ==/7728467232325371.jpg"
                ></v-img>
            </div>
        </div>
        <div class="play-info"></div>
    </div>
</template>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

.play-control {
    width: 422px;
    height: 120px;
    z-index: 10000;
    @apply fixed left-1/2 -translate-x-1/2 bottom-10;
}

.play-control-base {
    @apply !absolute text-[#d7dce2] cursor-pointer;
}

.play-control-base:hover {
    @apply text-[#7a8490];
}

.play-control-icon {
    @apply play-control-base !text-[38px] bottom-[10px];
}

.play-album {
    width: 102px;
    height: 102px;
    top: -50px;
    left: 20px;
    @apply rounded-full absolute bg-black will-change-auto animate-spin overflow-hidden;
    animation-duration: 10s;
}

.play-album::before {
    width: 16px;
    height: 16px;
    content: '';
    z-index: 10;
    @apply absolute left-1/2 -translate-x-1/2 top-1/2 left-1/2 -translate-y-1/2 bg-white rounded-full;
}

.play-info {
    left: 10px;
    right: 10px;
    height: 95px;
    @apply absolute bottom-[200px] bg-[#fff6fb] rounded-lg;
}
</style>
