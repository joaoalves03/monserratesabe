<script setup lang="ts">
import Button from "@/components/Button.vue"
import {useProfileStore} from "@/stores/profile.js"
import {onMounted, ref} from "vue"
import Dropdown from "@/components/Dropdown.vue"
import DropdownItem from "@/components/DropdownItem.vue"
import NewGame from "@/views/modals/NewGame.vue"
import axios, {AxiosError} from "axios"
import {prompt} from "@/plugins/prompt.js";
import {toast} from "@/plugins/toast.js";

const profile = useProfileStore()

const gameModal = ref(false)
const toggleModal = (value: boolean) => {
  gameModal.value = value
}

onMounted(async () => {
  if(profile.data === undefined) {
    await profile.fetch()
  }

})

const addAdmin = async () => {
  const response = await prompt.ask("Admin Email")
  if(response) {
    try {
      await axios.post("/api/auth/admin", {
        email: response
      })

      toast.success(`Admin created`)
    } catch (e: any) {
      if(e instanceof AxiosError && e.status === 409) {
        toast.error(`Admin already exists`)
      } else {
        toast.error(`Unknown Error`)
      }
    }
  }
}

</script>

<template>
  <div class="w-full flex px-4 py-2 justify-between items-center">
    <router-link to="/">
      <img class="h-20" src="@/assets/logo.png" alt="MonserrateSabe">
    </router-link>


    <Dropdown v-if="profile.data">
      <template v-slot:button>
        <img class="rounded-full w-10 h-10 aspect-square overflow-hidden" :src="profile.data.photo" alt="Profile picture">
        <div class="hidden md:flex">{{profile.data.name}}</div>
      </template>

      <DropdownItem path="/dashboard/questions" icon="dashboard">Dashboard</DropdownItem>
      <DropdownItem @click="toggleModal(true)" icon="person_add">New Game</DropdownItem>
      <DropdownItem @click="addAdmin()" icon="person_add">New Admin</DropdownItem>
      <DropdownItem path="/api/auth/logout" icon="logout" class="danger">Log out</DropdownItem>
    </Dropdown>

    <Button path="/api/auth/google" v-else-if="profile.data === null">
      <template v-slot:icon>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" class="h-6 w-6" fill="currentColor">
          <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
        </svg>
      </template>
      Login
    </Button>
  </div>

  <NewGame title="New Game"
      :visible="gameModal"
      @close="toggleModal(false)" />
</template>

<style scoped>

</style>