import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import My from '@/views/My.vue'

const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes: [
        { path: '/', component: Home },
        { path: '/my', component: My },
    ], // `routes: routes` 的缩写
})

export default router
