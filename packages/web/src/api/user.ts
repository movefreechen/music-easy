import request from './request'

// 游客cookie
export function _anonimous(): Promise<{
    cookie: string
}> {
    return request('/register/anonimous')
}

export function _loginQrKey(): Promise<{
    code: number
    unikey: string
}> {
    return request('/login/qr/key')
}

export function _loginQrCreate(key: string): Promise<{
    qrimg: string
}> {
    return request('/login/qr/create', {
        params: {
            key,
            qrimg: 'true',
        },
    })
}

export function _loginQrCheck(key: string): Promise<{
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

// profile 返回null 是游客状态
export function _loginStatus(): Promise<{
    profile: {
        nickname: string
        userType: number
        vipType: number
        avatarUrl: string
        userId: number
    } | null
}> {
    return request('/login/status')
}

export function _loginVipInfo() {
    return request('/vip/info')
}

export function _userSubcount() {
    return request('/user/subcount')
}
