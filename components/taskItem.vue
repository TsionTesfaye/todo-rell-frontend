<template>
  <div class="bg-slate-800 p-4 rounded-lg mb-3">
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-3">
          <!-- Checkbox for completion status -->
          <input
            type="checkbox"
            :checked="isComplete === 1"
            @change="handleCompletion"
            class="w-4 h-4 rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
          />
          <!-- Task title with strike-through for completed tasks -->
          <h3
            class="text-white font-medium"
            :class="{ 'line-through text-slate-500': isComplete === 1 }"
          >
            {{ title }}
          </h3>
        </div>
        <!-- Task description -->
        <p class="text-slate-400 text-sm mt-1">{{ description }}</p>
        <!-- Due date -->
        <p class="text-slate-500 text-xs mt-2">Due: {{ dueDate }}</p>
      </div>
      <div class="flex gap-2">
        <!-- Edit button -->
        <button class="text-slate-400 hover:text-white" @click="$emit('edit')">
          <Icon name="lucide:edit" size="16" />
        </button>
        <!-- Delete button -->
        <button class="text-slate-400 hover:text-white" @click="$emit('delete')">
          <Icon name="lucide:trash" size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  dueDate: {
    type: String,
    required: true,
  },
  isComplete: {
    type: Number,
    required: true,
  },
}) 

const emit = defineEmits(["edit", "delete", "complete"]) 

// Handle checkbox change
const handleCompletion = (event) => {
  const isChecked = event.target.checked 
  emit("complete", isChecked)  // Emit the new completion status
} 
</script>

<style scoped>
/* Add custom styles if needed */
.line-through {
  text-decoration: line-through 
}
</style>