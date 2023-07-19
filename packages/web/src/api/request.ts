import { USER_COOKIE_KEY } from '@/constant'
import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://127.0.0.1:4000',
    timeout: 100000,
})

instance.interceptors.request.use((config) => {
    config.params = config.params || {}
    config.params.timestamp = Date.now()
    config.params.cookie = window.localStorage[USER_COOKIE_KEY]
    return config
})

instance.interceptors.response.use((response) => {
    const { status, data } = response
    const code = data?.code || data?.data?.code

    if (status === 200) {
        // 二维码登录轮训接口返回特殊处理
        if (response.config.url === '/login/qr/check') {
            return data
        }
        if (code !== 200) {
            throw Error(data?.msg)
        }

        return data?.data || data?.result || data
    }

    return response
})

export default instance
