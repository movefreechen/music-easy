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
