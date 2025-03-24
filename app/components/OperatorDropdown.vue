<script setup lang="ts">

import Dropdown from "@/components/Dropdown.vue"
import Button from "@/components/Button.vue"
import DropdownItem from "@/components/DropdownItem.vue"
import {Socket} from "socket.io-client"
import {PropType, ref} from "vue"
import {Round} from "@/models/round.js"
import EditPoints from "@/components/EditPoints.vue"

const editPointsModal = ref(false)

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

async function goToOptions() {
  props.socket.emit("updateRound", {
    status: "SELECT_OPTIONS"
  })
}

async function launchQuestion() {
  props.socket.emit("launchQuestion")
}

async function verifyAnswer() {
  props.socket.emit("submitAnswer")
}

async function goToTeamView() {
  props.socket.emit("updateRound", {
    status: "SHOW_TEAMS"
  })
}

async function changePhase() {
  props.socket.emit("updateRound", {
    status: "SELECT_PHASE"
  })
}

async function moreBuzzer() {
  props.socket.emit("launchBuzzerQuestion")
}

</script>

<template>
  <div class="absolute z-50 top-1 right-1 flex gap-1">
    <template v-if="round.status == 'SELECT_TEAM'">
      <Button @click="changePhase" class="danger" v-if="round.phase == 'TEAM_CHALLENGE'">
        Próxima fase
      </Button>

      <Button @click="goToOptions" class="danger" v-else>
        Confirmar
      </Button>
    </template>

    <Button @click="launchQuestion"
            :disabled="round.selected_category == null"
            :class="round.selected_category == null ? 'disabled' : 'danger'"
            v-if="round.status == 'SELECT_OPTIONS'">
      Confirmar
    </Button>

    <Button @click="verifyAnswer"
            class="danger"
            v-if="round.status == 'SELECT_ANSWER'">
      Verificar resposta
    </Button>

    <Button @click="goToTeamView"
            class="danger"
            v-if="round.status == 'SHOW_ANSWER'">
      Continuar
    </Button>

    <Button @click="round.phase == 'BUZZER' ? moreBuzzer() : goToOptions()"
            class="danger"
            v-if="round.status == 'SHOW_TEAMS'">
      Continuar
    </Button>

    <Dropdown text="Opções">
      <DropdownItem @click="changePhase" icon="edit">Alterar Fase</DropdownItem>
      <DropdownItem @click="editPointsModal = !editPointsModal" icon="tune">Editar Pontos</DropdownItem>
      <DropdownItem @click="" icon="sports_score">Acabar Jogo</DropdownItem>
      <DropdownItem path="/" icon="logout">Sair</DropdownItem>
    </Dropdown>
  </div>

  <EditPoints :visible="editPointsModal" @close="editPointsModal = false" :round="round" :socket="socket" />
</template>

<style scoped>

</style>