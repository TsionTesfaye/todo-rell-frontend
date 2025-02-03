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
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useToast } from './ui/toast'
import { Proportions } from 'lucide-vue-next'

const {toast} = useToast()


const emit = defineEmits(['edit-user', 'close-usermodal'])
const props = defineProps({
  name: {
    type: String,
    required: true
  }
})


const closeModal = () => {
  emit('close-usermodal')
}



const formSchema = toTypedSchema(z.object({
 username: z.string().nonempty('Username is required'),
}))

const { handleSubmit, setFieldValue, values, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {

  },
})



onMounted(async ()=> {
 setFieldValue('username', props.name)
  
})


const submitTask = handleSubmit(() => {
 
    emit('edit-user', values.username)
 

  closeModal()
})




</script>

<template>
  <div  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-slate-800 p-6 rounded-lg w-96">
      <h2 class="text-white text-lg font-semibold mb-4">User Profile</h2>
      <form @submit.prevent="submitTask" class="flex flex-col">
        <div class="p-3 rounded-full size-20 bg-slate-600 flex items-center justify-center place-self-center"><Icon name="solar:user-linear" class="size-10 text-slate-900"/></div>
        

        <FormField v-slot="{ componentField }" name="username">
          <FormItem class="mb-4">
            <FormLabel class="block text-slate-400 text-sm mb-2">Username</FormLabel>
            <FormControl class="w-full border-0 ring-0 bg-slate-700 text-white p-2 rounded-lg focus:outline-none ">
              <Input type="text" placeholder="Enter Your username" v-bind="componentField"
                />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="flex justify-end gap-2">
          <button type="button" class="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600"
            @click="closeModal">
            Cancel
          </button>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
           Update Name
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
