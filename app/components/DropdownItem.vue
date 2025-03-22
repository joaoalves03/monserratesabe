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
  }
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
  <button class="item" @click="route()" type="button">
    <span v-if="props.icon" class="material-symbols-rounded fill">{{props.icon}}</span>

    <slot></slot>
  </button>
</template>

<style scoped>

.item {
  @apply flex gap-2 justify-start items-center text-nowrap w-full min-w-fit py-2 px-4
  hover:bg-gray-200 transition-all duration-100 ease-in-out;
}

.item.danger {
  @apply text-red-700 hover:bg-red-500 hover:text-white;
}

</style>