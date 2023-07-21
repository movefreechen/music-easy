export enum MsgCommand {
    GET_COOKIE,
    SAVE_COOKIE,
}

export type Message = {
    command: MsgCommand
    data?: any
}

export type Profile = {
    nickname: string
    avatarUrl: string
    isLogin: boolean
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
}

export type Song = {
    id: number
    name: string
    url?: string
    artist?: Artist[]
    album?: Album
}

export type PlayMode = 'order' | 'random' | 'cycle'
