<script setup lang="ts">
import {onMounted, Ref, ref} from "vue"
import axios from "axios"
import {Question} from "@/models/question.js"
import DataTable from "@/components/DataTable.vue"

const columns = ref([
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'question', label: 'Pergunta' },
  { key: 'category', label: 'Categoria', path: 'category.name' },
])

const questions: Ref<Question> = ref([])

onMounted(async () => {
  questions.value = (await axios.get("/api/question")).data
})

function createQuestion() {}

function updateQuestion() {}

function deleteQuestion() {}
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