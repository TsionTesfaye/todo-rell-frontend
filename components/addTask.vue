<script setup>
import { ref } from 'vue'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from "@/lib/utils"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { toDate } from 'radix-vue/date'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

const isOpen = ref(false)
const value = ref('')
const placeholder = ref()
const newTask = ref({
  title: '',
  description: '',
  dueDate: ''
})

const props = defineProps({
  editValue: {
   id: {type: Uint8Array},
  title: {type: String},
  description: {type: String},
  dueDate: {type: String},
  }
  
})

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})
const emit = defineEmits(['add-task', 'close-modal', 'update-task'])



const closeModal = () => {
  emit('close-modal')
}



const formSchema = toTypedSchema(z.object({
  title: z.string({ required_error: 'Title is required' }).nonempty('Title is required'),
  description: z.string({ required_error: 'Description is required' }).nonempty('Description is required'),
  date: z
    .string({ required_error: 'Due date is required' })
    .refine(v => v, { message: 'kkk' }),
}))
const { handleSubmit, setFieldValue, values, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {

  },
})

function populateValues(){
  setValues({
    title: props.editValue.title,
    date: props.editValue.dueDate,
    description: props.editValue.description,

  })
  console.log(values)
}

onMounted(()=> {
  if(props.editValue){
  populateValues()
  }
})
const passValues = computed(() => ({
  taskValues: {
    title: values.title,
    description: values.description,
    dueDate: values.date
  }
}))

const submitTask = handleSubmit(() => {
  if(props.editValue){
    emit('update-task', props.editValue.id, passValues.value.taskValues)
  }
  else{
  emit('add-task', passValues.value.taskValues)
  }

  closeModal()
})




</script>

<template>
  <div  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-slate-800 p-6 rounded-lg w-96">
      <h2 class="text-white text-lg font-semibold mb-4"><span v-if="!props.editValue">Add New Task</span> <span v-else>Update your task</span></h2>
      <form @submit.prevent="submitTask">

        <FormField v-slot="{ componentField }" name="title">
          <FormItem class="mb-4">
            <FormLabel class="block text-slate-400 text-sm mb-2">Title</FormLabel>
            <FormControl class="w-full border-0 ring-0 bg-slate-700 text-white p-2 rounded-lg focus:outline-none ">
              <Input type="text" placeholder="Enter the title of task" v-bind="componentField"
                />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem class="mb-4">
            <FormLabel class="block text-slate-400 text-sm mb-2">Description</FormLabel>
            <FormControl class="w-full border-0 ring-0 bg-slate-700 text-white p-2 rounded-lg focus:outline-none ">
              <Textarea placeholder="Task description" v-bind="componentField"  />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField name="date">
          <FormItem class="flex flex-col mb-4">
            <FormLabel class="block text-slate-400 text-sm mb-2">Select due date</FormLabel>
            <Popover>
              <PopoverTrigger as-child>
                <FormControl class="w-full border-0 ring-0 bg-slate-700 text-white p-2 rounded-lg focus:outline-none ">
                  <Button variant="outline" :class="cn(
                    'w-full ps-3 text-start font-normal',
                    !values.date && 'text-muted-foreground',
                  )">
                    <span class="text-slate-400">{{ values.date ? df.format(toDate(parseDate(values.date))) : "Pick  a date"
                      }}</span>
                    <CalendarIcon class="ms-auto h-4 w-4 opacity-50" />
                  </Button>
                  <input hidden>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar calendar-label="Due date" initial-focus :min-value="today(getLocalTimeZone())"
                  @update:model-value="(v) => {
                    if (v) {
                      setFieldValue('date', v.toString())
                    }
                    else {
                      setFieldValue('date', undefined)
                    }

                  }" />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </FormField>


        <div class="flex justify-end gap-2">
          <button type="button" class="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600"
            @click="closeModal">
            Cancel
          </button>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <span v-if="!props.editValue">Add Task</span><span v-else>Update Task</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
