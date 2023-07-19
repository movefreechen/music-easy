import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Message, MsgCommand, type Profile } from '@/types'
import * as Api from '@/api/user'
import { USER_COOKIE_KEY } from '@/constant'
import useMessage from '@/hooks/useMessage'

const useUserStore = defineStore('user', () => {
    const { on, post } = useMessage()
    const cookie = ref('')
    const profile = ref<Profile>({
        nickname: '',
        avatarUrl: '',
        isLogin: false,
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
                    }, 5000)
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

    async function $checkLoginStatus() {
        try {
            await $checkCookie()
        } catch (error) {
            throw new Error('没有cookie')
        }

        try {
            const { profile: p } = await Api.loginStatus()
            profile.value = {
                ...p,
                isLogin: true,
            }
        } catch (error) {
            throw new Error('无登录状态')
        }
    }

    return { cookie, profile, $checkCookie, $checkLoginStatus }
})

export default useUserStore
