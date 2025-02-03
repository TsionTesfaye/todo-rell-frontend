<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue' 
import { useRouter } from 'vue-router' 
import { useDebounceFn } from "@vueuse/core" 
import { useToast } from '~/components/ui/toast' 
import { useSession } from "@/composables/useSession" 
import { Button } from '@/components/ui/button' 
import {DropdownMenu,  DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu' 
import AddTaskModal from '../components/addTask.vue' 
import UserModal from '~/components/userModal.vue' 
import type {TaskAdded} from '~/types/addTask' 
import type { fetchedTask } from '~/types/fetchedTask' 

// Reusable composables and utilities
const { session} = useSession() 
const { toast } = useToast() 

// State management
const sort = ref('none')  
const filter = ref('all')  
const searchQuery = ref('')  // Search query for tasks
const offset = ref(0)  // Pagination offset
const totalTask = ref(0)  // Total number of tasks
const isLoading = ref(false)  // Loading state
const tasksResult = ref<fetchedTask[]>([])  // List of tasks fetched from the backend
const userName = ref('')  // Current user's name
const taskStats = ref({ total: 0, completed: 0 })  // Task statistics
const isAddTaskModalOpen = ref(false)  // Add/edit task modal state
const isUserOpen = ref(false)  // User modal state
const editTaskId = ref(null)  // ID of the task being edited

// Debounced search function
const debouncedFn = useDebounceFn((val: string) => {
  searchQuery.value = val 
}, 1000, { maxWait: 5000 }) 

// Computed properties
const sortedTaskResult = computed(() => {
  if (!tasksResult.value) return [] 

  // Filter tasks based on the selected filter
  const filteredTasks = tasksResult.value.filter(task => {
    const today = new Date() 
    today.setHours(0, 0, 0, 0) 
    const taskDate = new Date(task.dueDate) 
    taskDate.setHours(0, 0, 0, 0) 
    switch (filter.value) {
      case 'completed':
        return task.iscomplete === 1 
      case 'past-due':
        return !task.iscomplete && taskDate < today 
      case 'all':
      default:
        return true 
    }
  }) 

  // Sort tasks based on the selected sort option
  return filteredTasks.sort((a, b) => {
    if (sort.value === 'none') return 0 

    const dateA = new Date(a.duedate).getTime() 
    const dateB = new Date(b.duedate).getTime() 

    return sort.value === 'sooner' ? dateA - dateB : dateB - dateA 
  }) 
}) 

const passTaskInfo = computed(() => {
  const task = tasksResult.value.find(task => task.id === editTaskId.value) 
  return task ? {
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.duedate,
  } : null 
}) 

// Watchers

// Lifecycle hooks


// Functions for fetching data
const fetchTasks = async (newOffset?: number) => {
  if (!session.value) {
    console.error("No active session.") 
    return 
  }

  isLoading.value = true 

  try {
    const result = await session.value.query({
      name: 'get_paginated_task',
      args: {
        title: searchQuery.value,
        pointer: newOffset !== undefined ? newOffset : offset.value,
        max: 5,
        id: session.value.account.id,
      },
    }) 
console.log(result)
    if (!result || !Array.isArray(result.tasks )) {
      console.warn("No tasks returned or invalid format.") 
      return 
    }

    if (newOffset !== undefined) {
      tasksResult.value = result.tasks 
    } else {
      const existingTaskIds = new Set(tasksResult.value.map(task => Array.from(task.id).join(","))) 
      const newTasks = result.tasks.filter(task => !existingTaskIds.has(Array.from(task.id).join(","))) 
      tasksResult.value = [...tasksResult.value, ...newTasks] 
    }
  } catch (error) {
    console.error("Failed to fetch tasks", error) 
  } finally {
    isLoading.value = false 
  }
} 

const fetchTotalTasksWithQuery = async () => {
  if (!session.value) {
    console.error("No active session.") 
    return 
  }

  try {
    const result = await session.value.query({
      name: 'get_total_tasks',
      args: {
        id: session.value.account.id,
        title: searchQuery.value,
      },
    }) 
    totalTask.value = result 
  } catch (error) {
    console.error("Failed to fetch tasks", error) 
  }
} 

const fetchTaskStat = async () => {
  if (!session.value) {
    console.error("No active session.") 
    return 
  }

  try {
    const result = await session.value.query({
      name: 'get_tasks_stat',
      args: {
        id: session.value.account.id,
      },
    }) 
    taskStats.value = result 
  } catch (error) {
    console.error("Failed to fetch task stats", error) 
  }
} 

const getUser = async () => {
  if (!session.value) {
    toast({
      title: 'Error',
      description: 'No active session',
      variant: 'destructive',
    }) 
    return 
  }

  try {
    const result = await session.value.query({
      name: 'get_user',
      args: { id: session.value.account.id },
    }) 
    userName.value = result 
  } catch (error) {
    console.error(error) 
    toast({
      title: 'Error',
      description: 'Failed to fetch user details',
      variant: 'destructive',
    }) 
  }
} 

// Task-related functions
const addTask = async (task: TaskAdded) => {
  if (!session.value) {
    toast({
      title: 'Error',
      description: 'No active session',
      variant: 'destructive',
    }) 
    return 
  }

  try {
    await session.value.call({
      name: 'create_task',
      args: [task.title, task.description, task.dueDate],
    }) 
    await fetchTasks() 
    toast({
      title: 'Success',
      description: 'Task created successfully',
    }) 
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to create task',
      variant: 'destructive',
    }) 
  }
} 

