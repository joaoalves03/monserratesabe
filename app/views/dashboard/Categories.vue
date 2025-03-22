<script setup lang="ts">
import DataTable from "@/components/DataTable.vue"
import {onMounted, Ref, ref} from "vue"
import {Category} from "@/models/category.js"
import axios from "axios"

const columns = ref([
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'name', label: 'Nome' }
])

const categories: Ref<Category> = ref([])

onMounted(async () => {
  categories.value = (await axios.get("/api/categories")).data
})

function createCategory() {}

function updateCategory() {}

function deleteCategory() {}
</script>

<template>
  <DataTable
      title="Categorias"
      :columns="columns"
      :items="categories"
      @create="createCategory"
      @update="updateCategory"
      @delete="deleteCategory"
  />
</template>

<style scoped>

</style>