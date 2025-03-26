<script setup lang="ts">
import {onMounted, Ref, ref, watch} from "vue"
import {Question} from "@/models/question.js"
import axios from "axios"
import {calculateFontSize} from "@/util.js"
import AnswerPreview from "@/views/dashboard/previewer/AnswerPreview.vue"

const props = defineProps({
  questionId: {
    type: Number,
    required: true
  }
})

const question: Ref<Question | undefined | null> = ref(undefined)

async function getQuestion() {
  try {
    question.value = (await axios.get(`/api/question/${props.questionId}`)).data
  } catch (error) {
    question.value = null
  }
}

onMounted(async () => {
  await getQuestion()
})

watch(
    () => props.questionId,
    async () => {
      await getQuestion()
    }
)
</script>

<template>
  <div v-if="question == null" class="flex h-full w-full flex-col justify-center items-center px-4 py-4 bg-neutral-100">
    <p>Question not found</p>
  </div>

  <div v-else class="flex h-full w-full flex-col justify-between px-4 py-4 bg-neutral-100">
    <div class="flex flex-col h-2/3 w-full">
      <div class="flex relative w-full items-center justify-center rounded bg-white px-6 py-4 drop-shadow select-text h-1/3 mt-8" >
        <div class="absolute -top-8 left-4 flex gap-2 w-fit rounded-t bg-white px-2 text-2xl">
          <p>?/?</p>
          <p>•</p>
          <p>Categoria</p>
          <p>•</p>
          <p>{{question.id}}</p>
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
      <AnswerPreview v-for="(answer, index) in question.answers"
              :key="index" :answer="answer" :index="index"/>
    </div>
  </div>
</template>

<style scoped>

</style>