<script lang="ts" setup>
import type { Artist } from '@/types'
import { _dailyPlaylist, _dailySongs } from '@/api/playlist'
import useUserStore from '@/store/user'
import { computed } from 'vue'
import { watchEffect } from 'vue'
import { debounce } from 'lodash-es'
import { _search } from '@/api/search'
import { watch, ref } from 'vue'
import MusicTable, {
    type ItemList,
    type ItemSong,
} from '@/components/MusicTable.vue'
import { useRoute } from 'vue-router'
import { SEARCH_TYPE } from '@/constant'

// query 参数 search searchType 对应搜索相关变量
const route = useRoute()

const toggle = ref(0) // -1搜索 0推荐歌单 1推荐歌曲

const userStore = useUserStore()
const isLogin = computed(() => userStore.profile.isLogin)
const isAnonimous = computed(() => userStore.isAnonimous)

const listType = ref<'playList' | 'songList'>('playList')

const items = ref<ItemSong[] | ItemList[]>([])
const loading = ref(false)

const page = ref(1)
const limit = ref(20)
const total = ref(0)
const paginationLength = computed(() => Math.floor(total.value / limit.value))

// 每日推荐歌单
async function fetchDailyList() {
    loading.value = true
    listType.value = 'playList'
    total.value = 0

    const { recommend } = await _dailyPlaylist()
    items.value = recommend
    loading.value = false
}

// 每日推荐歌曲
async function featchDailySongs() {
    loading.value = true
    listType.value = 'songList'
    total.value = 0
    items.value = []

    const { dailySongs: ds, recommendReasons } = await _dailySongs()
    ds.forEach((song, index) => {
        song.recommendReason =
            recommendReasons?.[index]?.reason ?? song.recommendReason
        items.value.push({
            name: song.name,
            picUrl: song.al.picUrl,
            artists: song.ar,
            id: song.id,
            album: song.al.name,
        })
    })

    loading.value = false
}

watchEffect(() => {
    if (isLogin.value || isAnonimous.value) {
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

watch(page, () => {
    switch (toggle.value) {
        case -1:
            search()
    }
})

// 搜索相关
const searchValue = ref('')

// 1歌曲 10专辑 1000 歌单
type SearchType = ValueOf<typeof SEARCH_TYPE>
const searchType = ref<SearchType>(SEARCH_TYPE.SONG)

const onSearch = debounce(
    () => {
        page.value = 1
        total.value = 0

        listType.value = searchType.value === 1 ? 'songList' : 'playList'
        toggle.value = -1
        search()
    },
    500,
    {
        leading: true,
    }
)
async function search() {
    loading.value = true
    const res = await _search({
        keywords: searchValue.value,
        type: searchType.value,
        offset: (page.value - 1) * limit.value,
        limit: limit.value,
    })

    if (listType.value === 'playList') {
        const list = res as AsyncReturnType<typeof _search<'playList'>>
        items.value = list.playlists.map((item) => ({
            id: item.id,
            picUrl: item.coverImgUrl,
            name: item.name,
            playCount: item.playCount,
        })) as ItemList[]
        total.value = list.playlistCount
    } else {
        const list = res as AsyncReturnType<typeof _search<'songList'>>
        items.value = list.songs.map((item) => ({
            id: item.id,
            name: item.name,
            picUrl: item.al.picUrl,
            artists: item.ar,
            album: item.al?.name,
        })) as ItemSong[]

        total.value = list.songCount
    }
    loading.value = false
}

const querySearch = (route.query?.search as string)?.trim()
if (querySearch) {
    searchValue.value = querySearch
    const type = parseInt(route.query?.searchType as string)
    if (
        !isNaN(type) &&
        Object.values(SEARCH_TYPE).includes(type as SearchType)
    ) {
        searchType.value = type as SearchType
    }
    onSearch()
}

function onArtistClick(artist: Artist) {
    searchValue.value = artist.name
    onSearch()
}
</script>

<template>
    <div class="relative">
        <div class="flex items-center h-[30px] mb-3">
            <v-select
                label="搜索选项"
                :items="[
                    {
                        title: '歌曲',
                        value: 1,
                    },
                    {
                        title: '歌单',
                        value: 1000,
                    },
                ]"
                density="compact"
                variant="solo"
                single-line
                hide-details
                v-model="searchType"
                class="w-[30px]"
            ></v-select>
            <v-text-field
                density="compact"
                variant="solo"
                label="关键词"
                append-inner-icon="mdi-magnify"
                single-line
                hide-details
                v-model="searchValue"
                @click:append-inner="onSearch"
                @keydown.enter="onSearch"
            ></v-text-field>
        </div>

        <v-btn-toggle v-model="toggle" group rounded="0" wdith="100%">
            <v-btn :value="0"> 每日推荐歌单 </v-btn>
            <v-btn :value="1"> 每日推荐歌曲 </v-btn>
        </v-btn-toggle>
        <MusicTable
            :type="listType"
            :items="items"
            :loading="loading"
            @artist-click="onArtistClick"
        ></MusicTable>
        <v-pagination
            v-show="total > 0"
            :length="paginationLength"
            v-model:model-value="page"
        ></v-pagination>
    </div>
</template>
