<script lang="ts" setup>
import usePlayer from '@/hooks/usePlayer'
import { computed, ref, watchEffect } from 'vue'
import { _likeIdlist } from '@/api/my'
import { _songDetail } from '@/api/song'
import useUserStore from '@/store/user'
import MusicTable, {
    type ItemList,
    type ItemSong,
} from '@/components/MusicTable.vue'
import { useRouter } from 'vue-router'
import { Artist } from '@/types'
import { SEARCH_TYPE } from '@/constant'

const router = useRouter()
usePlayer()

const userStore = useUserStore()
const isLogin = computed(() => userStore.profile.isLogin)
const isAnonimous = computed(() => userStore.isAnonimous)

const loading = ref(true)

const toggle = ref(0) // 0 喜欢的音乐 1 创建的歌单 2 收藏的歌单
watchEffect(() => {
    if (isLogin || isAnonimous) {
        switch (toggle.value) {
            case 0:
                getMyLikeList()
                break
        }
    }
})

const listType = ref<'playList' | 'songList'>('songList')
const items = ref<ItemSong[] | ItemList[]>([])

const isIntelligence = ref(false)
async function getMyLikeList() {
    loading.value = true

    const { ids } = await _likeIdlist(userStore.profile.userId!)
    const { songs } = await _songDetail(ids)
    items.value = songs.map((song) => ({
        ...song,
        album: song.al.name,
        picUrl: song.al.picUrl,
        artists: song.ar,
    }))
    isIntelligence.value = true

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
            <v-btn :value="1"> 创建的歌单 </v-btn>
            <v-btn :value="2"> 收藏的歌单 </v-btn>
        </v-btn-toggle>
        <MusicTable
            :type="listType"
            :items="items"
            :loading="loading"
            :intelligence="isIntelligence"
            @artist-click="onArtistClick"
        ></MusicTable>
    </div>
</template>
