<script lang="ts" setup>
import { $personalizedList } from '@/api/personalized'
import { onMounted, ref } from 'vue'
import PlayList from '@/components/playlist.vue'

const panel = ref<number[]>([0])

const pList = ref<AsyncReturnType<typeof $personalizedList>>([])
async function fetchPersonalized() {
    pList.value = await $personalizedList()
}
onMounted(() => {
    fetchPersonalized()
})

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

const showListDetail = ref(false)
const listDetailId = ref<number>()
// 展示歌单全部歌曲
function onListItemClick(id: number) {
    showListDetail.value = true
    listDetailId.value = id
}

function onPlayClick() {}
</script>

<template>
    <div>
        <v-expansion-panels v-model="panel">
            <v-expansion-panel title="推荐歌单">
                <v-expansion-panel-text class="mx-[-24px]">
                    <v-row>
                        <v-col :cols="4" v-for="item in pList" :key="item.id">
                            <v-lazy
                                :options="{ threshold: 0.5 }"
                                transition="fade-transition"
                            >
                                <v-card @click="onListItemClick(item.id)">
                                    <v-img
                                        :src="item.picUrl"
                                        class="align-end"
                                        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                                        height="140px"
                                        cover
                                    >
                                        <v-card-title
                                            class="text-white !text-[15px] h-10"
                                            v-text="item.name"
                                        ></v-card-title>
                                        <v-card-subtitle
                                            >{{
                                                numberCount(item.playCount)
                                            }}次播放</v-card-subtitle
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
                        </v-col>
                    </v-row>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
        <play-list v-model="showListDetail" :id="listDetailId"></play-list>
    </div>
</template>