const updateTask = async (taskId: Uint8Array, updatedTask) => {
  if (!session.value) {
    toast({
      title: 'Error',
      description: 'No active session',
      variant: 'destructive',
    }) 
    return 
  }

  try {
    await session.value.call({
      name: 'edit_task',
      args: [taskId, updatedTask.title, updatedTask.description, updatedTask.dueDate],
    }) 

    const task = tasksResult.value.find(task => task.id === taskId) 
    if (task) {
      task.title = updatedTask.title 
      task.description = updatedTask.description 
      task.duedate = updatedTask.dueDate 
    }

    toast({
      title: 'Success',
      description: 'Task updated successfully',
    }) 
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update task',
      variant: 'destructive',
    }) 
  }
} 

const deleteTask = async (taskId: Uint8Array) => {
  if (!session.value) {
    toast({
      title: 'Error',
      description: 'No active session',
      variant: 'destructive',
    }) 
    return 
  }

  try {
    await session.value.call({
      name: 'delete_task',
      args: [taskId],
    }) 

    tasksResult.value = tasksResult.value.filter(task => task.id !== taskId) 
    fetchTasks() 
    fetchTotalTasksWithQuery() 
    fetchTaskStat()
    toast({
      title: 'Success',
      description: 'Task deleted successfully',
    }) 
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to delete task',
      variant: 'destructive',
    }) 
  }
} 

const completeTask = async (taskId: Uint8Array) => {
  if (!session.value) {
    toast({
      title: 'Error',
      description: 'No active session',
      variant: 'destructive',
    }) 
    return 
  }

  try {
    const task = tasksResult.value.find(task => task.id === taskId) 
    if (task) {
      task.iscomplete = task.iscomplete === 1 ? 0 : 1 
    }

    await session.value.call({
      name: 'toggle_task',
      args: [taskId],
    }) 

    toast({
      title: 'Success',
      description: 'Task status updated successfully',
    }) 
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update task status',
      variant: 'destructive',
    }) 
  }
} 

// User-related functions
const editUser = async (name: string) => {
  if (!session.value) {
    toast({
      title: 'Error',
      description: 'No active session',
      variant: 'destructive',
    }) 
    return 
  }

  try {
    await session.value.call({
      name: 'update_profile',
      args: [name],
    }) 

    userName.value = name 
    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    }) 
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update profile',
      variant: 'destructive',
    }) 
  } finally {
    isUserOpen.value = false 
  }
} 

// Modal-related functions
const editTask = (taskId: Uint8Array) => {
  editTaskId.value = taskId
  openAddTaskModal()
}
const openAddTaskModal = () => {
  isAddTaskModalOpen.value = true 
} 

const closeAddTaskModal = () => {
  isAddTaskModalOpen.value = false 
  editTaskId.value = null 
} 

const openUserModal = () => {
  isUserOpen.value = true 
} 

const closeUserModal = () => {
  isUserOpen.value = false 
} 

// Load more functionality
const loadMore = async () => {
  offset.value += 5 
  await fetchTasks() 
} 

onMounted(() => {
  if (session.value) {
    fetchTasks() 
    fetchTotalTasksWithQuery() 
    fetchTaskStat() 
    getUser() 
  }
}) 

