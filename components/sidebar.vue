<script setup lang="ts">

interface Stats {
  total: number 
  completed: number 
 
}

const props = defineProps<{ stats: Stats }>() 
</script>


<template>
  <div class="w-64 bg-slate-900 p-6 h-screen">
    <div class="text-gray-300 mb-8">
      <h2 class="text-lg font-semibold mb-4">Task Overview</h2>
      <div class="space-y-3">
        <div class="flex justify-between">
          <span>Total Tasks</span>
          <span class="text-white">{{ props.stats.total}}</span>
        </div>
        <div class="flex justify-between">
          <span>Completed</span>
          <span class="text-green-500">{{ props.stats.completed }}</span>
        </div>
       
       
      </div>
    </div>
  </div>
</template>

