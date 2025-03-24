<script setup lang="ts">
import {onMounted, ref} from "vue"
import axios from "axios"
import {Question} from "@/models/question.js";
import {Category} from "@/models/category.js"
import DataTable from "@/components/DataTable.vue"

const columns = ref([
  { key: 'id', label: 'ID', type: 'number' },
  {
    key: 'question',
    label: 'Pergunta',
    required: true
  },
  {
    key: 'category',
    label: 'Categoria',
    path: 'category.id',
    inputType: 'select',
    options: [] as Category[],
    displayPath: 'category.name',
    required: true
  },
  {
    key: 'image_url',
    label: 'Image URL',
    required: false
  }
])

const questions = ref<Question[]>([])
const categories = ref<Category[]>([])

onMounted(async () => {
  try {
    const [questionsRes, categoriesRes] = await Promise.all([
      axios.get("/api/question"),
      axios.get("/api/category")
    ])

    questions.value = questionsRes.data
    categories.value = categoriesRes.data

    const categoryColumn = columns.value.find(c => c.key === 'category')
    if (categoryColumn) {
      categoryColumn.options = categories.value
    }
  } catch (error) {
    console.error("Error loading data:", error)
  }
})

async function createQuestion(newQuestion: any) {
  try {
    const response = await axios.post(
        "/api/question",
        {
          question: newQuestion.question,
          image_url: newQuestion.image_url || null,
          category_id: Number(newQuestion.category?.id)
        }
    )
    questions.value.push(response.data)
  } catch (error) {
    console.error("Error creating question:", error)
  }
}

async function updateQuestion(updatedQuestion: any) {
  try {
    const response = await axios.put(
        `/api/question/${updatedQuestion.id}`,
        {
          question: updatedQuestion.question,
          image_url: updatedQuestion.image_url || null,
          category_id: Number(updatedQuestion.category?.id)
        }
    )
    const index = questions.value.findIndex(q => q.id === updatedQuestion.id)
    if (index !== -1) {
      questions.value[index] = response.data
    }
  } catch (error) {
    console.error("Error updating question:", error)
  }
}

async function deleteQuestion(deletedQuestion: Question) {
  try {
    await axios.delete(`/api/question/${deletedQuestion.id}`)
    questions.value = questions.value.filter(q => q.id !== deletedQuestion.id)
  } catch (error) {
    console.error("Error deleting question:", error)
  }
}
</script>

<template>
  <DataTable
      title="Perguntas"
      :columns="columns"
      :items="questions"
      @create="createQuestion"
      @update="updateQuestion"
      @delete="deleteQuestion"
  />
</template>

<style scoped>
</style>