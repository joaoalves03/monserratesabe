<script setup lang="ts">
import {Socket} from "socket.io-client"
import {onBeforeUpdate, PropType, ref} from "vue"
import {Round} from "@/models/round.js"
import Button from "@/components/Button.vue"
import Modal from "@/components/Modal.vue";

const props = defineProps({
  socket: {
    type: Socket,
    required: true
  },
  round: {
    type: Object as PropType<Round>,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(["close"])
const teamPoints = ref({})

onBeforeUpdate(() => {
  props.round.round_teams.forEach((team_data) => {
    teamPoints.value[team_data.team.id] = team_data.score
  })
})

function close() {
  emit("close")
}

function save() {
  props.socket.emit("updateTeamPoints", false, teamPoints.value)
  close()
}
</script>

<template>
  <Modal :visible="visible" @close="close()" title="Adicionar Pontos">
    <div v-for="team_data in props.round.round_teams"
         class="mb-2 flex w-full items-center gap-2">
      <p class="w-1/3 truncate">{{ team_data.team.team_name }}</p>
      <input type="number"
             v-model="teamPoints[team_data.team.id]"
             class="flex-1 rounded border-2 p-2 text-right" />
    </div>

    <div class="flex w-full justify-end gap-2">
      <Button class="danger" @click="close()">Cancelar</Button>
      <Button @click="save">Guardar</Button>
    </div>
  </Modal>
</template>

<style scoped>

</style>