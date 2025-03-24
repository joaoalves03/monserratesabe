<script setup lang="ts">
import DataTable from "@/components/dashboard/DataTable.vue"
import {onMounted, Ref, ref} from "vue"
import {Category} from "@/models/category.js"
import axios from "axios"

const columns = ref([
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'name', label: 'Nome' }
])

const categories: Ref<Category[]> = ref([])

onMounted(async () => {
  categories.value = (await axios.get("/api/category")).data
})

async function createCategory(newCategory: Category) {
  try {
    const response = await axios.post("/api/category", newCategory)
    categories.value.push(response.data)
  } catch (error) {
    console.error("Error creating category:", error)
  }
}

async function updateCategory(updatedCategory: Category) {
  try {
    const response = await axios.put(`/api/category/${updatedCategory.id}`, updatedCategory)
    const index = categories.value.findIndex(c => c.id === updatedCategory.id)
    if (index !== -1) {
      categories.value[index] = response.data
    }
  } catch (error) {
    console.error("Error updating category:", error)
  }
}

async function deleteCategory(deletedCategory: Category) {
  try {
    await axios.delete(`/api/category/${deletedCategory.id}`)
    categories.value = categories.value.filter(c => c.id !== deletedCategory.id)
  } catch (error) {
    console.error("Error deleting category:", error)
  }
}
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