watch(searchQuery, (value, oldValue) => {
  if (value !== oldValue) {
    offset.value = 0 
    fetchTasks(0) 
    fetchTotalTasksWithQuery() 
  }
}, { flush: "sync" }) 

watch(
  () => session.value,
  (newSession) => {
    if (newSession) {
      fetchTasks() 
      fetchTotalTasksWithQuery() 
      fetchTaskStat() 
      getUser() 
    }
  },
  { immediate: true }
) 

</script>

<template>
  <div class="bg-slate-950">
    <div v-if="isLoading">
      <LoadingSpinner />
    </div>
    <div v-else-if="!isLoading && tasksResult" class="w-full flex min-h-screen">
      <Sidebar class="hidden lg:block w-64 bg-gray-800 p-6 h-screen sticky top-0" :stats="taskStats" />
      <div class="flex-1 p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-white text-2xl font-bold">{{ userName }}'s TODO APP</h1>
          <div class="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button>
                  Sort
                  <Icon name="lucide:arrow-up-down" size="16" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="text-white bg-slate-800 w-fit">
                <DropdownMenuRadioGroup v-model="sort">
                  <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="sooner">Due Sooner</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="later">Due Later</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <button class="text-slate-400" @click="openUserModal">
              <Icon name="lucide:user" size="20" />
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative mb-6">
          <Input :model-value="searchQuery" type="text" placeholder="Search for tasks"
            @input="(n: Event) => debouncedFn((n.target as HTMLInputElement).value)"
            class="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span class="absolute inset-y-5 start-4 flex items-center justify-center px-2">
            <Icon name="lucide:search" class="-mt-1 size-5 text-white" size="20" />
          </span>
        </div>

        <!-- Tasks List -->
        <div class="mb-6 flex flex-col ">
          <TaskItem v-for="(task, index) in sortedTaskResult" :key="index" :title="task.title" :description="task.description"
            :due-date="task.duedate" :id="task.id" :isComplete="task.iscomplete" @edit="editTask(task.id)"
            @complete="completeTask(task.id)" @delete="deleteTask(task.id)" />
            <p v-if="sortedTaskResult.length === 0" class="text-white place-self-center px-7 bg-slate-800 py-3 mt-5 rounded-md">No tasks found</p>
        </div>

        <!-- Load More Button -->
        <div v-if="totalTask > offset + 5 && sortedTaskResult.length !== 0 && sortedTaskResult.length > 4"
          class="flex justify-center mt-4">
          <Button @click="loadMore" :disabled="isLoading">
            {{ isLoading ? 'Loading...' : 'Load More' }}
          </Button>
        </div>

        <!-- Tabs -->
        <div class="fixed bottom-4 left-4 right-4 lg:left-[calc(16rem+1rem)] lg:right-10 text-white">
          <div class="bg-gray-700 p-2 rounded-lg shadow-lg max-w-xl mx-auto">
            <div class="flex justify-around">
              <button @click="filter = 'all'" :class="{ 'text-blue-500 border-b-2 border-blue-500': filter === 'all' }"
                class="flex-1 px-4 py-2 text-center text-sm font-medium">
                All
              </button>
              <button @click="filter = 'completed'"
                :class="{ 'text-blue-500 border-b-2 border-blue-500': filter === 'completed' }"
                class="flex-1 px-4 py-2 text-center text-sm font-medium">
                Completed
              </button>
              <button @click="filter = 'past-due'"
                :class="{ 'text-blue-500 border-b-2 border-blue-500': filter === 'past-due' }"
                class="flex-1 px-4 py-2 text-center text-sm font-medium">
                Past Due
              </button>
            </div>
          </div>
        </div>

        <!-- Add Task Button -->
        <button class="fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white rounded-full p-4 shadow-lg"
          @click="openAddTaskModal">
          <Icon name="lucide:plus" size="24" />
        </button>
      </div>

      <!-- Add Task Modal -->
      <AddTaskModal ref="addTaskModal" @add-task="addTask" @update-task="updateTask" v-if="isAddTaskModalOpen"
        @close-modal="closeAddTaskModal" :edit-value="passTaskInfo" />

      <!-- User Modal -->
      <UserModal ref="userModal" @edit-user="editUser" v-if="isUserOpen" :name="userName"
        @close-usermodal="closeUserModal" />
    </div>
  </div>
</template>