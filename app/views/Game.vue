<script setup lang="ts">
import {onMounted, Ref, ref} from "vue"
import {io} from "socket.io-client"
import {useRoute} from "vue-router"
import Phase from "@/views/game/Phase.vue"
import {Round} from "@/models/round.js"

const route = useRoute()

const round: Ref<Round | undefined> = ref(undefined)

let socket = io("/")

onMounted(async () => {
  if(!socket) socket = io("/")
  socket.emit("joinGame", route.params.id)

  socket.on("updateState", (state) => {
    if(round.value) round.value = state
    else round.value = {...state}
  })
})
</script>

<template>
  <div v-if="!round">Loading...</div>

  <Phase v-else-if="round.status == 'SELECT_PHASE'" :socket="socket" />

  <div v-else>Not implemented</div>
</template>

<style scoped>

</style>