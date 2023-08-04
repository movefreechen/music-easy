import APlayer from 'APlayer'
import { onMounted } from 'vue'
import type { PlayLevel } from '@/types'
import { _playlistTrackAll } from '@/api/playlist'
import { _songUrl, _songDetail } from '@/api/song'

let aplayerInstance: APlayer

interface AplayerSong {
    id?: number
    name: string
    artist?: string
    url: string
    cover: string
    lrc?: string
    theme?: string
    level?: PlayLevel
}

async function fetchSongUrl(id: number | number[]) {
    const res = await _songUrl(id)
    return res.map((item) => ({
        id: item.id,
        url: item.url,
        type: item.type,
        level: item.level,
    }))
}

export default function usePlayer() {
    async function playListById(id: number, songId?: number) {
        const { songs: s } = await _playlistTrackAll(id)
        const ids: number[] = []
        const songs: Record<number, AplayerSong> = {}
        s.forEach((song) => {
            ids.push(song.id)
            songs[song.id] = {
                id: song.id,
                name: song.name,
                artist: song.ar.map((a) => a.name).join(' '),
                cover: song.al.picUrl,
                url: '',
            }
        })
        const urls = await fetchSongUrl(ids)
        urls.forEach((item) => {
            if (songs[item.id]) {
                songs[item.id].url = item.url
                songs[item.id].level = item.level
            }
        })

        aplayerInstance.list.clear()
        const values = Object.values(songs)
        aplayerInstance.list.add(values)

        // 从歌单中某个歌曲开始播放
        if (songId !== undefined) {
            const index = values.findIndex((s) => s.id === songId)
            aplayerInstance.list.switch(index)
        }
        aplayerInstance.play()
    }

    async function playSongById(id: number) {
        const [url, { songs }] = await Promise.all([
            fetchSongUrl(id),
            _songDetail(id),
        ])
        const song = songs[0]
        aplayerInstance.list.add({
            name: song.name,
            artist: song.ar.map((a) => a.name).join(' '),
            cover: song.al.picUrl,
            url: url[0].url,
        })
    }

    onMounted(() => {
        if (!aplayerInstance) {
            aplayerInstance = new APlayer({
                container: document.getElementById('aplayer-control')!,
                fixed: true,
                audio: [],
                theme: '#121212',
            })
        }
    })

    return {
        playListById,
        playSongById,
    }
}
