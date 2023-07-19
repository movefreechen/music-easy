import type { PlayLevel } from '@/types'
import request from './request'

export function $playlistTrackAll(
    id: number,
    offset = 0,
    limit = 10
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
    return request('/playlist/track/all', {
        params: {
            id,
            limit,
            offset,
        },
    })
}
