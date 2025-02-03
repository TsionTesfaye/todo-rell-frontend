<!-- ~/components/AppInitializer.vue -->
<script setup lang="ts">
import { useSession } from "~/composables/useSession" 
import { useRouter } from "vue-router" 

const { session } = useSession() 
const router = useRouter() 

// Redirect based on session
if (!session.value) {
  router.push("/")  // No session, redirect to login
} else {
  router.push("/todo")  // Session exists, redirect to todo
}
</script>

<template>
  <div></div>
</template>