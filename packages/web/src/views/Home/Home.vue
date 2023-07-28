<script lang="ts" setup>
import type { PlayList } from '@/types'
import { _dailyPlaylist, _dailySongs } from '@/api/playlist'
import { ref } from 'vue'
import PlayListDetail from '@/components/PlaylistDetail.vue'
import PlayListCard from './PlayListCard.vue'
import useUserStore from '@/store/user'
import { computed } from 'vue'
import { watchEffect } from 'vue'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import SongCard from './SongCard.vue'

const userStore = useUserStore()
const isLogin = computed(() => userStore.profile.isLogin)
const isAnonimous = computed(() => userStore.isAnonimous)

const dailyList = ref<PlayList[]>([])
async function fetchDailyList() {
    const { recommend } = await _dailyPlaylist()
    dailyList.value = recommend
}
watchEffect(() => {
    if (isLogin || isAnonimous) {
        fetchDailyList()
    }
})

const dailySongs = ref<AsyncReturnType<typeof _dailySongs>['dailySongs']>([])
async function featchDailySongs() {
    const { dailySongs: ds, recommendReasons } = await _dailySongs()

    ds.forEach((song, index) => {
        song.recommendReason =
            recommendReasons?.[index]?.reason ?? song.recommendReason
    })
    dailySongs.value = ds
}
const panel = ref<number[]>([0])
function onPanelSelected(index: number, value: boolean) {
    if (index === 1 && !dailySongs.value.length) {
        featchDailySongs()
    }
}

const showListDetail = ref(false)
const listDetailId = ref<number>()
// 展示歌单全部歌曲
function onPlayListCardClick(id: number) {
    showListDetail.value = true
    listDetailId.value = id
}
</script>

<template>
    <div>
        <v-expansion-panels v-model="panel">
            <v-expansion-panel
                title="每日推荐歌单"
                @group:selected="({ value }) => onPanelSelected(0, value)"
            >
                <v-skeleton-loader
                    type="article"
                    v-if="!dailyList.length"
                ></v-skeleton-loader>
                <v-expansion-panel-text class="mx-[-24px]" v-else>
                    <v-row>
                        <v-col
                            :cols="4"
                            v-for="item in dailyList"
                            :key="item.id"
                        >
                            <play-list-card
                                :id="item.id"
                                :pic-url="item.picUrl"
                                :play-count="item.playcount"
                                :name="item.name"
                                @on-play-list-click="onPlayListCardClick"
                            ></play-list-card>
                        </v-col>
                    </v-row>
                </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel
                title="每日推荐歌曲"
                @group:selected="({ value }) => onPanelSelected(1, value)"
                v-if="isLogin"
            >
                <v-skeleton-loader
                    type="article"
                    v-if="!dailyList.length"
                ></v-skeleton-loader>
                <v-expansion-panel-text class="mx-[-24px]">
                    <v-row>
                        <v-col
                            :cols="3"
                            v-for="item in dailySongs"
                            :key="item.id"
                        >
                            <song-card
                                :id="item.id"
                                :album="item.al"
                                :artist="item.ar"
                                :name="item.name"
                                :reason="item.recommendReason"
                            ></song-card>
                        </v-col>
                    </v-row>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
        <play-list-detail
            v-model="showListDetail"
            :id="listDetailId"
        ></play-list-detail>
    </div>
</template>
