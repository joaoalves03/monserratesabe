<script setup lang="ts">
import {Socket} from "socket.io-client"
import {prompt} from "@/plugins/prompt.js";
import Button from "@/components/Button.vue";

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
      number_of_questions = await prompt.ask("Número de perguntas")
      number_of_questions = parseInt(number_of_questions)
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
  <div class="h-full w-full flex flex-col gap-1 justify-center items-center">
    <p class="text-2xl">Fase</p>
    <div class="flex gap-2">
      <Button
          v-for="(phase, key) of phases"
          @click="updatePhase(key)">
        {{phase}}
      </Button>
    </div>
  </div>
</template>

<style scoped>

</style>