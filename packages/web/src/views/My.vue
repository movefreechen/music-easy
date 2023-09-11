<script lang="ts" setup>
import usePlayer from '@/hooks/usePlayer'
import { computed, ref, watchEffect } from 'vue'
import { _songDetail, _userLikeSongIdlist } from '@/api/song'
import useUserStore from '@/store/user'
import MusicTable, {
    type ItemList,
    type ItemSong,
} from '@/components/MusicTable.vue'
import { useRouter } from 'vue-router'
import { Artist } from '@/types'
import { SEARCH_TYPE } from '@/constant'
import { _userPlayList } from '@/api/playlist'
import { _userSubcount } from '@/api/user'
import useMusicStore from '@/store/music'

const router = useRouter()
usePlayer()

const userStore = useUserStore()
const isLogin = computed(() => userStore.profile.isLogin)
const isAnonimous = computed(() => userStore.isAnonimous)

const musicStore = useMusicStore()

const loading = ref(true)

const toggle = ref(0) // 0 喜欢的音乐 1 创建和收藏的歌单
watchEffect(() => {
    if (isLogin || isAnonimous) {
        switch (toggle.value) {
            case 0:
                getMyLikeSongList()
                break
            case 1:
                getMyPlayList()
                break
        }
    }
})

const listType = ref<'playList' | 'songList'>('songList')
const items = ref<ItemSong[] | ItemList[]>([])

const page = ref(1)
const limit = ref(20)
const total = ref(0)
const paginationLength = computed(() => Math.floor(total.value / limit.value))

const isIntelligence = ref(false)
async function getMyLikeSongList() {
    if (!musicStore.userLikeSongIds.length) return

    loading.value = true
    const { songs } = await _songDetail(musicStore.userLikeSongIds)
    items.value = songs.map((song) => ({
        ...song,
        album: song.al.name,
        picUrl: song.al.picUrl,
        artists: song.ar,
    }))
    isIntelligence.value = true

    loading.value = false
}

// 我的歌单， 第一个是我喜欢的歌曲默认删除
async function getMyPlayList() {
    loading.value = true
    listType.value = 'playList'
    const { subPlaylistCount, createdPlaylistCount } = await _userSubcount()
    const { playlist } = await _userPlayList(
        userStore.profile.userId!,
        page.value - 1,
        limit.value
    )

    // 删除我喜欢的歌曲
    if (page.value === 1) playlist.shift()
    items.value = playlist.map((item) => ({
        id: item.id,
        name: item.name,
        picUrl: item.coverImgUrl,
        creator: item.creator.userId,
        playcount: item.playCount,
        subscribed: item.subscribed,
        isOwner: item.creator.userId === userStore.profile.userId,
    })) as ItemList[]

    total.value = subPlaylistCount + createdPlaylistCount - 1
    loading.value = false
}

function onArtistClick(artist: Artist) {
    router.push({
        path: '/',
        query: {
            search: artist.name,
            searchType: SEARCH_TYPE.PLAYLIST,
        },
    })
}
</script>

<template>
    <div class="relative">
        <v-btn-toggle v-model="toggle" group rounded="0" wdith="100%">
            <v-btn :value="0"> 喜欢的音乐 </v-btn>
            <v-btn :value="1"> 我的歌单 </v-btn>
        </v-btn-toggle>
        <MusicTable
            :type="listType"
            :items="items"
            :loading="loading"
            :intelligence="isIntelligence"
            @artist-click="onArtistClick"
        ></MusicTable>
        <v-pagination
            v-show="total > 0"
            :length="paginationLength"
            v-model:model-value="page"
        ></v-pagination>
    </div>
</template>
