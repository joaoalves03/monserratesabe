<script setup lang="ts">
import {defineEmits, defineProps, reactive, ref} from 'vue'
import Button from "@/components/Button.vue";
import Modal from "@/components/Modal.vue";
import {prompt} from "@/plugins/prompt.js";

const props = defineProps({
  title: {
    type: String,
    default: 'Data Table'
  },
  columns: {
    type: Array as () => any[],
    required: true
  },
  items: {
    type: Array as () => any[],
    required: true
  }
})

const emit = defineEmits(['create', 'update', 'delete'])

const showModal = ref(false)
const isEditing = ref(false)
const currentItem = reactive({})
const itemToDelete = ref(null)
const form = ref<HTMLFormElement | null>(null)

const getCellValue = (item: any, column: Column) => {
  if (column.options) {
    const value = getNestedValue(item, column.path || '');
    const option = column.options.find((opt: any) => opt.id === value);
    return option ? option.name : value;
  }

  if (column.displayPath) {
    return getNestedValue(item, column.displayPath);
  }

  if (!column.path) {
    return item[column.key];
  }

  return column.path.split('.').reduce((obj: any, key: string) => {
    return obj && obj[key] !== undefined ? obj[key] : null;
  }, item);
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((o: any, p: string) => (o || {})[p], obj);
}

const updateNestedValue = (obj: any, path: string, value: any) => {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

const showAddForm = () => {
  isEditing.value = false
  Object.assign(currentItem, getEmptyItem())
  showModal.value = true
}

const editItem = (item) => {
  isEditing.value = true
  deepCopy(item, currentItem)
  showModal.value = true
}

const deepCopy = (source, target) => {
  Object.keys(target).forEach(key => {
    delete target[key]
  })

  Object.keys(source).forEach(key => {
    if (source[key] !== null && typeof source[key] === 'object') {
      target[key] = Array.isArray(source[key]) ? [] : {}
      deepCopy(source[key], target[key])
    } else {
      target[key] = source[key]
    }
  })
}

const confirmDelete = async (item) => {
  itemToDelete.value = item
  const response = await prompt.confirm("Are you sure you want to delete this item?")
  if (response) {
    emit('delete', itemToDelete.value)
    itemToDelete.value = null
  }
}

const submit = () => {
  if(form.value){
    form.value.requestSubmit()
  }
}

const saveItem = () => {
  const itemToSave = JSON.parse(JSON.stringify(currentItem))

  props.columns.forEach(column => {
    if (!column.required && itemToSave[column.key] === '') {
      itemToSave[column.key] = null
    }
  })

  if (!isEditing.value) {
    delete itemToSave.id
  }

  if (isEditing.value) {
    emit('update', itemToSave)
  } else {
    emit('create', itemToSave)
  }
  closeModal()
}

const closeModal = () => {
  showModal.value = false
  Object.keys(currentItem).forEach(key => {
    delete currentItem[key]
  })
}

const getEmptyItem = () => {
  const item = {}

  props.columns.forEach(column => {
    if (column.key === 'id') return

    if (column.path) {
      const pathParts = column.path.split('.')
      let currentObj = item

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        if (!currentObj[part]) {
          currentObj[part] = {}
        }
        currentObj = currentObj[part]
      }

      currentObj[pathParts[pathParts.length - 1]] = column.required ? '' : null
    } else {
      item[column.key] = column.required ? '' : null
    }
  })

  return item
}
</script>

<template>
  <div class="w-full my-5 font-sans">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
      <Button @click="showAddForm">
        <span class="material-symbols-rounded fill">add</span>
      </Button>
    </div>

    <div class="overflow-x-auto rounded-lg shadow">
      <table class="w-full border-collapse bg-white">
        <thead>
        <tr class="bg-gray-50">
          <th v-for="column in columns" :key="column.key" class="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider border-b">
            {{ column.label }}
          </th>
          <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider border-b">
            Actions
          </th>
        </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
        <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
          <td v-for="column in columns" :key="`${item.id}-${column.key}`" class="px-6 py-4 text-sm text-gray-700">
            {{ getCellValue(item, column) }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-700 flex gap-2">
            <Button @click="editItem(item)">
              <span class="material-symbols-rounded fill">edit</span>
            </Button>
            <Button @click="confirmDelete(item)" class="danger">
              <span class="material-symbols-rounded fill">delete</span>
            </Button>
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td :colspan="columns.length + 1" class="px-6 py-8 text-center text-gray-500">
            No data available
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <Modal :visible="showModal" @close="closeModal" :title="isEditing ? 'Edit Item' : 'Add New Item'">
      <form ref="form" @submit.prevent="saveItem">
        <div v-for="column in columns" :key="`form-${column.key}`" class="space-y-1">

          <template v-if="column.key !== 'id'">
            <label :for="column.key" class="block text-sm font-medium text-gray-700">{{ column.label }}</label>

            <template v-if="column.inputType === 'select'">
              <select
                  :id="column.key"
                  :value="getNestedValue(currentItem, column.path)"
                  @change="updateNestedValue(currentItem, column.path, $event.target.value)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :required="column.required"
              >
                <option value="">Select a category</option>
                <option
                    v-for="option in column.options"
                    :key="option.id"
                    :value="option.id"
                >
                  {{ option.name }}
                </option>
              </select>
            </template>
            <template v-else-if="column.path">
              <input
                  :id="column.key"
                  :value="getNestedValue(currentItem, column.path)"
                  @input="updateNestedValue(currentItem, column.path, $event.target.value)"
                  :type="column.type || 'text'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :required="column.required"
              />
            </template>
            <template v-else>
              <input
                  :id="column.key"
                  v-model="currentItem[column.key]"
                  :type="column.type || 'text'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :required="column.required"
              />
            </template>
          </template>
        </div>
      </form>

      <template v-slot:actions>
        <Button @click="closeModal" class="danger">
          Cancel
        </Button>
        <Button @click.prevent="submit">
          Save
        </Button>
      </template>
    </Modal>
  </div>
</template>