<script lang="ts" setup>
import * as Api from '@/api/user'
import { onMounted } from 'vue'

async function getMyList() {
    const res = await Api.userSubcount()
    console.log(res)
}
onMounted(() => {
    getMyList()
})
</script>

<template>
    <div class="w-full h-full"></div>
</template>
