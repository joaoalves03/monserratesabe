<script setup lang="ts">
import DataTable from "@/components/DataTable.vue"
import { onMounted, Ref, ref } from "vue"
import { Team } from "@/models/team.js"
import axios from "axios"

const columns = ref([
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'team_name', label: 'Nome' }
])

const teams: Ref<Team[]> = ref([])

onMounted(async () => {
  teams.value = (await axios.get("/api/team")).data
})

async function createTeam(newTeam: Team) {
  try {
    const response = await axios.post("/api/team", newTeam)
    teams.value.push(response.data)
  } catch (error) {
    console.error("Error creating team:", error)
  }
}

async function updateTeam(updatedTeam: Team) {
  try {
    const response = await axios.put(`/api/team/${updatedTeam.id}`, updatedTeam)
    const index = teams.value.findIndex(team => team.id === updatedTeam.id)
    if (index !== -1) {
      teams.value[index] = response.data
    }
  } catch (error) {
    console.error("Error updating team:", error)
  }
}

async function deleteTeam(deletedTeam: Team) {
  try {
    await axios.delete(`/api/team/${deletedTeam.id}`)
    teams.value = teams.value.filter(team => team.id !== deletedTeam.id)
  } catch (error) {
    console.error("Error deleting team:", error)
  }
}
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