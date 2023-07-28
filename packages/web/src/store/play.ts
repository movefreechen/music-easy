import { defineStore } from 'pinia'
import type { PlayMode, Song } from '@/types'
import { computed, ref } from 'vue'
import { _playlistTrackAll } from '@/api/playlist'
import { debounce } from 'lodash-es'
import randomize from '@/utils/randomize'

const usePlayStore = defineStore('play', () => {
    // 总播放列表
    const playSongList = ref<Song[]>([])
    const currSong = ref<Song>()

    // 播放顺序
    const playSort = ref<number[]>([])
    const currSortIndex = ref<number>()
    const canNext = computed(
        () =>
            typeof currSortIndex.value === 'number' &&
            currSortIndex.value < playSongList.value.length - 1
    )
    const canPrev = computed(
        () => typeof currSortIndex.value === 'number' && currSortIndex.value > 0
    )

    // 顺序 随机 单曲循环
    const playMode = ref<PlayMode>('order')

    function $play() {
        if (typeof currSortIndex.value === 'number')
            currSong.value = playSongList.value[currSortIndex.value]
    }

    function $nextSong() {
        if (canNext.value) {
            currSortIndex.value! += 1
            currSong.value = playSongList.value[currSortIndex.value!]
        }
    }

    function $prevSong() {
        if (canPrev.value) {
            currSortIndex.value! -= 1
            currSong.value = playSongList.value[currSortIndex.value!]
        }
    }

    function $createSort() {
        const orderSort = new Array(playSongList.value.length)
            .fill(0)
            .map((_, index) => index)

        if (playMode.value === 'order') {
            playSort.value = orderSort

            // 播放中切换播放模式，找到当前播放歌曲
            if (currSong.value) {
                const index = playSongList.value.findIndex(
                    (song) => song.id === currSong.value?.id
                )
                if (~index) {
                    currSortIndex.value = index
                }
            }
        }

        if (playMode.value === 'random') {
            const sort = randomize(orderSort, orderSort.length)
            playSort.value = sort
            currSortIndex.value = 0
        }
    }

    const $changePlayMode = debounce(
        () => {
            switch (playMode.value) {
                case 'order':
                    playMode.value = 'random'
                    break
                case 'random':
                    playMode.value = 'cycle'
                    break
                case 'cycle':
                    playMode.value = 'order'
                    break
            }
            $createSort()
        },
        1000,
        {
            leading: true,
        }
    )

    // 根据id播放歌单
    async function $playListById(id: number) {
        const { songs } = await _playlistTrackAll(id)
        playSongList.value = songs.map((song) => ({
            id: song.id,
            name: song.name,
            artist: song.ar,
        }))
        $createSort()
        $play()
    }

    return {
        playSongList,
        currSong,
        canNext,
        canPrev,
        playMode,
        $changePlayMode,
        $nextSong,
        $prevSong,
        $playListById,
    }
})

export default usePlayStore
