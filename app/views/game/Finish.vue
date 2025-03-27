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

const medalColors = {
  1: 'bg-yellow-400',
  2: 'bg-gray-400',
  3: 'bg-amber-600'
}

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

  const maxScore = teamsArray[0]?.points || 0
  const winningTeams = teamsArray.filter(team => team.points === maxScore)

  const arrangedTeams = winningTeams.map((team, _) => ({
    ...team,
    isWinner: true,
    position: 1
  }))

  const remainingTeams = teamsArray
      .filter(team => !winningTeams.includes(team))
      .map((team, index) => ({
        ...team,
        isWinner: false,
        position: winningTeams.length + index + 1
      }))

  const allTeams = [...arrangedTeams, ...remainingTeams]

  const arranged: any[] = []
  allTeams.forEach((team, index) => {
    index % 2 === 0 ? arranged.push(team) : arranged.unshift(team)
  })

  return arranged
})

const winningTeams = computed(() => {
  return sortedTeams.value.filter(team => team.isWinner) || []
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

function calculateBrightness(position: number, totalTeams: number) {
  if (totalTeams <= 1) return 1;
  return 1 - (0.3 * (position - 1) / (totalTeams - 1));
}

function calculateZIndex(position: number, totalTeams: number) {
  return totalTeams - position + 1;
}

watch(() => props.round?.round_teams, () => {
  animatePodium()
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col items-center w-full h-full">
    <div class="fixed top-12 text-center flex flex-col justify-center items-center">
      <div v-if="winningTeams.length" class="flex flex-col justify-center items-center w-fit gap-1 bg-primary-400 p-2 rounded-2xl text-center text-white font-bold">
        <h1
            :class="winningTeams.length > 1 ? 'text-4xl' : 'text-xl'"
        >
          {{ winningTeams.length > 1 ? 'Empate:' : 'Equipa Vencedora:' }}
        </h1>
        <div class="flex flex-col gap-2">
          <div
              v-for="(team, teamIndex) in winningTeams"
              :key="teamIndex"
              class="flex flex-col items-center"
          >
            <div class="flex gap-4">
              <div v-for="(word, wordIndex) in team.name.split(' ')" :key="wordIndex" class="flex items-center">
                <div
                    class="word flex"
                    :class="winningTeams.length > 1 ? 'text-4xl' : 'text-6xl'"
                >
                  <span
                      class="letter"
                      v-for="(char, charIndex) in Array.from(word)"
                      :key="`${wordIndex}-${charIndex}`"
                      :style="`--i: ${charIndex}; --speed: 1.5`"
                  >
                    {{ char }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="winningTeams.length < 2" class="flex justify-center gap-2 text-4xl px-4 mt-4">
        <div
            v-for="team in winningTeams"
            :key="team.name"
            class="flex"
        >
          <p
              v-for="member in team.members"
              :key="member.member_name"
              class="p-2 m-1 rounded-md shadow-md text-white font-bold"
              :style="{
                backgroundColor: team.color
              }"
          >
            {{ member.member_name }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex fixed -bottom-1 w-2/3 items-end">
      <template v-for="team in sortedTeams" :key="team.name">
        <div
            class="flex flex-col w-1/3 justify-center items-center"
            :style="{
              filter: `brightness(${calculateBrightness(team.position, sortedTeams.length)})`,
              zIndex: `${calculateZIndex(team.position, sortedTeams.length)}`
            }"
        >
          <div
              class="flex justify-center items-center h-fit aspect-square p-2 mb-2 rounded-2xl"
              :class="[
                team.position <= 3 ? medalColors[team.position] : 'bg-primary-500/80',
                team.position === 1 ? 'text-6xl p-1 font-bold w-[4rem] h-[4rem]' : 'text-4xl w-[3rem] h-[3rem]',
                'text-white shadow-md'
              ]"
          >
            <p>
              {{ team.position }}
            </p>
          </div>

          <div
              class="text-4xl rounded-md flex flex-col justify-center items-center text-white"
              :class="team.position === 1
              ? 'w-[120%] shadow-xl'
              : 'w-full'"
              :style="{
                height: `${heights['position' + team.position]}vh`,
                backgroundColor: team.color,
              }"
          >
            <p class="font-bold text-center">{{ team.name }}</p>
            <p class="text-center">{{ scores['position' + team.position]?.toFixed(0) }} pontos</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
</style>