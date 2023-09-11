import { defineStore } from 'pinia'
import { _userLikeSongIdlist } from '@/api/song'
import useUserStore from './user'
import { ref } from 'vue'
import { computedAsync } from '@vueuse/core'
import { nanoid } from 'nanoid'

const useMusicStore = defineStore('music', () => {
    const userStore = useUserStore()

    const refreshKey = ref(nanoid(6))
    const userLikeSongIds = computedAsync<number[]>(
        async () => {
            refreshKey.value
            if (userStore.profile.userId) {
                const { ids } = await _userLikeSongIdlist(
                    userStore.profile.userId
                )
                return ids
            }

            return []
        },
        [],
        { lazy: true }
    )

    function $likeIdsUpdate() {
        refreshKey.value = nanoid(6)
    }

    return {
        userLikeSongIds,
        $likeIdsUpdate,
    }
})

export default useMusicStore
