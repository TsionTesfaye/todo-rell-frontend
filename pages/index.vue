<script setup lang="ts">
import { useToast } from '~/components/ui/toast' 


const {toast} = useToast() 
const { session, initSession } = useSession() 


const connectWallet = async () => {
  try {
    await initSession() 
    if(session.value){
      navigateTo("/todo") 
    }
  } catch (error) {
   return toast({
    title: "Error",
    description: "An error occured while connecting to your wallet",
   })
  }
} 

</script>

<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h1 class="mt-6 text-center text-4xl font-extrabold text-white">
          Welcome to TodoMaster
        </h1>
        <p class="mt-2 text-center text-xl text-gray-400">
          Your personal task management solution
        </p>
      </div>
      
      <div class="mt-8">
        <button
         @click="connectWallet"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <!-- <Wallet class="h-5 w-5 text-blue-500 group-hover:text-blue-400" aria-hidden="true" /> -->
          </span>
          Continue with Wallet
        </button>
      </div>
    </div>

   
    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    <div class="absolute bottom-0 right-0 w-1/4 h-1/4">
      <div class="w-full h-full bg-blue-500 opacity-10 transform rotate-45"></div>
    </div>
    <div class="absolute top-1/4 left-0 w-1/6 h-1/6">
      <div class="w-full h-full bg-purple-500 opacity-10 transform -rotate-12"></div>
    </div>
  </div>
</template>

<style scoped>
html, body {
  overflow-x: hidden ;
  margin: 0 ;
  padding: 0 ;
}

body {
  height: 100vh ;
}

* {
  box-sizing: border-box ;
}
</style>
