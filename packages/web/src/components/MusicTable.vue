<script setup lang="ts">
import { VDataTableVirtual } from 'vuetify/labs/VDataTable'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import type { PropType } from 'vue'
import type { Artist } from '@/types'
import { computed, ref } from 'vue'
import usePlayer from '@/hooks/usePlayer'
import PlayListDetail from '@/components/PlaylistDetail.vue'

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
}

const emits = defineEmits(['artistClick'])

const props = defineProps({
    loading: Boolean,
    type: String as PropType<'playList' | 'songList'>,
    items: Array as PropType<Array<ItemSong | ItemList>>,
    intelligence: Boolean, // 心动模式
})

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
</script>

<template>
    <v-skeleton-loader
        type="article"
        v-show="props.loading"
    ></v-skeleton-loader>
    <v-data-table-virtual
        fixed-header
        :headers="headers"
        :items="props.items"
        height="600"
        item-value="name"
        v-show="!props.loading"
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
        <template v-slot:item.actions="{ item }">
            <v-btn
                class="ms-2"
                icon="mdi-play"
                variant="text"
                @click="onPlayClick(item.raw.id)"
            ></v-btn>
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
    </v-data-table-virtual>
    <play-list-detail
        v-model="showListDetail"
        :id="listDetailId"
    ></play-list-detail>
</template>
