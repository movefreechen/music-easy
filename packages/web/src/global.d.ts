type AsyncReturnType<T extends (...args: any) => any> = T extends (
    ...args: any
) => Promise<infer U>
    ? U
    : T extends (...args: any) => infer U
    ? U
    : any

type ValueOf<T> = T[keyof T]
type FullScreenType = 'web' | 'browser'

declare module 'APlayer' {
    export class Audio {
        id?: number
        name: string
        url: string
        artist?: string
        cover?: string
        lrc?: string
        theme?: string
        type?: string
        customAudioType?: Record<string, void>;
        [key: string]: any
    }

    interface APlayerOptions {
        container?: HTMLElement
        fixed?: boolean
        mini?: boolean
        autoplay?: boolean
        theme?: string
        loop?: 'all' | 'one' | 'none'
        order?: 'list' | 'random'
        preload?: 'none' | 'metadata' | 'auto'
        volume?: number
        mutex?: boolean
        listFolded?: boolean
        listMaxHeight?: String
        lrcType?: number
        audio?: any
        storageName?: string
        customAudioType?: Record<string, void>
        customInit?: (player: any, src: APlayerOptions) => Promise<any>
    }

    interface FullScreen {
        request(type: FullScreenType): void

        cancel(type: FullScreenType): void
    }

    type Events =
        | 'abort'
        | 'canplay'
        | 'canplaythrough'
        | 'durationchange'
        | 'emptied'
        | 'ended'
        | 'error'
        | 'loadeddata'
        | 'loadedmetadata'
        | 'loadstart'
        | 'mozaudioavailable'
        | 'pause'
        | 'play'
        | 'playing'
        | 'progress'
        | 'ratechange'
        | 'seeked'
        | 'seeking'
        | 'stalled'
        | 'suspend'
        | 'timeupdate'
        | 'volumechange'
        | 'waiting'
        | 'listshow'
        | 'listhide'
        | 'listadd'
        | 'listremove'
        | 'listswitch'
        | 'listclear'
        | 'noticeshow'
        | 'noticehide'
        | 'destroy'
        | 'lrcshow'
        | 'lrchide'

    export default class APlayer {
        events: any
        audio: HTMLAudioElement
        fullScreen: FullScreen

        constructor(options: APlayerOptions)

        options: APlayerOptions

        play(): void

        pause(): void

        seek(time: number): void

        toggle(): void

        on(event: Events, handler: () => void): void

        volume(percentage: number, nostorage: boolean, nonotice: boolean): void

        theme(color: string, index: number): void

        setMode(mode: 'normal' | 'mini'): void

        mode(): string

        notice(text: string, time?: number, opacity?: number): void

        skipBack(): void

        skipForward(): void

        destroy(): void

        lrc: {
            show(): void
            hide(): void
            toggle(): void
            switch(index: number): void
            parse(lrc: string): string[]
            player: APlayer
            parsed: string[][]
        }

        list: {
            show(): void
            hide(): void
            toggle(): void
            add(audios: Array<Audio> | Audio): void
            remove(index: number): void
            switch(index: number): void
            clear(): void
            audios: Audio[]
            index: number
        }
    }
}
