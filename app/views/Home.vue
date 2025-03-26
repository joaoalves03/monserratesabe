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
        <span class="material-symbols-rounded fill text-6xl animate-spin">progress_activity</span>
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
            class="relative bg-gray-300 rounded-lg w-60 h-28 flex flex-col justify-between hover:bg-gray-400 hover:cursor-pointer transition-all overflow-hidden"
        >
          <div class="p-4 text-xl font-semibold">
            <p class="line-clamp-2">{{round.name}}</p>
          </div>
          <div class="flex">
            <div
                class="flex justify-center items-center overflow-hidden w-full text-white font-bold"
                v-for="team in round.round_teams"
                :style="{ backgroundColor: team.color }"
            >
              <p class="truncate w-full text-center px-2">{{team.team.team_name}}</p>
            </div>
          </div>

          <div v-if="round.status === 'SHOW_WINNER'" class="bg-black/10 rounded-md absolute top-0 left-0 w-full h-full flex p-1 justify-end items-start">
            <div class="stamp">
              <p class="text-xl font-bold">Finished</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* credit https://css-shape.com/stamp/ */
.stamp{
  @apply py-2 px-4 bg-red-500 text-white rotate-12 absolute bottom-6 left-4;

  --r: 0.25rem;
  mask:
      radial-gradient(var(--r),#0000 97%,#000) round
      calc(-1.5*var(--r)) calc(-1.5*var(--r))/calc(3*var(--r)) calc(3*var(--r)),
      linear-gradient(#000, #000) no-repeat 50%/calc(100% - 3*var(--r)) calc(100% - 3*var(--r));
}
</style>