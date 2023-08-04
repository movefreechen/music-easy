import request from './request'

// type: 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频, 1018:综合, 2000:声音
type Search = {
    keywords: string
    offset?: number
    limit?: number
    type?: 1 | 10 | 100 | 1000 | 1002 | 1004 | 1006 | 1009 | 1014 | 1018 | 2000
}
export function _search(params: Search) {
    params.limit = params.limit ?? 30
    params.offset = params.offset ?? 0
    params.type = params.type ?? 1
    return request({
        url: '/cloudsearch',
        params,
    })
}
