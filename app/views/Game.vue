<script setup lang="ts">
import {onMounted, Ref, ref} from "vue"
import {io} from "socket.io-client"
import {useRoute} from "vue-router"
import Phase from "@/views/game/Phase.vue"
import {Round} from "@/models/round.js"
import Team from "@/views/game/Team.vue"
import Options from "@/views/game/Options.vue"
import Question from "@/views/game/Question.vue"
import {useProfileStore} from "@/stores/profile.js"
import OperatorDropdown from "@/components/OperatorDropdown.vue"

const route = useRoute()
const profile = useProfileStore()

const round: Ref<Round | undefined> = ref(undefined)

let socket = io("/")

onMounted(async () => {
  if(!socket) socket = io("/")
  socket.emit("joinGame", route.params.id)

  socket.on("updateState", (state) => {
    if(!round.value) {
      round.value = state
    } else {
      round.value = {...round.value, ...state}
    }

    console.log(round.value)
  })
})
</script>

<template>
  <div class="relative">
    <OperatorDropdown v-if="profile.data" :socket="socket" :round="round" />

    <div v-if="!round">Loading...</div>

    <Phase v-else-if="round.status == 'SELECT_PHASE'" :socket="socket" />
    <Team v-else-if="round.status == 'SELECT_TEAM' || round.status == 'SHOW_TEAMS'"
          :socket="socket" :round="round" />
    <Options v-else-if="round.status == 'SELECT_OPTIONS'"
             :socket="socket" :round="round" />
    <Question v-else-if="round.status == 'SELECT_ANSWER' || round.status == 'SHOW_ANSWER'"
              :socket="socket" :round="round" />

    <div v-else>Not implemented</div>
  </div>
</template>

<style scoped>

</style>