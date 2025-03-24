<script setup lang="ts">
import {Socket} from "socket.io-client"
import {computed, onMounted, PropType} from "vue"
import {Round} from "@/models/round.js"
import {useProfileStore} from "@/stores/profile.js"

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

const colors = ['red-500','green-500','blue-400']

const hide = computed(() => ["SELECT_PHASE", "SHOW_WINNER"].includes(props.round.status))
const fullscreen = computed(() => ["SELECT_TEAM", "SHOW_TEAMS"].includes(props.round.status))
const operatorAndTeamChallenge = computed(() => profile.data && props.round.phase == "TEAM_CHALLENGE")
const isSelected = (index: number) => index === props.round.selected_team


onMounted(() => {
  console.log(props.round.round_teams)
})
async function selectTeam(id: number) {
  if(!profile.data) return

  props.socket.emit("updateRound", {
    selected_team: id === props.round.selected_team ? null : id
  })
}
</script>

<template>
<!-- This is dumb, too bad! -->
<div class="hidden bg-red-500 bg-green-500 bg-blue-400 text-red-500 text-green-500 text-blue-400"></div>

<div class="flex w-full select-none" :class="([
    hide ? 'hidden' : '',
    fullscreen ? 'h-full' : 'h-auto'
])">
  <div v-for="(team_data, index) of round.round_teams"
       class="flex flex-1 items-center gap-2 p-4 transition-colors"
       :class="([
           fullscreen ? 'flex-col justify-center' : 'justify-between px-8',
           isSelected(team_data.team.id)
            ? 'bg-' + colors[index] + ' text-white'
            : profile.data ? 'hover:bg-black/10' : '',
           profile.data ? 'cursor-pointer' : 'cursor-default',
       ])"
       @click="selectTeam(team_data.team.id)">

    <p class="text-4xl font-semibold">{{team_data.team.team_name}}</p>

    <div v-if="fullscreen" class="flex flex-wrap items-center justify-center">
      <p class="bg-black/10 p-2 m-1 rounded-md shadow-md text-2xl" v-for="member in team_data.team.members">
        {{member.member_name}}
      </p>
    </div>

    <div class="rounded px-2 py-1 transition-colors" :class="isSelected(team_data.team.id) ? 'bg-white' : 'bg-black'">
      <p class="font-bold transition-colors"
         :class="[
             (isSelected(team_data.team.id) ? 'text-' + colors[index] : 'text-white'),
             (operatorAndTeamChallenge ? 'text-2xl' : 'text-4xl')
         ]">
        {{team_data.score}}
      </p>
    </div>

    <template v-if="operatorAndTeamChallenge">
      <div>Placeholder</div>
<!--      <Desafio :numero="i"/>-->
    </template>
  </div>
</div>
</template>

<style scoped>

</style>