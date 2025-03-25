<script setup lang="ts">
import {Socket} from "socket.io-client"
import {onMounted, PropType, Ref, ref, watch} from "vue"
import {Category} from "@/models/category.js"
import {Round} from "@/models/round.js"
import axios from "axios"
import Button from "@/components/Button.vue"
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
</script>

<template>
  <div class="flex flex-col w-screen h-screen justify-center items-center">
    <div class="flex flex-col grow justify-center items-center">
      <div class="flex gap-1 flex-wrap justify-center text-4xl">
        <Button
            v-for="category in categories"
            :disabled="usedCategories.includes(category.id) || !profile.data"
            :class="([
              usedCategories.includes(category.id) ? 'disabled' : '',
              category.id === round.selected_category ? 'selected' : ''
            ])"
            class="my-1"
            @click="selectCategory(category.id)">
          {{category.name}}
        </Button>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>