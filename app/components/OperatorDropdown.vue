<script setup lang="ts">

import Dropdown from "@/components/Dropdown.vue"
import Button from "@/components/Button.vue"
import DropdownItem from "@/components/DropdownItem.vue"
import {Socket} from "socket.io-client"
import {PropType} from "vue"
import {Round} from "@/models/round.js"

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

</script>

<template>
  <div class="absolute z-50 top-1 right-1 flex gap-1">
    <Button @click="goToOptions" class="danger" v-if="round.status == 'SELECT_TEAM'">
      Confirmar
    </Button>

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

    <Button @click="goToOptions"
            class="danger"
            v-if="round.status == 'SHOW_TEAMS'">
      Continuar
    </Button>

    <Dropdown text="Opções">
      <DropdownItem @click="" icon="person_add">Alterar Fase</DropdownItem>
      <DropdownItem @click="" icon="person_add">Editar Pontos</DropdownItem>
      <DropdownItem @click="" icon="person_add">Acabar Jogo</DropdownItem>
      <DropdownItem @click="" icon="person_add">Sair</DropdownItem>
    </Dropdown>
  </div>
</template>

<style scoped>

</style>