<script setup lang="ts">
import {Socket} from "socket.io-client"
import {PropType} from "vue"
import {Round} from "@/models/round.js"
import {useProfileStore} from "@/stores/profile.js"
import Button from "@/components/Button.vue"

const profile = useProfileStore()

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
</script>

<template>
<div>
  <div class="flex flex-col" v-if="round.status == 'SELECT_TEAM' && profile.data">
    <div>Selecionar uma equipa</div>
  </div>
  <div class="flex gap-1">
    <Button
        v-for="team_data in round.round_teams"
        :disabled="!profile.data"
        :class="round.selected_team === team_data.team.id ? 'border-2 border-yellow-400' : ''"
        @click="selectTeam(team_data.team.id)">
      {{team_data.team.team_name}}
    </Button>
  </div>
</div>
</template>

<style scoped>

</style>