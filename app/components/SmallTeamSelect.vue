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
  props.socket.emit("updateRound", {
    selected_team: id === props.selectedTeam ? null : id
  })
}
</script>

<template>
  <div>
    <button
        v-for="team_data in teams"
        class="bg-blue-400 px-3 py-1 m-1"
        :class="selectedTeam === team_data.team.id ? 'border-2 border-yellow-400' : ''"
        @click="selectTeam(team_data.team.id)">
      {{team_data.team.team_name}}
    </button>
  </div>
</template>

<style scoped>

</style>