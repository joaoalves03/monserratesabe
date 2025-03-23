<script setup lang="ts">
import {Socket} from "socket.io-client"
import {onMounted, PropType, Ref, ref} from "vue"
import {Round} from "@/models/round.js"
import {Question} from "@/models/question.js"
import axios from "axios"
import {Category} from "@/models/category.js"

const props = defineProps({
  socket: {
    type: Socket,
    required: true
  },
  round: {
    type: Object as PropType<Round>,
    required: true
  }
})

const question: Ref<Question | undefined> = ref(undefined)
const category: Ref<Category | undefined> = ref(undefined)
const correct_answers: Ref<Number[]> = ref([])


onMounted(async () => {
  question.value = (await axios.get(`/api/question/${props.round.selected_question}`)).data
  category.value = (await axios.get(`/api/category/${props.round.selected_category}`)).data

  if(props.round.status == "SHOW_ANSWER") {
    correct_answers.value = (await axios.get(`/api/question/round_answers/${props.round.id}`)).data
  }
})

async function selectAnswer(id: number) {
  props.socket.emit("updateRound", {
    selected_answer: props.round.selected_answer === id ? null : id
  })
}

async function verifyAnswer() {
  if(props.round.selected_answer != null) {
    props.socket.emit("submitAnswer")
  }
}

props.socket.on("revealAnswer", async () => {
  correct_answers.value = (await axios.get(`/api/question/round_answers/${props.round.id}`)).data
})

async function next() {
  props.socket.emit("updateRound", {
    status: "SHOW_TEAMS"
  })
}
</script>

<template>
<div class="flex flex-col">
  <div>{{category.name}}</div>
  <div>{{question.question}}</div>
  <div class="flex">
    <button
        v-for="answer in question.answers"
        :class="([
            round.selected_answer === answer.id ? 'border-2 border-yellow-500' : '',
            round.status === 'SHOW_ANSWER' ?
             correct_answers.includes(answer.id) ? 'bg-green-400' : 'bg-red-400'
             : 'bg-blue-400'
        ])"
        class="px-3 py-1 m-1"
        @click="selectAnswer(answer.id)">
      {{answer.answer_text}}
    </button>
  </div>
  <button
      v-if="round.status === 'SELECT_ANSWER'"
      class="bg-yellow-400 px-3 py-1 m-1"
      @click="verifyAnswer">
    Verificar resposta
  </button>
  <button
      v-else
      class="bg-yellow-400 px-3 py-1 m-1"
      @click="next">
    Continuar
  </button>
</div>
</template>

<style scoped>

</style>