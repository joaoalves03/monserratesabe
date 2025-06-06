<script setup lang="ts">
import {Socket} from "socket.io-client"
import {onMounted, PropType, Ref, ref, useTemplateRef} from "vue"
import {Round} from "@/models/round.js"
import {Question} from "@/models/question.js"
import axios from "axios"
import {Category} from "@/models/category.js"
import Answer from "@/components/game/Answer.vue"
import {calculateFontSize} from "@/util.js"
import {useProfileStore} from "@/stores/profile.js"

import wrongAnswerAudio from "@/assets/wrong.mp3"
import correctAnswerAudio from "@/assets/correct.mp3"

const profile = useProfileStore()

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

const wrongAudio = useTemplateRef("wrongAudio")
const correctAudio = useTemplateRef("correctAudio")

onMounted(async () => {
  question.value = (await axios.get(`/api/question/by-round/${props.round.selected_question}/${props.round.id}`)).data
  category.value = (await axios.get(`/api/category/${props.round.selected_category}`)).data

  if(question.value.answers[0].is_correct != undefined) {
    correct_answers.value = question.value.answers
        .filter(x => x.is_correct)
        .map(x => x.id)
  }

  if(props.round.status == "SHOW_ANSWER") {
    correct_answers.value = (await axios.get(`/api/question/round_answers/${props.round.id}`)).data
  }
})

async function selectAnswer(id: number) {
  if(props.round.status == "SELECT_ANSWER") {
    props.socket.emit("updateRound", {
      selected_answer: props.round.selected_answer === id ? null : id
    })
  }
}

props.socket.on("revealAnswer", async () => {
  correct_answers.value = (await axios.get(`/api/question/round_answers/${props.round.id}`)).data

  if(correct_answers.value.includes(props.round.selected_answer)) {
    correctAudio.value.play()
  } else {
    wrongAudio.value.play()
  }
})
</script>

<template>
<div class="flex h-full w-full flex-col justify-between px-4 py-4 bg-neutral-100">
  <div class="flex flex-col h-2/3 w-full">
    <div class="flex relative w-full items-center justify-center rounded bg-white px-6 py-4 drop-shadow select-text h-1/3 mt-8" >
      <div class="absolute -top-8 left-4 flex gap-2 w-fit rounded-t bg-white px-2 text-2xl">
        <p>{{round.current_question_number}}/{{round.max_questions}}</p>
        <p>•</p>
        <p>{{category.name}}</p>
        <p v-if="profile.data">•</p>
        <p v-if="profile.data">{{question.id}}</p>
      </div>

      <p class="leading-none whitespace-pre-wrap break-words text-center" :style="{ fontSize: calculateFontSize(question.question) + 'rem' }">
        {{question.question}}
      </p>
    </div>
    <div class="relative flex items-center justify-center max-h-full w-full my-auto">
      <img v-if="question.image_url != null" class="rounded bg-white p-2 w-auto object-contain max-h-[25vh]" :src="question.image_url" :alt="question.question"/>
      <img v-else class="rounded p-2 w-auto object-contain max-h-[25vh]" src="@/assets/logo.png" :alt="question.question"/>
    </div>
  </div>

  <div class="grid grid-cols-2 grid-rows-2 gap-2 w-full h-[60%] box-border p-2 mt-4">
    <Answer v-for="(answer, index) in question.answers"
            @click="selectAnswer(answer.id)"
            :key="index" :answer="answer" :round="round" :index="index" :correctAnswers="correct_answers"/>
  </div>

  <audio ref="wrongAudio" class="hidden" :src="wrongAnswerAudio"></audio>
  <audio ref="correctAudio" class="hidden" :src="correctAnswerAudio"></audio>
</div>
</template>

<style scoped>

</style>