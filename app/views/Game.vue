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
import OperatorDropdown from "@/components/game/OperatorDropdown.vue"
import Finish from "@/views/game/Finish.vue";

const route = useRoute()
const profile = useProfileStore()

const round: Ref<Round | undefined> = ref(undefined)

let socket = io("/")

onMounted(async () => {
  if(profile.data === undefined) {
    await profile.fetch()
  }

  if(!socket) socket = io("/")
  socket.emit("joinGame", route.params.id)

  socket.on("updateState", (state) => {
    console.log(state)

    if(!round.value) {
      round.value = state
    } else {
      round.value = {...round.value, ...state}
    }
  })

  socket.on("outOfQuestions", () => {
    alert("Out of Questions")
  })
})
</script>

<template>
  <div
      class="relative flex flex-col w-screen h-screen select-none"
      :class="profile.data
        ? ''
        : 'pointer-events-none'"
  >
    <OperatorDropdown v-if="profile.data && round" :socket="socket" :round="round" />

    <div v-if="!round" class="w-full h-full flex flex-col justify-center items-center">
      <span class="material-symbols-rounded fill text-6xl animate-spin">autorenew</span>
    </div>

    <Phase v-else-if="round.status == 'SELECT_PHASE' && profile.data" :socket="socket" />
    <Options v-else-if="round.status == 'SELECT_OPTIONS'"
             :socket="socket" :round="round" />
    <Question v-else-if="round.status == 'SELECT_ANSWER' || round.status == 'SHOW_ANSWER'"
              :socket="socket" :round="round" />

    <Finish v-else-if="round.status == 'SHOW_WINNER'"
              :socket="socket" :round="round" />

    <Team v-if="round" :socket="socket" :round="round" />
    <div class="w-full h-24"></div>
  </div>
</template>

<style scoped>

</style>