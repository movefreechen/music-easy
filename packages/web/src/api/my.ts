import request from './request'

export function _likeIdlist(uid: number): Promise<{
    ids: number[]
}> {
    return request({
        url: '/likelist',
        params: { uid },
    })
}
