<script setup lang="ts">
import SidebarItem from "@/components/dashboard/SidebarItem.vue"
</script>

<template>
  <div class="w-1/3 h-full flex flex-col relative bg-gray-200 transition-[width] shadow-xl z-50">
    <div class="flex flex-col w-full h-full text-2xl overflow-y-auto overflow-x-hidden" style="scrollbar-width: thin;">
      <SidebarItem icon="question_mark" path="questions" >Perguntas</SidebarItem>
      <SidebarItem icon="category" path="categories">Categorias</SidebarItem>
      <SidebarItem icon="group" path="teams">Equipas</SidebarItem>
      <SidebarItem icon="history" path="history">Historico</SidebarItem>
    </div>
  </div>
</template>

<style scoped>

</style>