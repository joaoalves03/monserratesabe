<script setup lang="ts">
import {ref, onMounted} from "vue"
import {useRouter} from "vue-router";
import axios from "axios"
import {Team} from "@/models/team.js";
import Modal from "@/components/Modal.vue"
import Button from "@/components/Button.vue"
import Dropdown from "@/components/Dropdown.vue"
import DropdownItem from "@/components/DropdownItem.vue"
import {toast} from "@/plugins/toast.js";

const router = useRouter()
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})

const colors = [
  '#f84a4a', '#269cfd', '#26d63c',
  '#ff3dee', '#D4A5A5', '#9B89B3'
]

interface SelectedTeam {
  teamId: number | null
  color: string
}

const availableTeams = ref<Team[]>([])
const emit = defineEmits(["close"])

const form = ref<HTMLFormElement | null>(null)
const gameTitle = ref("")
const selectedTeams = ref<SelectedTeam[]>([
  { teamId: null, color: colors[0] },
  { teamId: null, color: colors[1] },
  { teamId: null, color: colors[2] }
])

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
  selectedTeams.value = [
    { teamId: null, color: colors[0] },
    { teamId: null, color: colors[1] },
    { teamId: null, color: colors[2] }
  ]
  emit("close")
}

const submit = () => {
  form.value?.requestSubmit()
}

const addTeam = () => {
  if (selectedTeams.value.length >= 6) return
  const availableColor = colors.find(color =>
      !selectedTeams.value.some(t => t.color === color)
  )
  if (availableColor) {
    selectedTeams.value.push({ teamId: null, color: availableColor })
  }
}

const removeTeam = (index: number) => {
  if (selectedTeams.value.length <= 3) return
  selectedTeams.value.splice(index, 1)
}

const selectTeam = (index: number, teamId: number) => {
  selectedTeams.value[index].teamId = teamId
}

const selectColor = (index: number, color: string) => {
  selectedTeams.value[index].color = color
}

const getAvailableTeams = (currentIndex: number) => {
  return availableTeams.value.filter(team => {
    return !selectedTeams.value.some((t, idx) =>
        t.teamId === team.id && idx !== currentIndex
    )
  })
}

const getAvailableColors = (currentIndex: number) => {
  return colors.filter(color =>
      !selectedTeams.value.some((t, idx) =>
          t.color === color && idx !== currentIndex
      )
  )
}

const savePoll = async () => {
  if (selectedTeams.value.some(t => t.teamId === null)) {
    alert('Please select all teams')
    return
  }

  try {
    const response = await axios.post("/api/round", {
      name: gameTitle.value,
      teams: selectedTeams.value.map(t => ({
        team_id: t.teamId,
        color: t.color
      }))
    })

    closeModal()
    await router.push(`/game/${response.data.id}`)
    toast.success("Game created")
  } catch (error) {
    console.error("Error creating game", error)
    toast.success("Error creating game")
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
          <p class="font-light text-red-500 text-xs">Select between 3-6 unique teams</p>
        </div>

        <div v-for="(team, index) in selectedTeams" :key="index" class="flex items-center gap-2">
          <div class="flex items-center gap-2 flex-1">
            <Dropdown>
              <template v-slot:button>
                <div
                    class="h-8 w-8 rounded-md cursor-pointer"
                    :style="`background-color: ${team.color}`"
                ></div>
              </template>
              <DropdownItem
                  v-for="color in getAvailableColors(index)"
                  :key="color"
                  @click="selectColor(index, color)"
              >
                <div
                    class="h-6 w-6 rounded-md"
                    :style="`background-color: ${color}`"
                ></div>
              </DropdownItem>
            </Dropdown>

            <Dropdown class="w-full" :text="availableTeams.find(t => t.id === team.teamId)?.team_name || 'Select team'">
              <DropdownItem
                  v-for="teamOpt in getAvailableTeams(index)"
                  :key="teamOpt.id"
                  @click="selectTeam(index, teamOpt.id)"
              >
                {{ teamOpt.team_name }}
              </DropdownItem>
            </Dropdown>
          </div>

          <Button
              v-if="selectedTeams.length > 3"
              type="button"
              icon="remove"
              @click="removeTeam(index)"
          />
        </div>

        <Button
            v-if="selectedTeams.length < 6"
            type="button"
            class="mt-2"
            icon="add"
            @click="addTeam"
        >
          Add Team
        </Button>
      </div>
    </form>

    <template v-slot:actions>
      <Button class="danger" @click="closeModal" type="button">Cancel</Button>
      <Button @click="submit">Save</Button>
    </template>
  </Modal>
</template>