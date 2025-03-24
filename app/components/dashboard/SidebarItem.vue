<script setup lang="ts">
import {useRoute} from "vue-router"

const route = useRoute()

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: null
  },
  path: {
    type: String,
    default: null
  }
})
</script>

<template>
  <router-link :to="path === '/' ? path : '/dashboard/' + path"
               class="w-full min-h-[4rem] border-b-2 border-gray-300 bg-gray-200 hover:bg-gray-300 px-8 py-4 transition-colors cursor-pointer flex gap-4 justify-start items-center"
               :class="[(open ? '' : 'flex-col gap-0 items-start w-20'),(route.path.includes(path) && path !== '/' ? 'bg-gray-300' : '')]">
    <div class="w-4 h-4 flex items-center justify-center"
         :class="open ? 'mr-2' : 'mb-1'">
      <span class="material-symbols-rounded">{{ icon }}</span>
    </div>
    <p class="whitespace-nowrap"
       :class="open ? '' : 'text-xs'">
      <slot></slot>
    </p>
  </router-link>
</template>
<style scoped>

</style>