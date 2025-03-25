<script setup lang="ts">
import {Socket} from "socket.io-client"
import {computed, PropType, ref, watch} from "vue"
import {Round} from "@/models/round.js"
import {useProfileStore} from "@/stores/profile.js"
import Button from "@/components/Button.vue";
import gsap from 'gsap'

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

const hide = computed(() =>
    ["SHOW_WINNER"].includes(props.round.status) || (["SELECT_PHASE"].includes(props.round.status) && profile.data)
)
const fullscreen = computed(() =>
    ["SELECT_TEAM", "SHOW_TEAMS"].includes(props.round.status) || (["SELECT_PHASE"].includes(props.round.status) && !profile.data)
)
const operatorAndTeamChallenge = computed(() => profile.data && props.round.phase == "TEAM_CHALLENGE")
const isSelected = (teamId: number) => props.round.selected_team === teamId
const pointAdjustment = ref<Record<number, number>>({})
const animatedPoints = ref<Record<number, number>>({})
const previousPoints = ref<Record<number, number>>({})

watch(
    () => props.round?.round_teams,
    (newTeams) => {
      if (newTeams) {
        newTeams.forEach((team_data) => {
          if (!(team_data.team.id in pointAdjustment.value)) {
            pointAdjustment.value[team_data.team.id] = 1;
          }

          const prevPoint = previousPoints.value[team_data.team.id] ?? team_data.score
          const currentPoint = team_data.score

          // Animate from previous to current points
          gsap.to(animatedPoints.value, {
            [team_data.team.id]: currentPoint,
            duration: 0.5,
            ease: "power1.out",
            onStart: () => {
              if (animatedPoints.value[team_data.team.id] === undefined) {
                animatedPoints.value[team_data.team.id] = prevPoint
              }
            }
          })

          previousPoints.value[team_data.team.id] = currentPoint
        });
      }
    },
    { immediate: true, deep: true }
)

async function selectTeam(id: number) {
  if(!profile.data) return

  props.socket.emit("updateRound", {
    selected_team: id === props.round.selected_team ? null : id
  })
}

function adjustPoints(teamId: number, isAddition: boolean) {
  if (!isSelected(teamId)) return

  const adjustment = pointAdjustment.value[teamId] || 1
  const change = isAddition ? adjustment : -adjustment

  const teamData = props.round.round_teams.find(t => t.team.id === teamId)
  if (!teamData) return

  const newPoints = teamData.score + change

  props.socket.emit("updateTeamPoints", false, {
    [teamId]: newPoints
  })
}
</script>

<template>
  <div class="mt-auto flex w-full select-none transition-height duration-1000 ease-in-out" :class="([
    hide ? 'hidden' : '',
    fullscreen ? 'h-screen' : 'h-24'
])">
    <div v-for="team_data of round.round_teams"
         :key="team_data.team.id"
         class="flex flex-1 items-center gap-2 p-4 transition-colors"
         :class="([
           fullscreen ? 'flex-col justify-center' : 'justify-between px-8 truncate',
           isSelected(team_data.team.id)
            ? 'text-white'
            : profile.data ? 'hover:bg-black/10' : '',
           profile.data ? 'cursor-pointer' : 'cursor-default',
       ])"
         :style="{
            backgroundColor: isSelected(team_data.team.id) ? team_data.color : 'white'
       }"
         @click="selectTeam(team_data.team.id)">

      <p
          class="text-4xl font-semibold"
          :class="[
              fullscreen ? 'text-center' : 'truncate'
          ]"
      >
        {{team_data.team.team_name}}
      </p>

      <div v-if="fullscreen" class="flex flex-wrap items-center justify-center">
        <p class="bg-black/10 p-2 m-1 rounded-md shadow-md text-2xl" v-for="member in team_data.team.members" :key="member.member_name">
          {{member.member_name}}
        </p>
      </div>

      <div class="rounded px-2 py-1 transition-colors" :class="isSelected(team_data.team.id) ? 'bg-white' : 'bg-black'">
        <p class="font-bold transition-colors"
           :class="[
             (operatorAndTeamChallenge ? 'text-2xl' : 'text-4xl')
         ]"
           :style="{
              color: isSelected(team_data.team.id) ? team_data.color : 'white'
         }"
        >
          {{ Math.round(animatedPoints[team_data.team.id] ?? team_data.score) }}
        </p>
      </div>

      <template v-if="operatorAndTeamChallenge">
        <div class="flex justify-center items-center text-xl gap-2 text-black">
          <Button
              icon="remove"
              :class="isSelected(team_data.team.id) ? '' : 'disabled'"
              @click.stop="adjustPoints(team_data.team.id, false)"
          />
          <input
              class="text-center appearance-none w-1/4 min-w-16"
              type="number"
              min="1"
              v-model="pointAdjustment[team_data.team.id]"
          >
          <Button
              icon="add"
              :class="isSelected(team_data.team.id) ? '' : 'disabled'"
              @click.stop="adjustPoints(team_data.team.id, true)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>

</style>