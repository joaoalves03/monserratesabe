<script setup lang="ts">
import {useRoute} from "vue-router"

const route = useRoute()

defineProps({
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
               class="flex gap-4 items-start w-full min-h-[4rem] border-b-2 border-gray-300 bg-gray-200 hover:bg-gray-300 px-8 py-4 transition-colors cursor-pointer flex justify-start"
               :class="[(route.name.includes(path) && path !== '/' ? 'bg-gray-300' : '')]">
    <div class="w-4 h-4 flex items-center justify-center mb-1">
      <span class="material-symbols-rounded fill">{{icon}}</span>
    </div>
    <p class="whitespace-nowrap text-xs">
      <slot></slot>
    </p>
  </router-link>
</template>

<style scoped>

</style>