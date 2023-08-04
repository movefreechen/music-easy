<script lang="ts" setup>
import type { PlayList } from '@/types'
import { _dailyPlaylist, _dailySongs } from '@/api/playlist'
import { ref } from 'vue'
import useUserStore from '@/store/user'
import { computed } from 'vue'
import { watchEffect } from 'vue'
import { VDataTableVirtual } from 'vuetify/labs/VDataTable'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import PlayListDetail from '@/components/PlaylistDetail.vue'
import usePlayer from '@/hooks/usePlayer'
import { debounce } from 'lodash-es'
import { _search } from '@/api/search'

const { playSongById } = usePlayer()

const toggle = ref(0)

const userStore = useUserStore()
const isLogin = computed(() => userStore.profile.isLogin)
const isAnonimous = computed(() => userStore.isAnonimous)

const listType = ref<'playList' | 'songList'>('playList')
const headers = computed(() => {
    return (
        listType.value === 'songList'
            ? [
                  {
                      title: '封面',
                      align: 'start',
                      sortable: false,
                      key: 'picUrl',
                  },
                  {
                      title: '曲名',
                      align: 'end',
                      sortable: false,
                      key: 'name',
                      width: 300,
                  },
                  {
                      title: '歌手',
                      align: 'end',
                      sortable: false,
                      key: 'artist',
                      width: 250,
                  },
                  {
                      title: '专辑',
                      align: 'end',
                      sortable: false,
                      key: 'album',
                      width: 200,
                  },
              ]
            : [
                  {
                      title: '封面',
                      align: 'start',
                      sortable: false,
                      key: 'picUrl',
                  },
                  {
                      title: '名称',
                      align: 'end',
                      sortable: false,
                      key: 'name',
                      width: 300,
                  },
                  {
                      title: '播放次数',
                      align: 'end',
                      sortable: false,
                      key: 'playcount',
                      width: 150,
                  },
              ]
    ).concat([{ title: '操作', align: 'end', key: 'actions', sortable: false }])
})

type ItemSong = {
    id: number
    picUrl?: string
    name: string
    artist?: string
    album?: string
}
type ItemList = {
    id: number
    picUrl?: string
    name: string
    playcount?: number
}
const items = ref<ItemSong[] | ItemList[]>([])
const loading = ref(false)

const offset = ref(0)
const limit = ref(20)

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

const dailyList = ref<PlayList[]>([])
async function fetchDailyList() {
    loading.value = true
    listType.value = 'playList'
    if (!dailyList.value.length) {
        const { recommend } = await _dailyPlaylist()
        dailyList.value = recommend
    }

    items.value = dailyList.value
    loading.value = false
}

const dailySongs = ref<ItemSong[]>([])
async function featchDailySongs() {
    loading.value = true
    listType.value = 'songList'

    if (!dailySongs.value.length) {
        const { dailySongs: ds, recommendReasons } = await _dailySongs()
        dailySongs.value = []
        ds.forEach((song, index) => {
            song.recommendReason =
                recommendReasons?.[index]?.reason ?? song.recommendReason
            dailySongs.value.push({
                name: song.name,
                picUrl: song.al.picUrl,
                artist: song.ar.map((a) => a.name).join(' '),
                id: song.id,
                album: song.al.name,
            })
        })
    }

    items.value = dailySongs.value
    loading.value = false
}

const searchValue = ref('')
// 1歌曲 2专辑
const searchType = ref<1 | 10>(1)
const onSearch = debounce(
    async () => {
        loading.value = true
        listType.value = searchType.value === 1 ? 'songList' : 'playList'

        const list = await _search({
            keywords: searchValue.value,
            type: searchType.value,
        })
        console.log(list)
        loading.value = false
    },
    500,
    {
        leading: true,
    }
)

watchEffect(() => {
    if (isLogin || isAnonimous) {
        switch (toggle.value) {
            case 0:
                fetchDailyList()
                break
            case 1:
                featchDailySongs()
                break
        }
    }
})

const showListDetail = ref(false)
const listDetailId = ref<number>()
// 展示歌单全部歌曲
function onListNameClick(id: number) {
    if (listType.value === 'playList') {
        showListDetail.value = true
        listDetailId.value = id
    } else if (listType.value === 'songList') {
        playSongById(id)
    }
}
</script>

<template>
    <div class="relative">
        <div class="flex items-center h-[30px]">
            <v-select
                label="搜索选项"
                :items="[
                    {
                        title: '歌曲',
                        value: 1,
                    },
                    {
                        title: '专辑',
                        value: 10,
                    },
                ]"
                density="compact"
                variant="solo"
                single-line
                hide-details
                v-mode="searchType"
            ></v-select>
            <v-text-field
                density="compact"
                variant="solo"
                label="搜歌名/歌手/专辑/歌单"
                append-inner-icon="mdi-magnify"
                single-line
                hide-details
                v-model="searchValue"
                @click:append-inner="onSearch"
            ></v-text-field>
        </div>

        <v-btn-toggle v-model="toggle" group rounded="0" wdith="100%">
            <v-btn :value="0"> 每日推荐歌单 </v-btn>
            <v-btn :value="1"> 每日推荐歌曲 </v-btn>
        </v-btn-toggle>
        <v-skeleton-loader type="article" v-show="loading"></v-skeleton-loader>
        <v-data-table-virtual
            fixed-header
            :headers="headers"
            :items="items"
            class="elevation-1"
            height="600"
            item-value="name"
            v-show="!loading"
        >
            <template #item.name="{ item }">
                <span
                    class="cursor-pointer"
                    @click="onListNameClick(item.raw.id)"
                    >{{ item.columns.name }}</span
                >
            </template>
            <template #item.picUrl="{ item }">
                <v-img
                    v-if="item.columns?.picUrl"
                    :src="item.columns?.picUrl"
                    class="align-end px-2 py-2"
                    gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                    height="80px"
                    width="80px"
                    cover
                />
            </template>
            <template v-slot:item.playcount="{ item }">
                {{ numberCount(item.columns.playcount) }}
            </template>
            <template v-slot:item.actions>
                <v-btn class="ms-2" icon="mdi-play" variant="text"></v-btn>
            </template>
        </v-data-table-virtual>
        <play-list-detail
            v-model="showListDetail"
            :id="listDetailId"
        ></play-list-detail>
    </div>
</template>
