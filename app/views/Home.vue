<script setup lang="ts">
import Header from "@/components/Header.vue"
import {onMounted, onUnmounted, Ref, ref} from "vue"
import axios from "axios"
import {Round} from "@/models/round.js"
import {useRouter} from "vue-router"

const router = useRouter()

const rounds: Ref<Round[] | undefined> = ref(undefined)

onMounted(async () => {
  const res = await axios.get("/api/round")

  rounds.value = res.data
})

onUnmounted(() => {

})

function goToGame(id: number) {
  router.push(`/game/${id}`)
}

</script>

<template>
  <Header></Header>

  <div class="w-full h-full flex flex-col justify-center items-center">
    <template v-if="rounds === undefined">
        <span class="material-symbols-rounded fill text-6xl animate-spin">autorenew</span>
    </template>

    <template v-else-if="rounds.length == 0">
      <span class="material-symbols-rounded fill text-6xl">question_mark</span>
      <span class="font-light">No rounds found</span>
    </template>

    <div v-else class="w-full h-full flex justify-center py-2 px-4 lg:px-12">
      <div class="w-full h-fit flex flex-wrap justify-center items-start gap-2 pb-32">
        <div
            v-for="round in rounds"
            @click="goToGame(round.id)"
            class="bg-gray-300 rounded-lg w-60 hover:bg-gray-400 hover:cursor-pointer transition-all overflow-hidden"
        >
          <div class="p-4">
            <b>{{round.name}}</b>
          </div>
          <div class="flex">
            <div
                class="flex justify-center items-center w-full text-white font-bold"
                v-for="team in round.round_teams"
                :style="{ backgroundColor: team.color }"
            >
              {{team.team.team_name}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>