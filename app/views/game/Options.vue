<script setup lang="ts">
import {Socket} from "socket.io-client"
import {onMounted, PropType, Ref, ref, watch} from "vue"
import {Category} from "@/models/category.js"
import {Round} from "@/models/round.js"
import axios from "axios"
import SmallTeamSelect from "@/components/SmallTeamSelect.vue"

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

const categories: Ref<Category[]> = ref([])
const usedCategories: Ref<Number[]> = ref([])

watch(
    () => props.round.selected_team,
    async (_, __) => {
      if(props.round.selected_category != null) {
        props.socket.emit("updateRound", {
          selected_category: null
        })
      }
      usedCategories.value = (await axios.get(`/api/category/used/${props.round.id}`)).data
    }
)

onMounted(async () => {
  categories.value = (await axios.get("/api/category")).data
  usedCategories.value = (await axios.get(`/api/category/used/${props.round.id}`)).data
})

async function selectCategory(id: number) {
  props.socket.emit("updateRound", {
    selected_category: id
  })
}

async function next() {
  props.socket.emit("updateRound", {
    status: "SELECT_ANSWER"
  })
}


</script>

<template>
  <div class="flex flex-col">
    <div>
      <button
          v-for="category in categories"
          :disabled="usedCategories.includes(category.id)"
          :class="([
            usedCategories.includes(category.id) ? 'bg-gray-400' : 'bg-blue-400',
            category.id === round.selected_category ? 'border-2 border-yellow-400' : ''
        ])"
          class="px-3 py-1 m-1"
          @click="selectCategory(category.id)">
        {{category.name}}
      </button>
    </div>
    <button
        :disabled="round.selected_category == null"
        :class="round.selected_category == null ? 'bg-gray-400' : 'bg-yellow-400'"
        class="px-3 py-1 m-1"
        @click="next">
      Continue
    </button>
  </div>
  <SmallTeamSelect :socket="socket" :selected-team="round.selected_team" :teams="round.round_teams"  />
</template>

<style scoped>

</style>