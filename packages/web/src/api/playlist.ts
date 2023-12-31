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
    limit = 20
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
        limit,
    }

    return request('/playlist/track/all', {
        params,
    })
}

export function _playListDetail(id: number): Promise<{
    playlist: {
        id: number
        name: string
        coverImgUrl: string
        userId: number
        createTime: number
        trackCount: number
        playCount: number
        subscribedCount: number
        subscribed: boolean
        creator: {
            userId: number
            nickname: string
            avatarUrl: string
        }
        tracks: {
            name: string
            id: number
            ar: Artist[]
            alia: string[]
            al: Album
        }[]
    }
}> {
    return request({
        url: '/playlist/detail',
        params: { id },
    })
}

// 推荐歌单
export function _personalized(limit = 30) {
    return request({
        url: '/personalized',
        params: {
            limit,
        },
    })
}

// 心动模式歌单
export function _intelligenceList(
    songId: number,
    playListId: number,
    startId?: number
): Promise<
    {
        songInfo: {
            id: number
            cf: string
            mv: number
            al: Album
            ar: Artist[]
            name: string
        }
    }[]
> {
    return request({
        url: '/playmode/intelligence/list',
        params: {
            id: songId,
            pid: playListId,
            sid: startId,
        },
    })
}

// 用户的歌单
export function _userPlayList(
    userId: number,
    offset = 0,
    limit = 20
): Promise<{
    playlist: {
        id: number
        name: string
        playCount: number
        trackCount: number
        creator: {
            userId: number
            avatarUrl: string
            nickname: string
        }
        coverImgUrl: string
        subscribed: boolean
    }[]
    more: boolean
}> {
    return request({
        url: '/user/playlist',
        params: { uid: userId, offset, limit },
    })
}

export function _personalFM(): Promise<
    {
        album: Album
        artists: Artist[]
        id: number
        reason: string
        name: string
    }[]
> {
    return request({
        url: '/personal_fm',
    })
}

// 收藏/取消收藏歌单 t 1收藏 2取消
export function _subscribe(t: 1 | 2, id: number) {
    return request({
        url: '/playlist/subscribe',
        params: {
            t,
            id,
        },
    })
}
