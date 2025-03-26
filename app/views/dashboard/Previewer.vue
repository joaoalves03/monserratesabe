<script setup lang="ts">
import {Ref, ref} from "vue"
import Button from "@/components/Button.vue"
import QuestionPreview from "@/views/dashboard/previewer/QuestionPreview.vue"

const questionId: Ref<number | undefined> = ref(undefined)
const showQuestionPreview = ref(false)

// what
const previousQuestion = () => {questionId.value = Number(questionId.value) - 1}
const nextQuestion = () => {questionId.value = Number(questionId.value) + 1}
</script>

<template>
  <div v-if="!showQuestionPreview" class="w-full h-full flex flex-col gap-2 justify-center items-center">
    <input type="text" v-model="questionId" placeholder="ID da pergunta">
    <Button @click="showQuestionPreview = true">Visualizar</Button>
  </div>

  <div v-else class="w-screen h-screen flex flex-col absolute z-[100] top-0 left-0">
    <div class="flex absolute top-2 right-2 z-[101] gap-2">
      <Button @click="previousQuestion">
        <span class="material-symbols-rounded fill">arrow_left</span>
      </Button>
      <Button @click="nextQuestion">
        <span class="material-symbols-rounded fill">arrow_right</span>
      </Button>
      <Button class="danger" @click="showQuestionPreview = false">
        <span class="material-symbols-rounded fill">close</span>
      </Button>
    </div>
    <QuestionPreview :questionId="questionId" />
    <div class="w-full h-24 bg-gray-500 flex justify-center items-center">
      TEAMS
    </div>
  </div>
</template>

<style scoped>

</style>