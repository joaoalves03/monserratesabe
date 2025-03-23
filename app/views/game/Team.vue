<script setup lang="ts">
import {Socket} from "socket.io-client"
import {TeamDTO} from "@/models/teamDTO.js"

const props = defineProps({
  socket: {
    type: Socket,
    required: true
  },
  teams: {
    type: Array<TeamDTO>,
    required: true
  },
  selectedTeam: {
    type: Number,
    required: true
  }
})

async function selectTeam(id: number) {
  props.socket.emit("updateSelectedTeam", id === props.selectedTeam ? null : id)
}

async function next() {
  props.socket.emit("updateStatus", "SELECT_OPTIONS")
}
</script>

<template>
<div>
  <div>Selecionar uma equipa</div>
  <button
      :disabled="selectedTeam === null"
      class="px-3 py-1 m-1"
      :class="selectedTeam === null ? 'bg-gray-400' : 'bg-blue-400'"
      @click="next">
    Confirmar
  </button>
  <div>
    <button
        v-for="team_data in teams"
        class="bg-blue-400 px-3 py-1 m-1"
        :class="selectedTeam === team_data.team.id ? 'border-2 border-yellow-400' : ''"
        @click="selectTeam(team_data.team.id)">
      {{team_data.team.team_name}}
    </button>
  </div>
</div>
</template>

<style scoped>

</style>