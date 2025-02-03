<!-- ~/App.vue -->
<script setup lang="ts">
import SessionProvider from "~/components/sessionProvider.vue" 
import AppInitializer from "~/components/appInitializer.vue" 
import Toaster from "./components/ui/toast/Toaster.vue" 


</script>

<template>
  <SessionProvider>
    <AppInitializer />
    <Toaster />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </SessionProvider>
</template>