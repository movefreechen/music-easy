import APlayer, { Audio } from 'APlayer'
import { onMounted } from 'vue'
import type { PlayLevel } from '@/types'
import {
    _playlistTrackAll,
    _personalized,
    _intelligenceList,
    _dailyPlaylist,
    _personalFM,
} from '@/api/playlist'
import { _songUrl, _songDetail, _songLyric } from '@/api/song'

let aplayerInstance: APlayer
let isFM: boolean // 私人fm模式
let loading: boolean

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

let tryCount = 0

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
        isFM = false
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
        isFM = false
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
        isFM = false
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

    async function playPersonalFM() {
        if (loading) return

        loading = true
        const list = await _personalFM()
        const ids: number[] = []
        const songs: Record<number, AplayerSong> = {}
        list.forEach((song) => {
            ids.push(song.id)
            songs[song.id] = {
                id: song.id,
                name: song.name,
                artist: song.artists.map((a) => a.name).join(' '),
                cover: song.album.picUrl,
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

        if (!isFM) {
            aplayerInstance.list.clear()
        }

        isFM = true

        const values = Object.values(songs)
        aplayerInstance.list.add(values)
        aplayerInstance.play()
        Promise.resolve().then(() => {
            loading = false
        })
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

    async function onError() {
        aplayerInstance.pause()
        const song = currentSong()

        if (song?.id) {
            if (tryCount > 2) {
                tryCount = 0
                aplayerInstance.skipForward()
                return aplayerInstance.play()
            }

            tryCount++

            const urls = await fetchSongUrl(song.id)
            song.url = urls[0].url
            aplayerInstance.list.switch(aplayerInstance.list?.index)
            aplayerInstance.play()
        } else {
            aplayerInstance.skipForward()
            aplayerInstance.play()
        }
    }

    function onPlay() {
        if (!aplayerInstance.list?.audios.length) {
            playPersonalFM()
        } else if (
            isFM &&
            aplayerInstance.list.index ===
                aplayerInstance.list.audios.length - 2
        ) {
            // 私人fm 每次接口获取三首歌，播放最后二首快时获取下面三首
            playPersonalFM()
        }
    }

    onMounted(() => {
        if (!aplayerInstance) {
            aplayerInstance = new APlayer({
                container: document.getElementById('aplayer-control')!,
                fixed: true,
                audio: [],
                theme: '#121212',
                lrcType: 1,
                skipForwardWhenError: false,
            })

            aplayerInstance.on('loadstart', onLoadstart)
            aplayerInstance.on('error', onError)
            aplayerInstance.on('play', onPlay)
        }
    })

    return {
        playListById,
        playSongById,
        playIntelligence,
    }
}
