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
  if(key == "QUESTIONS" || key == "BUZZER") {
    let number_of_questions: any

    do {
      number_of_questions = parseInt(prompt("Número de perguntas"))
    } while (isNaN(number_of_questions))

    props.socket.emit("updateRound", {
      current_question_number: 0,
      max_questions: number_of_questions
    })
  }

  if(key == "BUZZER") {
    props.socket.emit("launchBuzzerQuestion")
  } else {
    props.socket.emit("updatePhase", key)
  }
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