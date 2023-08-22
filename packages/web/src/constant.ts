export const USER_COOKIE_KEY = 'USER_COOKIE'

// 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频, 1018:综合, 2000:声音
export const SEARCH_TYPE = {
    SONG: 1,
    ALBUM: 10,
    ARTIST: 100,
    PLAYLIST: 1000,
    USER: 1002,
    MV: 1004,
    LRC: 1006,
    RADIO: 1009,
} as const

export const HTML_ZOOM = 'HTML_ZOOM'
