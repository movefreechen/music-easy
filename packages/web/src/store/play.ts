import { defineStore } from 'pinia'
import type { PlayMode, Song } from '@/types'
import { ref } from 'vue'
import { _playlistTrackAll } from '@/api/playlist'

const usePlayStore = defineStore('play', () => {
    // 总播放列表
    const playSongList = ref<Song[]>([])
    const currSong = ref<Song>()

    // 播放顺序
    const playSort = ref<number[]>([])
    const currSortIndex = ref<number>()

    // 顺序 随机 单曲循环
    const playMode = ref<PlayMode>('order')

    function $nextSong() {}

    function $prevSong() {}

    function createSort() {
        if (playMode.value === 'order') {
            playSort.value = new Array(playSongList.value.length)
                .fill(0)
                .map((_, index) => index)

            currSortIndex.value = 0
        }

        // 播放中切换播放模式
        if (currSong.value) {
            const index = playSongList.value.findIndex(
                (song) => song.id === currSong.value?.id
            )
            if (~index) {
                currSortIndex.value = index
            }
        }
    }

    // 根据id播放歌单
    async function $playListById(id: number) {
        const { songs } = await _playlistTrackAll(id)
        playSongList.value = songs.map((song) => ({
            id: song.id,
            name: song.name,
            artist: song.ar,
        }))
    }

    return {
        playSongList,
        currSong,
        playMode,
        $nextSong,
        $prevSong,
        $playListById,
    }
})

export default usePlayStore
