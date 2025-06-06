<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from "vue"
import Button from "@/components/Button.vue"

const props = defineProps({
  text: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: ""
  },
  simple: {
    type: Boolean,
    default: false
  }
})

const active = ref(false)
const dropdown = ref<HTMLElement | null>(null)

const closeDropdown = () => {
  active.value = false
  if (dropdown.value) {
    dropdown.value.blur()

    const focusableChildren = dropdown.value.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    )
    focusableChildren.forEach((child) => child.blur())
  }
}

watch(active, (isActive) => {
  if (isActive && dropdown.value) {
    setTimeout(() =>{
      dropdown.value?.scrollIntoView({ behavior: "smooth"})
    }, 350)
  }
})

onMounted(() => {
  window.addEventListener("mousedown", (event: MouseEvent) => {
    if (dropdown.value && !dropdown.value.contains(event.target as Node)) {
      closeDropdown()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener("mousedown", closeDropdown)
})
</script>

<template>
  <div class="flex relative select-none" ref="dropdown">
    <Button class="!w-full" v-if="!text && icon" :icon="icon" @click.stop="active = !active" type="button">
      <template v-slot:tailing_icon>
        <span class="material-symbols-rounded fill" :class="{'rotate-180': active}">arrow_drop_down</span>
      </template>
    </Button>
    <Button class="!w-full" v-else-if="text || icon" :icon="icon" @click.stop="active = !active" type="button">
      <template v-if="text && text.trim() !== ''">{{ text }}</template>

      <template v-slot:tailing_icon>
        <span class="material-symbols-rounded fill" :class="{'rotate-180': active}">arrow_drop_down</span>
      </template>
    </Button>
    <template v-else>
      <button @click.stop="active = !active" type="button"
           class="flex gap-2 rounded-md items-center cursor-pointer hover:bg-gray-200 transition-all duration-100 ease-in-out"
           :class="[active ? 'bg-gray-100' : '', simple ? 'p-0.5' : 'p-2' ]">
        <slot name="button"></slot>
        <span v-if="!simple" class="material-symbols-rounded fill" :class="{'rotate-180': active}">arrow_drop_down</span>
      </button>
    </template>

    <div class="container"
         :class="active ? 'max-h-52' : 'max-h-0' " @click="closeDropdown()">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>

.container {
  @apply absolute z-10 right-0 top-full mt-2 overflow-hidden w-full min-w-fit overflow-y-auto transition-all duration-300 ease-in-out
  flex flex-col rounded-md bg-gray-100 focus:max-h-44 focus-within:max-h-44;
}
</style>