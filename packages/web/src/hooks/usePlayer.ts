import APlayer, { Audio } from 'APlayer'
import { onMounted } from 'vue'
import type { PlayLevel } from '@/types'
import {
    _playlistTrackAll,
    _personalized,
    _intelligenceList,
    _dailyPlaylist,
} from '@/api/playlist'
import { _songUrl, _songDetail, _songLyric } from '@/api/song'

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
        aplayerInstance.pause()
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
        aplayerInstance.pause()
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

        aplayerInstance.list.switch(aplayerInstance.list.audios.length - 1)
        aplayerInstance.play()
    }

    async function playIntelligence(songId: number) {
        const pl = await _dailyPlaylist()
        const list = await _intelligenceList(
            songId,
            pl.recommend[Math.floor(Math.random() * pl.recommend.length)].id, // 随机取一个推荐歌单作为参数
            songId
        )

        const ids: number[] = []
        const songs: Record<number, AplayerSong> = {}
        for (let { songInfo } of list) {
            if (!songInfo.id) continue

            ids.push(songInfo.id)
            songs[songInfo.id] = {
                id: songInfo.id,
                name: songInfo.name,
                artist: songInfo.ar.map((a) => a.name).join(' '),
                cover: songInfo.al.picUrl,
                url: '',
            }
        }

        const urls = await fetchSongUrl(ids)
        urls.forEach((item) => {
            if (songs[item.id]) {
                songs[item.id].url = item.url
                songs[item.id].level = item.level
            }
        })

        aplayerInstance.list.clear()
        const values = Object.values(songs)

        const index = ids.findIndex((id) => id === songId)
        if (~index) {
            aplayerInstance.list.add(values)
            aplayerInstance.list.switch(index)
        } else {
            const [url, { songs }] = await Promise.all([
                fetchSongUrl(songId),
                _songDetail(songId),
            ])
            const song = songs[0]
            values.unshift({
                name: song.name,
                artist: song.ar.map((a) => a.name).join(' '),
                cover: song.al.picUrl,
                url: url[0].url,
            })

            aplayerInstance.list.add(values)
            aplayerInstance.list.switch(0)
        }

        aplayerInstance.play()
    }

    function currentSong(): Audio | null {
        return (
            aplayerInstance.list?.audios?.[aplayerInstance.list?.index] ?? null
        )
    }

    // 加载歌词
    async function getSongLyric() {
        const audio = currentSong()
        if (typeof audio?.id === 'number') {
            const {
                lrc: { lyric },
            } = await _songLyric(audio.id)
            if (lyric) {
                audio.lrc = lyric
                aplayerInstance.lrc.parsed[aplayerInstance.list.index] =
                    aplayerInstance.lrc.parse(lyric)
                aplayerInstance.lrc.switch(aplayerInstance.list?.index)
            }
        }
    }

    function onLoadstart() {
        getSongLyric()
    }

    onMounted(() => {
        if (!aplayerInstance) {
            aplayerInstance = new APlayer({
                container: document.getElementById('aplayer-control')!,
                fixed: true,
                audio: [],
                theme: '#121212',
                lrcType: 1,
            })

            aplayerInstance.on('loadstart', onLoadstart)
        }
    })

    return {
        playListById,
        playSongById,
        playIntelligence,
    }
}
