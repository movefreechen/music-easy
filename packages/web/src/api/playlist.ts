import type { Album, Artist, PlayLevel } from '@/types'
import request from './request'

export function _dailyPlaylist(): Promise<{
    recommend: {
        id: number
        playcount: number
        trackCount: number
        picUrl: string
        name: string
    }[]
}> {
    return request('/recommend/resource')
}

export function _dailySongs(): Promise<{
    dailySongs: {
        id: number
        name: string
        privilege: {
            id: number
            plLevel: PlayLevel
            playMaxBrLevel: PlayLevel
        }
        recommendReason: string
        ar: Artist[]
        al: Album
    }[]
    recommendReasons: {
        reason: string
    }[]
}> {
    return request('/recommend/songs')
}

export function _playlistTrackAll(
    id: number,
    offset = 0,
    limit = 0
): Promise<{
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
    const params: any = {
        id,
        offset,
    }

    if (limit > 0) {
        params.limit = limit
    }
    return request('/playlist/track/all', {
        params,
    })
}
