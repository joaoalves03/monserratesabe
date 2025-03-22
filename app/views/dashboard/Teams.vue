<script setup lang="ts">
import DataTable from "@/components/DataTable.vue"
import {onMounted, Ref, ref} from "vue"
import {Team} from "@/models/team.js"
import axios from "axios"

const columns = ref([
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'team_name', label: 'Nome' }
])

const teams: Ref<Team> = ref([])

onMounted(async () => {
  teams.value = (await axios.get("/api/team")).data
})

function createTeam() {}

function updateTeam() {}

function deleteTeam() {}
</script>

<template>
  <DataTable
      title="Equipas"
      :columns="columns"
      :items="teams"
      @create="createTeam"
      @update="updateTeam"
      @delete="deleteTeam"
  />
</template>

<style scoped>

</style>