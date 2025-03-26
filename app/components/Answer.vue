<script setup lang="ts">
import {useProfileStore} from "@/stores/profile.js"
import {Answer} from "@/models/answer.js"
import {computed, PropType} from "vue"
import {Round} from "@/models/round.js"

const profile = useProfileStore()

const props = defineProps({
  answer: {
    type: Object as PropType<Answer>,
    required: true
  },
  round: {
    type: Object as PropType<Round>,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Array<Number>,
    required: true
  }
})

const emit = defineEmits(["click"])

const letters = ["A", "B", "C", "D"]

const selected = computed(() => props.answer.id === props.round.selected_answer)
const answered = computed(() => props.round.status === "SHOW_ANSWER")
const isCorrect = computed(() => props.correctAnswers.includes(props.answer.id))

function calculateResponsiveFontSize(text: string): string {
  const textLength = String(text).length

  const lengthFactor = Math.max(0.5, 2.5 - (textLength / 32))

  return `clamp(0.8rem, ${lengthFactor * 3.5}vw, 2.5rem)`
}
</script>

<template>
  <div class="flex items-center divide-x-4 rounded py-6 font-bold text-white transition-colors"
       :class="[
            (profile.data && !answered ? 'cursor-pointer':'cursor-default'),
            (!answered && selected ? 'bg-yellow-400' : 'bg-blue-600'),
            (answered && selected && !isCorrect ? '!bg-red-600' : ''),
            (answered && isCorrect ? '!bg-green-500' : '')
          ]"
       @click="profile.data && !answered ? emit('click') : '' ">

    <div class="flex flex-col h-full pb-2 w-1/6 items-center justify-center">
      <p class="text-center text-[6vw] leading-none">{{letters[index]}}</p>

      <template v-if="profile.data">
        <div class="flex items-center justify-center text-center">
          <span v-if="isCorrect" class="material-symbols-rounded fill text-[4vw]">check</span>
          <span v-else class="material-symbols-rounded fill text-[4vw]">close</span>
        </div>
      </template>
    </div>

    <div class="flex h-full flex-1 items-center px-6 w-full">
      <img v-if="answer.image_url != null" class="h-full max-h-[10vh] w-auto object-contain" :src="answer.image_url" :alt="answer.answer_text"/>
      <template v-else>
        <p
            class="answer-text"
            :style="{ fontSize: calculateResponsiveFontSize(answer.answer_text) }"
        >
          {{answer.answer_text}}
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.answer-text {
  @apply w-full break-words hyphens-auto;
  line-height: 1.2;
  font-weight: bold;
}
</style>