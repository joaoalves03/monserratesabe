<script setup lang="ts">

import Header from "@/components/Header.vue"
import Sidebar from "@/components/dashboard/Sidebar.vue"
</script>

<template>
  <Header />
  <div class="flex w-full h-full gap-4 pl-6 overflow-hidden">
    <Sidebar />
    <div class="flex w-full pr-6 overflow-auto">
      <router-view />
    </div>
  </div>
</template>

<style scoped>

</style>