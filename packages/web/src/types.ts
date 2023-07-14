export enum MsgCommand {
    GET_COOKIE,
    SAVE_COOKIE,
}

export type Message = {
    command: MsgCommand
    data?: any
}
