<script setup lang="ts">
import {onMounted} from "vue"
import {io} from "socket.io-client"
import {useRoute} from "vue-router"

const route = useRoute()

let socket

onMounted(async () => {
  socket = io("/")
  socket.emit("joinGame", route.params.id)
})
</script>

<template>
  hi
</template>

<style scoped>

</style>