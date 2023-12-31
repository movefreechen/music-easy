export enum MsgCommand {
    GET_COOKIE,
    SAVE_COOKIE,
    GET_ZOOM,
    SET_ZOOM,
}

export type Message = {
    command: MsgCommand
    data?: any
}

export type Profile = {
    nickname: string
    avatarUrl: string
    isLogin: boolean
    userId: number | undefined
    [key: string]: any
}

export type PlayLevel =
    | 'standard'
    | 'higher'
    | 'exhigh'
    | 'lossless'
    | 'hires'
    | 'jyeffect'
    | 'sky'
    | 'jymaster'

export type PlayList = {
    id: number
    playcount?: number
    playCount?: number
    trackCount?: number
    subscribed?: boolean
    picUrl: string
    name: string
}

export type Album = {
    id: number
    name: string
    picUrl: string
}

export type Artist = {
    id: number
    name: string
    picUrl?: string
}

export type Song = {
    id: number
    name: string
    url?: string
    artist?: Artist[]
    album?: Album
    level?: PlayLevel
}

export type PlayMode = 'order' | 'random' | 'cycle'
