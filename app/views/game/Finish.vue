<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue'
import { Socket } from "socket.io-client"
import { Round } from "@/models/round"
import gsap from 'gsap'

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

const maxHeight = 50
const minHeight = 15
const heights = ref<Record<string, number>>({})
const scores = ref<Record<string, number>>({})

const sortedTeams = computed(() => {
  if (!props.round?.round_teams) return []

  const teamsArray = [...props.round.round_teams]
      .map(team_data => ({
        name: team_data.team.team_name,
        members: team_data.team.members,
        points: team_data.score,
        color: team_data.color
      }))
      .sort((a, b) => b.points - a.points)
      .map((team, index) => ({
        ...team,
        position: index + 1
      }))

  const arranged: any[] = []
  teamsArray.forEach((team, index) => {
    index % 2 === 0 ? arranged.push(team) : arranged.unshift(team)
  })

  return arranged
})

const winningTeam = computed(() => {
  return sortedTeams.value.find(team => team.position === 1) || null
})

function calculateHeight(score: number) {
  if (!sortedTeams.value.length) return minHeight

  const maxScore = Math.max(...sortedTeams.value.map(t => t.points))
  const minScore = Math.min(...sortedTeams.value.map(t => t.points))

  if (score === maxScore) return maxHeight
  if (score === minScore) return minHeight + 5

  const heightRange = (maxHeight - 5) - (minHeight + 15)
  const scoreRange = maxScore - minScore
  return ((heightRange * (score - minScore)) / scoreRange + (minHeight + 15))
}

function animatePodium() {
  const initialHeights: Record<string, number> = {}
  const initialScores: Record<string, number> = {}

  sortedTeams.value.forEach((team) => {
    const position = `position${team.position}`
    initialHeights[position] = minHeight
    initialScores[position] = 0
  })

  heights.value = initialHeights
  scores.value = initialScores

  const heightAnimation: Record<string, number> = {}
  const scoreAnimation: Record<string, number> = {}

  sortedTeams.value.forEach((team) => {
    const position = `position${team.position}`
    heightAnimation[position] = calculateHeight(team.points)
    scoreAnimation[position] = team.points
  })

  gsap.to(heights.value, {
    duration: 1,
    ...heightAnimation
  })

  gsap.to(scores.value, {
    duration: 1,
    ...scoreAnimation
  })
}

watch(() => props.round?.round_teams, () => {
  animatePodium()
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col items-center w-full h-full">
    <div class="fixed top-12 text-center flex flex-col justify-center items-center">
      <div v-if="winningTeam" class="flex justify-center items-center w-fit gap-1 bg-primary-400 p-2 rounded-2xl text-center text-white font-bold">
        <h1 class="text-4xl">Equipa Vencedora:</h1>

        <div class="flex gap-4">
          <div v-for="words in winningTeam.name.split(' ')" class="flex">
            <div v-for="word in words" class="word text-6xl flex-wrap">
            <span class="letter" v-for="(char, i) in Array.from(word)"
                  :style="`--i: ${i}; --speed: 1.5`">
              {{ char }}
            </span>
            </div>
          </div>
        </div>
      </div>




      <div v-if="winningTeam" class="flex justify-center gap-2 text-4xl px-4">
        <p
            v-for="member in winningTeam.members"
            :key="member.member_name"
            class="p-2 mt-4 rounded-md shadow-md text-white font-bold"
            :style="{
              backgroundColor: winningTeam.color
            }"
        >
          {{ member.member_name }}
        </p>
      </div>
    </div>

    <div class="flex fixed -bottom-1 w-2/3 items-end">
      <template v-for="team in sortedTeams" :key="team.name">
        <div class="flex flex-col w-1/3 justify-center items-center">
          <p class="mb-2" :class="team.position === 1 ? 'text-8xl p-1 font-bold rounded-2xl bg-yellow-400 text-white' : 'text-6xl'">
            {{ team.position }}
          </p>
          <div
              class="shadow-xl text-4xl rounded-md flex flex-col justify-center items-center text-white"
              :class="team.position === 1
              ? 'w-[120%] z-10'
              : 'w-full'"
              :style="{
                height: `${heights['position' + team.position]}vh`,
                backgroundColor: team.color
              }"
          >
            <p class="font-bold">{{ team.name }}</p>
            <p class="text-center">{{ scores['position' + team.position]?.toFixed(0) }} pontos</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
</style>