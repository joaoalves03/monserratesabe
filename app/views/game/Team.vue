<script setup lang="ts">
import {Socket} from "socket.io-client"
import {PropType} from "vue"
import {Round} from "@/models/round.js"

const props = defineProps({
  socket: {
    type: Socket,
    required: true
  },
  round: {
    type: Object as PropType<Round>,
    required: true
  }
})

async function selectTeam(id: number) {
  props.socket.emit("updateRound", {
    selected_team: id === props.round.selected_team ? null : id
  })
}

async function next() {
  props.socket.emit("updateRound", {
    status: "SELECT_OPTIONS"
  })
}
</script>

<template>
<div>
  <div class="flex flex-col" v-if="round.status == 'SELECT_TEAM'">
    <div>Selecionar uma equipa</div>
    <button
        :disabled="round.selected_team === null"
        class="px-3 py-1 m-1"
        :class="round.selected_team === null ? 'bg-gray-400' : 'bg-blue-400'"
        @click="next">
      Confirmar
    </button>
  </div>
  <button
      v-if="round.status != 'SELECT_TEAM'"
      class="bg-yellow-400 px-3 py-1 m-1"
      @click="next">
    Continuar
  </button>
  <div>
    <button
        v-for="team_data in round.round_teams"
        class="bg-blue-400 px-3 py-1 m-1"
        :class="round.selected_team === team_data.team.id ? 'border-2 border-yellow-400' : ''"
        @click="selectTeam(team_data.team.id)">
      {{team_data.team.team_name}}
    </button>
  </div>
</div>
</template>

<style scoped>

</style>