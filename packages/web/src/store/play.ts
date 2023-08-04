import { defineStore } from 'pinia'
import type { Song } from '@/types'
import { ref } from 'vue'
import { _playlistTrackAll } from '@/api/playlist'
import { _songUrl } from '@/api/song'
import mitt from 'mitt'

export enum PLAY_LIST_EVENTS {
    CHANG,
    ADD,
}

const event = mitt<Record<PLAY_LIST_EVENTS, unknown>>()

const usePlayStore = defineStore('play', () => {
    // 总播放列表
    const playSongList = ref<Song[]>([])

    async function fetchSongUrl(id: number | number[]) {
        const res = await _songUrl(id)
        return res.map((item) => ({
            id: item.id,
            url: item.url,
            type: item.type,
            level: item.level,
        }))
    }

    function $on(type: PLAY_LIST_EVENTS, cb: () => unknown) {
        event.on(type, cb)
    }

    function $off(type: PLAY_LIST_EVENTS, cb: () => unknown) {
        event.off(type, cb)
    }

    function $addSong(song: Song) {
        playSongList.value.push(song)
        event.emit(PLAY_LIST_EVENTS.ADD)
    }

    // 根据id播放歌单 playSongIndex 从歌单中某首歌曲开始
    async function $playListById(id: number) {
        const { songs: s } = await _playlistTrackAll(id)
        const ids: number[] = []
        const songs: Record<number, Song> = {}
        s.forEach((song) => {
            ids.push(song.id)
            songs[song.id] = {
                id: song.id,
                name: song.name,
                artist: song.ar,
                album: song.al,
            }
        })
        const urls = await fetchSongUrl(ids)
        urls.forEach((item) => {
            if (songs[item.id]) {
                songs[item.id].url = item.url
                songs[item.id].level = item.level
            }
        })

        playSongList.value = Object.values(songs)
        event.emit(PLAY_LIST_EVENTS.CHANG)
    }

    return {
        playSongList,
        $playListById,
        $addSong,
        $on,
        $off,
    }
})

export default usePlayStore
