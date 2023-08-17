import { PlayLevel } from '@/types'
import request from './request'

export function _songUrl(id: number | number[]): Promise<
    {
        url: string
        type: string
        level: PlayLevel
        id: number
    }[]
> {
    return request({
        url: '/song/url/v1',
        params: {
            id: (Array.isArray(id) ? id : [id]).join(','),
            level: 'jymaster',
        },
    })
}

export function _songDetail(id: number | number[]): Promise<{
    privileges: {
        id: number
        pl: number
        plLevel: PlayLevel // 可播放等级
        playMaxBrLevel: PlayLevel
    }[]
    songs: {
        id: number
        name: string
        al: {
            id: number
            name: string
            picUrl: string
        } // 专辑列表
        ar: {
            id: number
            name: string
        }[] // 歌手列表
    }[]
}> {
    return request({
        url: '/song/detail',
        params: {
            ids: (Array.isArray(id) ? id : [id]).join(','),
        },
    })
}

export function _songLyric(id: number): Promise<{
    lrc: {
        lyric: string
    }
    version: number
}> {
    return request({
        url: '/lyric',
        params: { id },
    })
}

export function _userLikeSongIdlist(uid: number): Promise<{
    ids: number[]
}> {
    return request({
        url: '/likelist',
        params: { uid },
    })
}
