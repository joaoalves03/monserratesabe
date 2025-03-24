<script setup lang="ts">
import {useRouter} from "vue-router"

const props = defineProps({
  icon: {
    type: String,
    default: null
  },
  path: {
    type: String,
    default: null
  },
  tailing_icon: {
    type: String,
    default: null
  },
})
const router = useRouter()

const route = () => {
  if (props.path) {
    if (props.path) {
      if (props.path.startsWith('/api')) {
        window.location.href = props.path
      } else {
        router.push(props.path)
      }
    }
  }
}
</script>

<template>
  <button class="button" @click="route()">
    <span v-if="props.icon" class="material-symbols-rounded fill">{{props.icon}}</span>
    <template v-else>
      <slot name="icon"></slot>
    </template>
    <div v-if="$slots.default" class="flex justify-start w-full">
      <slot></slot>
    </div>

    <span v-if="props.tailing_icon" class="material-symbols-rounded fill">{{props.tailing_icon}}</span>
    <template v-else>
      <slot name="tailing_icon"></slot>
    </template>
  </button>
</template>

<style scoped>

.button{
  @apply w-fit px-2 py-2 flex gap-2 rounded-md select-none text-white font-bold bg-primary-500
        shadow-primary-700  shadow-[0_0.25rem] active:translate-y-1 active:shadow-none hover:bg-primary-500/90
        transition-all duration-150 ease-in-out;
}

.button.danger{
  @apply bg-red-500 shadow-red-700 hover:bg-red-400;
}

.button.selected{
  @apply bg-primary-600 hover:bg-yellow-600/90 shadow-none translate-y-1;
}

.button.disabled{
  @apply bg-gray-500 shadow-gray-700
  active:translate-y-[0.05rem] active:shadow-[0_0.20rem] active:shadow-gray-700;
}
</style>