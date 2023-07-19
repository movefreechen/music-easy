import request from './request'

// 推荐歌单
export function $personalizedList(): Promise<
    {
        id: number
        name: string
        picUrl: string
        playCount: number
    }[]
> {
    return request('/personalized')
}
