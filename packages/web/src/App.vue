<script setup lang="ts">
import { _loginQrCheck, _loginQrCreate, _loginQrKey } from '@/api/user'
import { ref } from 'vue'
import { onMounted } from 'vue'
import useUserStore from '@/store/user'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const userStore = useUserStore()
const profile = computed(() => userStore.profile)

onMounted(async () => {
    try {
        await userStore.$checkLoginStatus()
    } catch (error) {
        console.log(error)
        // 要登录啥事不做
    }
})

const showQrCode = ref(false)
const qrCode = ref('')
async function onLogin() {
    const { unikey } = await _loginQrKey()
    const { qrimg } = await _loginQrCreate(unikey)
    qrCode.value = qrimg
    showQrCode.value = true

    qrCodeCheckLoop(unikey)
}

const msg = ref('')
const showMsg = ref(false)
function qrCodeCheckLoop(unikey: string) {
    const interval = setInterval(async () => {
        if (!showQrCode.value) {
            interval && clearInterval(interval)
            qrCode.value = ''
        } else {
            const { code, cookie } = await _loginQrCheck(unikey)
            if (code === 800) {
                msg.value = '二维码过期'
                showMsg.value = true
            } else if (code === 803) {
                msg.value = '登录成功'
                showMsg.value = true
                userStore.$setCookie(cookie!)
                userStore.$checkLoginStatus()
            } else {
                return
            }

            qrCode.value = ''
            showQrCode.value = false
        }
    }, 2000)
}

const route = useRoute()
const menus = ref([
    {
        path: '/',
        label: '首页',
    },
])

watch(
    () => profile.value.isLogin,
    (nval) => {
        nval &&
            menus.value.push({
                path: '/home',
                label: '我的',
            })
    },
    {
        immediate: true,
    }
)
</script>

<template>
    <v-app id="inspire">
        <v-main class="bg-grey-lighten-3">
            <v-container>
                <v-row>
                    <v-col cols="2">
                        <v-sheet rounded="lg">
                            <v-list rounded="lg">
                                <v-list-item
                                    v-for="menu in menus"
                                    :key="menu.label"
                                >
                                    <v-list-item-title>
                                        <router-link
                                            :to="menu.path"
                                            class="block"
                                            :class="{
                                                'text-[#e11d48]':
                                                    route.path === menu.path,
                                            }"
                                            >{{ menu.label }}</router-link
                                        >
                                    </v-list-item-title>
                                </v-list-item>

                                <v-divider class="my-2"></v-divider>

                                <v-list-item link color="grey-lighten-4">
                                    <v-list-item-title
                                        @click="onLogin"
                                        v-if="!profile.isLogin"
                                    >
                                        登录
                                    </v-list-item-title>
                                    <v-list-item-title v-else>
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

                    <v-col cols="10">
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
