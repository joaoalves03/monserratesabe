<script setup lang="ts">
import {Answer} from "@/models/answer.js"
import {PropType} from "vue"
import {calculateFontSize} from "@/util.js"

defineProps({
  answer: {
    type: Object as PropType<Answer>,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(["click"])

const letters = ["A", "B", "C", "D"]

</script>

<template>
  <div class="flex items-center divide-x-4 rounded py-6 font-bold text-white bg-blue-600">
    <p class="flex h-full pb-2 w-1/6 items-center justify-center text-center text-[10vh]">{{letters[index]}}</p>

    <div class="flex h-full flex-1 items-center px-6">
      <img v-if="answer.image_url != null" class="h-full max-h-[10vh] w-auto object-contain" :src="answer.image_url" :alt="answer.answer_text"/>
      <template v-else>
        <p class="flex h-full text-left items-center text-2xl leading-tight" :style="{ fontSize: calculateFontSize(answer.answer_text) + 'rem' }">
          {{answer.answer_text}}
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>

</style>