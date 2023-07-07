import * as http from 'http'
import * as https from 'https'
import * as crypto from 'crypto'
import { parse } from 'url'
import querystring from 'querystring'

let user = {}

const encrypt = (object) => {
    const buffer = Buffer.from(JSON.stringify(object))
    const cipher = crypto.createCipheriv('aes-128-ecb', 'rFgB&h#%2?^eDg:Q', '')
    return {
        eparams: Buffer.concat([cipher.update(buffer), cipher.final()])
            .toString('hex')
            .toUpperCase(),
    }
}

const request = (method, url, headers, body = null) =>
    new Promise((resolve, reject) => {
        ;(url.startsWith('https://') ? https : http)
            .request(Object.assign(parse(url), { method, headers }))
            .on('response', (response) =>
                resolve(
                    [201, 301, 302, 303, 307, 308].includes(response.statusCode)
                        ? request(
                              method,
                              parse(url).resolve(response.headers.location),
                              headers,
                              body
                          )
                        : response
                )
            )
            .on('error', (error) => reject(error))
            .end(body)
    })

const json = (response) =>
    new Promise((resolve, reject) => {
        const chunks = []
        response
            .on('data', (chunk) => chunks.push(chunk))
            .on('end', () => resolve(Buffer.concat(chunks)))
            .on('error', (error) => reject(error))
    }).then((body) => {
        console.log(body.toString())
        JSON.parse(
            body
                .toString()
                .replace(/([^\\]"\s*:\s*)(\d{16,})(\s*[}|,])/g, '$1"$2"$3')
        )
    })

const apiRequest = (path, data, load = true) => {
    const method = 'POST'
    const url = `https://music.163.com/api/linux/forward`
    const headers = {
        'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: parse(url).resolve('/'),
        'X-Real-IP': '118.88.88.88',
        Cookie: ['os=linux', user.cookie].join('; '),
    }
    data = querystring.stringify(
        encrypt({
            method: method,
            url: parse(url).resolve(`/api/${path}`),
            params: data,
        })
    )
    return request(method, url, headers, data).then(
        load ? json : (response) => response
    )
}

const api = {
    request,
    user: {
        detail: (id) => apiRequest(`v1/user/detail/${id || user.id}`, {}),
        artist: () => apiRequest(`artist/sublist`, { limit: 1000, offset: 0 }),
        album: () => apiRequest(`album/sublist`, { limit: 1000, offset: 0 }),
        djradio: () =>
            apiRequest('djradio/get/subed', { limit: 1000, offset: 0 }),
        playlist: (id, compact) =>
            apiRequest('user/playlist', {
                uid: id || user.id,
                limit: compact ? 1 : 100000,
            }),
        record: (id) =>
            Promise.all(
                [0, 1].map((type) =>
                    apiRequest('v1/play/record', { uid: id || user.id, type })
                )
            ).then((data) => Object.assign(data[0], data[1])),
        likes: () => apiRequest('song/like/get', {}),
        account: (id) => (id ? user.id === id : user.id),
        favorite: (id) => (id ? user.favor === id : user.favor),
    },
    artist: {
        song: (id) => apiRequest(`v1/artist/${id}`, { top: 50 }),
        album: (id) =>
            Promise.all([
                apiRequest(`artist/albums/${id}`, { limit: 1000, offset: 0 }),
                apiRequest(`artist/detail/v4`, { id }),
                apiRequest(`artist/detail/dynamic`, { id }),
            ]).then(
                (data) => (
                    (data[0].artist.fansNum = data[1].fansNum),
                    (data[0].artist.followed = data[2].followed),
                    data[0]
                )
            ),
        subscribe: (id, action) =>
            apiRequest(`artist/${action ? 'sub' : 'unsub'}`, {
                artistId: id,
                artistIds: [id],
            }),
    },
    djradio: {
        program: (id) =>
            apiRequest('dj/program/byradio', { radioId: id, limit: 500 }).then(
                (data) =>
                    Promise.all(
                        Array.from(
                            Array(
                                Math.ceil(
                                    data.programs[0].radio.programCount / 500
                                ) - 1
                            ).keys()
                        ).map((group) =>
                            apiRequest('dj/program/byradio', {
                                radioId: id,
                                limit: 500,
                                offset: 500 * (group + 1),
                            })
                        )
                    )
                        .then((rest) =>
                            rest.forEach((part) =>
                                Array.prototype.push.apply(
                                    data.programs,
                                    part.programs
                                )
                            )
                        )
                        .then(() => data)
            ),
        subscribe: (id, action) =>
            apiRequest(`djradio/${action ? 'sub' : 'unsub'}`, { id }),
    },
    program: {
        detail: (id) => apiRequest('dj/program/detail', { id }),
        listen: (id) => apiRequest('dj/program/listen', { id }),
        url: (id) =>
            api.program
                .detail(id)
                .then((data) => api.song.url(data.program.mainTrackId)), // cheating?
        comment: (id) =>
            apiRequest(`v1/resource/comments/A_DJ_1_${id}`, {
                rid: `A_DJ_1_${id}`,
                limit: 50,
                offset: 0,
            }),
    },
    album: {
        detail: (id) =>
            Promise.all([
                apiRequest(`v1/album/${id}`, {}),
                apiRequest('album/detail/dynamic', { id }),
            ]).then(
                (data) => (Object.assign(data[0].album.info, data[1]), data[0])
            ),
        subscribe: (id, action) =>
            apiRequest(`album/${action ? 'sub' : 'unsub'}`, { id }),
    },
    playlist: {
        detail: (id) =>
            apiRequest('v3/playlist/detail', { id, n: 1000 }).then((data) =>
                Promise.all(
                    Array.from(
                        Array(
                            Math.ceil(data.playlist.trackCount / 1000) - 1
                        ).keys()
                    ).map((group) =>
                        apiRequest('v3/song/detail', {
                            c: JSON.stringify(
                                data.playlist.trackIds
                                    .slice((group + 1) * 1000)
                                    .slice(0, 1000)
                                    .map((item) => ({ id: item.id }))
                            ),
                        })
                    )
                )
                    .then((rest) =>
                        rest.forEach((part) =>
                            Array.prototype.push.apply(
                                data.playlist.tracks,
                                part.songs
                            )
                        )
                    )
                    .then(() => data)
            ),
        highquality: () =>
            apiRequest('playlist/highquality/list', { cat: '全部', limit: 50 }),
        hot: () =>
            apiRequest('playlist/list', {
                cat: '全部',
                limit: 50,
                offset: 0,
                order: 'hot',
            }),
        subscribe: (id, action) =>
            apiRequest(`playlist/${action ? 'subscribe' : 'unsubscribe'}`, {
                id,
            }),
        intelligence: (id, pid) =>
            apiRequest('playmode/intelligence/list', {
                songId: id,
                startMusicId: id,
                playlistId: pid || user.favor,
                count: 1,
                type: 'fromPlayAll',
            }),
    },
    toplist: () => apiRequest('toplist', {}),
    song: {
        detail: (id) =>
            apiRequest('v3/song/detail', { c: JSON.stringify([{ id }]) }),
        url: (id) =>
            apiRequest('song/enhance/player/url', { ids: [id], br: 320000 }),
        lyric: (id) =>
            apiRequest('song/lyric', { id, lv: -1, tv: -1, cp: false }),
        like: (id) =>
            apiRequest('song/like', {
                trackId: id,
                like: true,
                time: 0,
                userid: 0,
            }),
        dislike: (id) =>
            apiRequest('song/like', {
                trackId: id,
                like: false,
                time: 0,
                userid: 0,
            }),
        collect: (id, pid) =>
            apiRequest('playlist/manipulate/tracks', {
                trackIds: [id],
                pid: pid,
                op: 'add',
            }),
        comment: (id) =>
            apiRequest(`v1/resource/comments/R_SO_4_${id}`, {
                rid: id,
                limit: 50,
                offset: 0,
            }),
        log: (data) =>
            apiRequest('feedback/weblog', {
                logs: JSON.stringify([{ action: 'play', json: data }]),
            }),
        trash: (id, time = 0) =>
            apiRequest('v1/radio/trash/add', {
                alg: 'itembased',
                songId: `${id}`,
                time: `${time}`,
            }),
    },
    recommend: {
        song: () =>
            apiRequest('v1/discovery/recommend/songs', {
                limit: 30,
                offset: 0,
            }),
        playlist: () =>
            apiRequest('personalized/playlist', {
                limit: 20,
                offset: 0,
                n: 1000,
            }),
        radio: () => apiRequest('v1/radio/get', {}),
    },
    new: {
        song: () =>
            apiRequest('v1/discovery/new/songs', {
                areaId: 0,
                limit: 50,
                offset: 0,
            }),
        album: () =>
            apiRequest('album/new', { area: 'ALL', limit: 50, offset: 0 }),
    },
    search: {
        keyword: (text) => apiRequest('search/suggest/keyword', { s: text }),
        suggest: (text) => apiRequest('search/suggest/web', { s: text }),
        type: (text, type) =>
            apiRequest('search/get', {
                s: text,
                type: type,
                limit: 20,
                offset: 0,
            }),
        hot: () => apiRequest('search/hot', { type: 1111 }),
    },
    login: {
        qrKey: () => apiRequest('login/qr/key', { type: 1 }),
    },
    logout: () => {
        user = {}
        return sync()
    },
    sign: () => apiRequest('point/dailyTask', { type: 1 }),
    refresh: (cookie) => {
        user = cookie ? { cookie } : runtime.globalStorage.get('user') || {}
        return apiRequest('user/info', {})
            .then((data) =>
                data.code === 200
                    ? (user.id = data.userPoint.userId)
                    : (user = {})
            )
            .then(sync)
    },
}

const sync = () => {
    runtime.globalStorage.set('user', user)
    runtime.stateManager.set('logged', !!user.id)
    return user.id
        ? Promise.all([api.user.detail(), api.user.playlist(null, true)]).then(
              (data) => (
                  runtime.stateManager.set('signed', !!data[0].pcSign),
                  (user.favor = data[1].playlist[0].id),
                  data[0]
              )
          )
        : Promise.resolve()
}

export default api
