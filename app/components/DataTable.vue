<template>
  <div class="w-full my-5 font-sans">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
      <button @click="showAddForm" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 transition duration-200">
        <span class="material-symbols-rounded fill">add</span>
      </button>
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
            <button @click="editItem(item)" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 transition duration-200">
              <span class="material-symbols-rounded fill">edit</span>
            </button>
            <button @click="confirmDelete(item)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition duration-200">
              <span class="material-symbols-rounded fill">delete</span>
            </button>
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

    <div v-if="showModal.value" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div class="flex justify-between items-center px-6 py-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">{{ isEditing.value ? 'Edit Item' : 'Add New Item' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-500 focus:outline-none text-xl font-semibold">
            &times
          </button>
        </div>
        <div class="px-6 py-4">
          <form @submit.prevent="saveItem" class="space-y-4">
            <div v-for="column in columns" :key="`form-${column.key}`" class="space-y-1">
              <label :for="column.key" class="block text-sm font-medium text-gray-700">{{ column.label }}</label>

              <template v-if="column.path">
                <input
                    :id="column.key"
                    :value="getNestedValue(currentItem, column.path)"
                    @input="updateNestedValue(currentItem, column.path, $event.target.value)"
                    :type="column.type || 'text'"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
              </template>
              <template v-else>
                <input
                    :id="column.key"
                    v-model="currentItem[column.key]"
                    :type="column.type || 'text'"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
              </template>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModal" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition duration-200">
                Cancel
              </button>
              <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal.value" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-sm mx-4 shadow-xl">
        <div class="flex justify-between items-center px-6 py-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">Confirm Delete</h3>
          <button @click="showDeleteModal.value = false" class="text-gray-400 hover:text-gray-500 focus:outline-none text-xl font-semibold">
            &times
          </button>
        </div>
        <div class="px-6 py-4">
          <p class="text-gray-700 mb-6">Are you sure you want to delete this item?</p>
          <div class="flex justify-end gap-3">
            <button @click="showDeleteModal.value = false" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition duration-200">
              Cancel
            </button>
            <button @click="deleteItem" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Data Table'
  },
  columns: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['create', 'update', 'delete'])

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const currentItem = reactive({})
const itemToDelete = ref(null)

const getCellValue = (item, column) => {
  if (!column.path) {
    return item[column.key]
  }

  return column.path.split('.').reduce((obj, key) => {
    return obj && obj[key] !== undefined ? obj[key] : null
  }, item)
}

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, p) => (o || {})[p], obj)
}

const updateNestedValue = (obj, path, value) => {
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!current[part]) {
      current[part] = {}
    }
    current = current[part]
  }
  current[parts[parts.length - 1]] = value
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

const confirmDelete = (item) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const deleteItem = () => {
  emit('delete', itemToDelete.value)
  showDeleteModal.value = false
  itemToDelete.value = null
}

const saveItem = () => {
  const itemToSave = JSON.parse(JSON.stringify(currentItem))

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

      currentObj[pathParts[pathParts.length - 1]] = ''
    } else {
      item[column.key] = ''
    }
  })

  return item
}
</script>