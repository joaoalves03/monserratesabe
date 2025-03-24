<script setup lang="ts">
import {Socket} from "socket.io-client"
import {computed, onMounted, PropType, ref, useTemplateRef} from "vue"
import {Round} from "@/models/round.js"
import Button from "@/components/Button.vue"

const editPointsDialog = useTemplateRef("editPointsDialog")

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

const teamPoints = ref({})

onMounted(() => {
  props.round.round_teams.forEach((team_data) => {
    teamPoints.value[team_data.team.id] = team_data.score
  })
})

defineExpose({ show, close })

function show() {
  editPointsDialog.value.show()
}

function close() {
  editPointsDialog.value.close()
}

function save() {
  props.socket.emit("updateTeamPoints", teamPoints.value)
}
</script>

<template>
  <dialog ref="editPointsDialog" class="rounded-lg p-8">
    <div v-for="team_data in props.round.round_teams"
         class="mb-2 flex w-full items-center gap-2">
      <p class="w-1/3 truncate">{{ team_data.team.team_name }}</p>
      <input type="number"
             v-model="teamPoints[team_data.team.id]"
             class="flex-1 rounded border-2 p-2 text-right" />
    </div>

    <div class="flex w-full justify-end gap-2">
      <Button class="danger" @click="close">Cancelar</Button>
      <Button @click="save">Guardar</Button>
    </div>
  </dialog>
</template>

<style scoped>

</style>