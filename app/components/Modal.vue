<script setup lang="ts">
import {defineProps, defineEmits} from 'vue'
import Button from "@/components/Button.vue"

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String
  }
})

const emit = defineEmits()

const closeModal = () => {
  emit('close')
  console.log("LOL")
}
</script>

<template>
  <div v-if="props.visible" class="modal" @click="closeModal" @keyup.esc="closeModal">
    <div class="content" @click.stop>
      <div v-if="props.title" class="w-full flex justify-between items-center gap-6">
        <h1 class="text-3xl">{{props.title}}</h1>

        <Button icon="close" class="danger" @click="closeModal"></Button>
      </div>

      <div class="slot">
        <slot></slot>
      </div>

      <div v-if="$slots.actions" class="flex justify-end w-full p-2 gap-2">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>


<style scoped>

.modal{
  @apply fixed top-0 left-0 w-screen h-screen p-6 bg-black/20 flex justify-center items-center z-50;

  .content{
    @apply bg-white py-6 px-4 rounded-xl flex flex-col gap-2 max-h-full overflow-auto;

    .slot{
      @apply flex flex-col gap-2 p-2 max-h-full h-fit overflow-auto;
    }
  }
}

</style>