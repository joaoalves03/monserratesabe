<script setup lang="ts">
import {ref, onMounted} from "vue"
import {useRouter} from "vue-router";
import axios from "axios"
import {Team} from "@/models/team.js";
import Modal from "@/components/Modal.vue"
import Button from "@/components/Button.vue"
import Dropdown from "@/components/Dropdown.vue"
import DropdownItem from "@/components/DropdownItem.vue"

const router = useRouter()
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})

const colors = ['#f84a4a', '#269cfd', '#26d63c']
const availableTeams = ref<Team[]>([])
const emit = defineEmits(["close"])

const form = ref<HTMLFormElement | null>(null)
const gameTitle = ref("")
const selectedTeamIds = ref<(number | null)[]>([null, null, null])

onMounted(async () => {
  try {
    const response = await axios.get("/api/team")
    availableTeams.value = response.data
  } catch (error) {
    console.error("Error fetching teams:", error)
  }
})

const closeModal = () => {
  gameTitle.value = ""
  selectedTeamIds.value = [null, null, null]
  emit("close")
}

const submit = () => {
  form.value?.requestSubmit()
}

const selectTeam = (index: number, teamId: number) => {
  selectedTeamIds.value[index] = teamId
}

const getAvailableTeams = (currentIndex: number) => {
  return availableTeams.value.filter(team => {
    return !selectedTeamIds.value.some((id, idx) =>
        id === team.id && idx !== currentIndex
    )
  })
}

const savePoll = async () => {
  if (selectedTeamIds.value.some(id => id === null)) {
    alert('Please select all 3 teams')
    return
  }

  const teamIds = selectedTeamIds.value.filter(id => id !== null) as number[]

  try {
    const response = await axios.post("/api/round", {
      name: gameTitle.value,
      team_ids: teamIds
    })

    closeModal()
    await router.push(`/game/${response.data.id}`)
  } catch (error) {
    console.error("Error saving poll:", error)
  }
}
</script>

<template>
  <Modal
      title="New Game"
      :visible="props.visible"
      @close="closeModal"
  >
    <form ref="form" class="flex flex-col gap-6" @submit.prevent="savePoll">
      <div class="flex flex-col gap-2">
        <label for="title">Game Title <span class="text-red-500">*</span></label>
        <input
            id="title"
            type="text"
            v-model="gameTitle"
            placeholder="Enter game title"
            maxlength="64"
            class="border rounded-md p-2 w-full"
            required
        />
      </div>

      <div class="flex flex-col gap-2">
        <div>
          <label>Teams <span class="text-red-500">*</span></label>
          <p class="font-light text-red-500 text-xs">Select three unique teams</p>
        </div>

        <div v-for="(teamId, index) in selectedTeamIds" :key="index" class="flex items-center gap-2">
          <div
              class="h-fit w-fit p-4 aspect-square rounded-md"
              :style="`background-color: ${colors[index]}`"
          ></div>

          <Dropdown :text="availableTeams.find(t => t.id === teamId)?.team_name || 'Select team'">
            <DropdownItem
                v-for="team in getAvailableTeams(index)"
                :key="team.id"
                @click="selectTeam(index, team.id)"
            >
              {{ team.team_name }}
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </form>

    <template v-slot:actions>
      <Button class="danger" @click="closeModal" type="button">Cancel</Button>
      <Button @click="submit">Save</Button>
    </template>
  </Modal>
</template>

<style scoped>
</style>