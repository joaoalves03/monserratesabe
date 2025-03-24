<script setup lang="ts">
import SidebarItem from "@/components/dashboard/SidebarItem.vue"
import {ref} from "vue";

const open = ref(false)
</script>

<template>
  <div class="relative top-4 h-fit flex flex-col transition-[width] rounded-2xl overflow-hidden z-50"
       :class="open ? 'w-1/4' : 'w-20 min-w-20'">
    <div class="flex bg-gray-200 border-b-2 border-gray-300 h-16 items-center gap-4 px-8 py-4 overflow-hidden"
         :class="open ? 'w-full' : 'gap-0 w-20'">

      <div class="w-4 h-4 flex justify-center cursor-pointer group items-center" @click="open = !open"
           :class="open ? 'mr-2' : ''">
        <div class="absolute w-8 h-8 cursor-pointer left-6 rounded-full group-active:bg-gray-300 transition-colors ease-in-out"></div>
        <span class="material-symbols-rounded">menu</span>
      </div>
    </div>
    <div class="flex flex-col w-full h-full text-2xl overflow-y-auto overflow-x-hidden" style="scrollbar-width: thin;">
      <SidebarItem icon="question_mark" path="questions" :open>Perguntas</SidebarItem>
      <SidebarItem icon="category" path="categories" :open>Categorias</SidebarItem>
      <SidebarItem icon="group" path="teams" :open>Equipas</SidebarItem>
    </div>
  </div>
</template>

<style scoped>

</style>