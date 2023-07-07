import * as request from '../util/request'

export const loginQrKey = () => request(
    'POST',
    `https://music.163.com/weapi/login/qrcode/unikey`,
    {
        type: 1
    },
    {
        crypto: 'weapi',
        cookie: {},
        proxy: 'http://proxy.bmwbrill.cn:8080'
    }
)
