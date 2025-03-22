<script setup lang="ts">

import Header from "@/components/Header.vue"
import Sidebar from "@/components/Sidebar.vue"
</script>

<template>
  <Header />
  <div class="flex flex-row w-full h-full overflow-auto">
    <Sidebar />
    <router-view class="px-8" />
  </div>
</template>

<style scoped>

</style>