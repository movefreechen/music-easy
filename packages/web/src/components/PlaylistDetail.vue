<script setup lang="ts">
import { ref } from 'vue'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { _playlistTrackAll } from '@/api/playlist'
import { PlayLevel } from '@/types'
import { watch } from 'vue'
import { watchEffect } from 'vue'
import usePlayer from '@/hooks/usePlayer'
import { _likeSong } from '@/api/song'
import useMusicStore from '@/store/music'
import useNotify from '@/hooks/useNotify'
import { debounce } from 'lodash-es'

defineOptions({
    name: 'play-list',
})

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    id: {
        type: Number,
        default: null,
    },
})

const $emit = defineEmits(['update:modelValue'])

const { playListById } = usePlayer()

const open = ref(false)
watchEffect(() => {
    open.value = props.modelValue
})

interface Music {
    name: string
    id: number
    artist: {
        id: number
        name: string
    }[]
    album: {
        id: number
        name: string
        picUrl: string
    } // 专辑
    pl: PlayLevel
}
const musicList = ref<Music[]>([])
const offset = ref(0)
const limit = ref(10)
const loading = ref(false)
const more = ref(true)

async function fetchAllMusic() {
    if (!more.value) return
    loading.value = true

    const { privileges, songs } = await _playlistTrackAll(
        props.id,
        offset.value * 20,
        20
    )
    musicList.value = musicList.value.concat(
        songs.map((song, index) => ({
            name: song.name,
            id: song.id,
            artist: song.ar,
            album: song.al,
            pl: privileges[index].plLevel,
        }))
    )

    if (songs.length < limit.value) {
        more.value = false
    }

    offset.value++
    loading.value = false
}

function onMoreClick() {
    if (!loading.value) fetchAllMusic()
}

watch(
    () => props.modelValue,
    (nval) => {
        typeof props.id === 'number' && nval && fetchAllMusic()
    }
)
// 退出清空
watch(
    () => props.modelValue,
    (nval) => {
        if (!nval) {
            musicList.value = []
            more.value = true
            offset.value = 0
        }
    }
)

// 播放歌单
function onMusicPlayClick(songId: number) {
    playListById(props.id, songId)
}

const notify = useNotify()
const musicStore = useMusicStore()

function likeSongCheck(id: number) {
    return musicStore.userLikeSongIds.includes(id)
}

const likeSong = debounce(
    async (id: number) => {
        const isLike = musicStore.userLikeSongIds.includes(id)
        await _likeSong(id, !isLike)
        notify({
            text: `${isLike ? '取消喜欢' : '喜欢'}成功`,
        })
        musicStore.$likeIdsUpdate()
    },
    1000,
    {
        leading: true,
        trailing: false,
    }
)
</script>

<template>
    <v-dialog
        v-model="open"
        width="700px"
        height="550px"
        @update:model-value="(val: Boolean) => $emit('update:modelValue', val)"
    >
        <v-skeleton-loader
            :elevation="6"
            type="article"
            v-if="!musicList.length"
        ></v-skeleton-loader>
        <v-list lines="two" v-else>
            <v-virtual-scroll :items="musicList" item-height="48">
                <template v-slot:default="{ item }">
                    <v-list-item :prepend-avatar="item.album.picUrl">
                        <v-list-item-title class="mb-1">{{
                            item.name
                        }}</v-list-item-title>
                        <v-list-item-subtitle class="mb-1">
                            <template v-for="(a, i) in item.artist">
                                <v-chip
                                    :key="a.id"
                                    class="mr-2"
                                    color="primary"
                                    label
                                    v-if="i < 2"
                                >
                                    <v-icon
                                        start
                                        icon="mdi-account-circle-outline"
                                    ></v-icon>
                                    {{ a.name }}
                                </v-chip></template
                            >
                        </v-list-item-subtitle>
                        <v-list-item-subtitle>
                            <v-chip class="ma-2" color="green" label>
                                <v-icon start icon="mdi-album"></v-icon>
                                {{ item.album.name }}
                            </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn
                                class="ms-2"
                                icon="mdi-play"
                                variant="text"
                                @click="onMusicPlayClick(item.id)"
                            ></v-btn>
                            <v-btn
                                class="ms-2"
                                variant="text"
                                @click="likeSong(item.id)"
                            >
                                <template #append>
                                    <v-icon
                                        icon="mdi-heart"
                                        :color="
                                            likeSongCheck(item.id)
                                                ? '#D32F2F'
                                                : ''
                                        "
                                    ></v-icon>
                                </template>
                            </v-btn>
                        </template>
                    </v-list-item>
                </template>
            </v-virtual-scroll>
            <div class="flex justify-center mt-2" v-if="more">
                <v-btn
                    variant="outlined"
                    @click="onMoreClick"
                    :disabled="loading"
                >
                    加载更多
                </v-btn>
            </div>
        </v-list>
    </v-dialog>
</template>
