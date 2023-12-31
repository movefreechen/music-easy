<script setup lang="ts">
import { VDataTable } from 'vuetify/labs/VDataTable'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import type { PropType } from 'vue'
import type { Artist } from '@/types'
import { computed, ref } from 'vue'
import usePlayer from '@/hooks/usePlayer'
import PlayListDetail from '@/components/PlaylistDetail.vue'
import useUserStore from '@/store/user'
import { debounce } from 'lodash-es'
import { _playListDetail, _subscribe } from '@/api/playlist'
import { _likeSong } from '@/api/song'
import useNotify from '@/hooks/useNotify'
import useMusicStore from '@/store/music'

export type ItemSong = {
    id: number
    picUrl?: string
    name: string
    artists?: Artist[]
    album?: string
}
export type ItemList = {
    id: number
    picUrl?: string
    name: string
    playcount?: number
    artists?: Artist[]
    creator?: number
    subscribed?: boolean
    isOwner?: boolean
}

const emits = defineEmits(['artistClick', 'bottom'])

const props = defineProps({
    loading: Boolean,
    type: String as PropType<'playList' | 'songList'>,
    items: Array as PropType<Array<ItemSong | ItemList>>,
    intelligence: Boolean, // 心动模式
})

const userStore = useUserStore()
const notify = useNotify()
const musicStore = useMusicStore()
const { playSongById, playListById, playIntelligence } = usePlayer()

const headers = computed(() => {
    return (
        props.type === 'songList'
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
                      key: 'artists',
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

const showListDetail = ref(false)
const listDetailId = ref<number>()
// 展示歌单全部歌曲
function onListNameClick(id: number) {
    if (props.type === 'playList') {
        showListDetail.value = true
        listDetailId.value = id
    } else if (props.type === 'songList') {
        playSongById(id)
    }
}

function onPlayClick(id: number) {
    props.type === 'playList'
        ? playListById(id)
        : props.intelligence
        ? playIntelligence(id)
        : playSongById(id)
}

function onArtistClick(artist: Artist) {
    emits('artistClick', artist)
}

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

function likeSongCheck(id: number) {
    return props.type === 'songList' && musicStore.userLikeSongIds.includes(id)
}

// 收藏/取消 歌单
async function subscribePlayList(id: number, subscribed?: boolean) {
    if (subscribed === undefined) {
        const { playlist: detail } = await _playListDetail(id)
        subscribed = detail.subscribed
    }

    await _subscribe(subscribed ? 2 : 1, id)
    notify({
        text: subscribed ? '取消收藏成功' : '收藏成功',
    })
}

async function likeSong(id: number) {
    const isLike = musicStore.userLikeSongIds.includes(id)
    await _likeSong(id, !isLike)
    notify({
        text: `${isLike ? '取消喜欢' : '喜欢'}成功`,
    })
    musicStore.$likeIdsUpdate()
}

const onLikeClick = debounce(
    (record: ItemList | ItemSong) => {
        props.type === 'playList'
            ? subscribePlayList(record.id, (record as ItemList).subscribed)
            : likeSong(record.id)
    },
    1000,
    {
        leading: true,
        trailing: false,
    }
)
</script>

<template>
    <v-skeleton-loader
        type="article"
        v-show="props.loading"
    ></v-skeleton-loader>
    <v-data-table
        fixed-header
        :headers="headers"
        :items="props.items"
        height="600"
        item-value="name"
        v-show="!props.loading"
        :hide-default-footer="true"
        :items-per-page="-1"
    >
        <template #item.name="{ item }">
            <span class="cursor-pointer" @click="onListNameClick(item.raw.id)">
                <v-chip
                    size="x-small"
                    class="ma-2"
                    :color="
                        userStore.profile.userId === item.raw.creator
                            ? '#00E676'
                            : '#FF8F00'
                    "
                    text-color="white"
                    v-if="item.raw.creator"
                >
                    {{
                        userStore.profile.userId === item.raw.creator
                            ? '我创建的'
                            : '我收藏的'
                    }}
                </v-chip>
                {{ item.columns.name }}
            </span>
        </template>
        <template #item.picUrl="{ item }">
            <v-img
                v-if="item.columns?.picUrl"
                :src="item.columns?.picUrl"
                class="align-end px-2 py-2"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                height="100px"
                width="100px"
                cover
            />
        </template>
        <template v-slot:item.playcount="{ item }">
            {{ numberCount(item.columns.playcount) }}
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn
                class="ms-2"
                icon="mdi-play"
                variant="text"
                @click="onPlayClick(item.raw.id)"
            ></v-btn>
            <v-btn class="ms-2" variant="text" @click="onLikeClick(item.raw)">
                <template #append>
                    <v-icon
                        icon="mdi-heart"
                        :color="likeSongCheck(item.raw.id) ? '#D32F2F' : ''"
                    ></v-icon>
                </template>
            </v-btn>
        </template>
        <template #item.artists="{ item }">
            <span
                v-for="a in item.raw.artists"
                class="mr-1 cursor-pointer"
                @click="onArtistClick(a)"
            >
                {{ a.name }}
            </span>
        </template>
        <template #bottom></template>
    </v-data-table>
    <play-list-detail
        v-model="showListDetail"
        :id="listDetailId"
    ></play-list-detail>
</template>
