import request from './request'

export function loginQrKey(): Promise<{
    code: number
    unikey: string
}> {
    return request('/login/qr/key')
}

export function loginQrCreate(key: string): Promise<{
    qrimg: string
}> {
    return request('/login/qr/create', {
        params: {
            key,
            qrimg: 'true',
        },
    })
}

export function loginQrCheck(key: string): Promise<{
    cookie?: string
    code: 800 | 801 | 802 | 803
}> {
    return request('/login/qr/check', {
        params: {
            key,
            noCookie: 'true',
        },
    })
}

export function loginStatus(): Promise<{
    profile: {
        nickname: string
        userType: number
        vipType: number
        avatarUrl: string
    }
}> {
    return request('/login/status')
}

export function loginVipInfo() {
    return request('/vip/info')
}

export function userSubcount() {
    return request('/user/subcount')
}
