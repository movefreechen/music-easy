import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Message, MsgCommand, type Profile } from '@/types'
import { _loginStatus, _anonimous } from '@/api/user'
import { USER_COOKIE_KEY } from '@/constant'
import useMessage from '@/hooks/useMessage'

const useUserStore = defineStore('user', () => {
    const { on, post } = useMessage()

    const cookie = ref('')
    // 游客cookie状态
    const isAnonimous = ref(false)
    const profile = ref<Profile>({
        nickname: '',
        avatarUrl: '',
        isLogin: false,
        userId: undefined,
    })

    // 去vscode里查找cookie
    function $checkCookie(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (cookie.value) {
                return resolve()
            }
            if (!window.localStorage[USER_COOKIE_KEY]) {
                post({
                    command: MsgCommand.GET_COOKIE,
                })

                on((msg: Message) => {
                    // 超时抛异常
                    const timeout = setTimeout(() => {
                        reject()
                    }, 0)
                    if (msg.command === MsgCommand.GET_COOKIE) {
                        if (msg.data) {
                            window.localStorage[USER_COOKIE_KEY] = msg.data
                            cookie.value = msg.data
                            resolve()
                        } else {
                            reject()
                        }
                        clearTimeout(timeout)
                    }
                })
            } else {
                cookie.value = window.localStorage[USER_COOKIE_KEY]
                resolve()
            }
        })
    }

    // 没有cookie 就获取游客cookie
    async function $checkLoginStatus() {
        try {
            await $checkCookie()
        } catch (error) {
            $setAnonimous()
            throw new Error('没有cookie')
        }

        try {
            const { profile: p } = await _loginStatus()
            if (p) {
                profile.value = {
                    ...p,
                    isLogin: true,
                }
                isAnonimous.value = false
            }
        } catch (error) {
            $setAnonimous()
            throw new Error('无登录状态')
        }
    }

    function $setCookie(c: string) {
        cookie.value = c
        window.localStorage[USER_COOKIE_KEY] = c
        post({
            command: MsgCommand.SAVE_COOKIE,
            data: cookie,
        })
    }

    function $removeCookie() {
        window.localStorage[USER_COOKIE_KEY] = null
        post({
            command: MsgCommand.SAVE_COOKIE,
            data: null,
        })
    }

    // 设置游客cookie
    async function $setAnonimous() {
        const { cookie: c } = await _anonimous()
        isAnonimous.value = true
        $setCookie(c)
    }

    return {
        cookie,
        profile,
        isAnonimous,
        $checkCookie,
        $checkLoginStatus,
        $setCookie,
        $removeCookie,
    }
})

export default useUserStore
