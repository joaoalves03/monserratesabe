<script setup lang="ts">
import {Socket} from "socket.io-client"

const props = defineProps({
  socket: {
    type: Socket,
    required: true
  }
})

const phases = {
  "QUESTIONS": "Perguntas",
  "TEAM_CHALLENGE": "Desafio",
  "BUZZER": "Buzzer",
}

async function updatePhase(key: string) {
  props.socket.emit("updatePhase", key)
}
</script>

<template>
  <p>Fase</p>
  <div class="flex">
    <button
        v-for="(phase, key) of phases"
        class="bg-blue-400 px-3 py-1 m-1"
        @click="updatePhase(key)">
      {{phase}}
    </button>
  </div>
</template>

<style scoped>

</style>