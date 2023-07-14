<script setup lang="ts">
import * as Api from '@/api/user'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { onMounted } from 'vue'
import { USER_COOKIE_KEY } from './constant'
import useMessage from '@/hooks/useMessage'
import { MsgCommand } from '@/types'
import type { Message } from '@/types'

const { on, post } = useMessage()

function checkCookie(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!window.localStorage[USER_COOKIE_KEY]) {
            post({
                command: MsgCommand.GET_COOKIE,
            })

            on((msg: Message) => {
                if (msg.command === MsgCommand.GET_COOKIE) {
                    if (msg.data) {
                        window.localStorage[USER_COOKIE_KEY] = msg.data
                        resolve()
                    } else {
                        reject()
                    }
                }
            })
        } else {
            resolve()
        }
    })
}

const profile = ref({
    nickname: '',
    avatarUrl: '',
})
const isLogin = ref(false)
async function checkLoginStatus() {
    const { profile: p } = await Api.loginStatus()
    profile.value = {
        nickname: p.nickname,
        avatarUrl: p.avatarUrl,
    }

    isLogin.value = true
}
onMounted(async () => {
    try {
        await checkCookie()
        await checkLoginStatus()
    } catch (error) {
        console.log(error)
        // 要登录啥事不做
    }
})

const showQrCode = ref(false)
const qrCode = ref('')
async function onLogin() {
    const { unikey } = await Api.loginQrKey()
    const { qrimg } = await Api.loginQrCreate(unikey)
    qrCode.value = qrimg
    showQrCode.value = true

    qrCodeCheckLoop(unikey)
}

const userCookie = useStorage('cookie', '')
const msg = ref('')
const showMsg = ref(false)
function qrCodeCheckLoop(unikey: string) {
    const interval = setInterval(async () => {
        if (!showQrCode.value) {
            interval && clearInterval(interval)
            qrCode.value = ''
        } else {
            const { code, cookie } = await Api.loginQrCheck(unikey)
            if (code === 800) {
                msg.value = '二维码过期'
                showMsg.value = true
            } else if (code === 803) {
                msg.value = '登录成功'
                showMsg.value = true
                userCookie.value = cookie
                post({
                    command: MsgCommand.SAVE_COOKIE,
                    data: cookie,
                })
                window.localStorage[USER_COOKIE_KEY] = cookie
            } else {
                return
            }

            qrCode.value = ''
            showQrCode.value = false
        }
    }, 2000)
}
</script>

<template>
    <v-app id="inspire">
        <v-main class="bg-grey-lighten-3">
            <v-container>
                <v-row>
                    <v-col cols="2">
                        <v-sheet rounded="lg">
                            <v-list rounded="lg">
                                <v-list-item>
                                    <v-list-item-title>
                                        <router-link
                                            to="/"
                                            class="pb-[15px] block"
                                            >首页</router-link
                                        >
                                    </v-list-item-title>
                                    <v-list-item-title v-if="isLogin">
                                        <router-link to="/" class="block"
                                            >我的</router-link
                                        >
                                    </v-list-item-title>
                                </v-list-item>

                                <v-divider class="my-2"></v-divider>

                                <v-list-item link color="grey-lighten-4">
                                    <v-list-item-title
                                        @click="onLogin"
                                        v-if="!isLogin"
                                    >
                                        登录
                                    </v-list-item-title>
                                    <v-list-item-title>
                                        <v-avatar
                                            class="mr-[5px]"
                                            :image="profile.avatarUrl"
                                        ></v-avatar>
                                        {{ profile.nickname }}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-sheet>
                    </v-col>

                    <v-col>
                        <v-sheet min-height="95vh" rounded="lg">
                            <router-view></router-view>
                        </v-sheet>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
        <v-dialog
            transition="dialog-bottom-transition"
            width="auto"
            v-model="showQrCode"
        >
            <v-img :src="qrCode"></v-img>
        </v-dialog>
    </v-app>
</template>

<style scoped></style>
