<!-- ~/components/SessionProvider.vue -->
<script setup lang="ts">
import { ref, provide, onMounted } from "vue" 
import { createClient } from "postchain-client" 
import {
  type Session,
  createKeyStoreInteractor,
  createWeb3ProviderEvmKeyStore,
  ttlLoginRule,
  days,
  createLocalStorageLoginKeyStore,
} from "@chromia/ft4" 

declare global {
  interface Window {
    ethereum?: any 
  }
}

// Store session (initially null)
const session = ref<Session | null>(null) 

// Function to initialize session (only when user connects wallet)
const initSession = async () => {
  console.log("Connecting wallet and initializing session...") 

  const client = await createClient({
    nodeUrlPool: "http://localhost:7740",
    blockchainIid: 0,
  }) 

  if (!window.ethereum) {
    console.error("MetaMask is not installed") 
    return 
  }

  const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum) 
  const evmKeyStoreInteractor = createKeyStoreInteractor(client, evmKeyStore) 
  const accounts = await evmKeyStoreInteractor.getAccounts() 

  if (accounts.length > 0) {
    const { session: newSession } = await evmKeyStoreInteractor.login({
      accountId: accounts[0].id,
      config: {
        rules: ttlLoginRule(days(10)), // Session will be valid for 10 days
        flags: ["MySession"],
      },
      loginKeyStore: createLocalStorageLoginKeyStore(), // Store session key in local storage
    }) 
    session.value = newSession 
  }

  console.log("Session initialized:", session.value) 
} 

// Function to log out
const logout = () => {
  session.value = null 
  localStorage.removeItem("sessionKey")  // Clear session key from local storage
  console.log("User logged out.") 
} 

// Restore session from local storage on mount
onMounted(async () => {
  const sessionKey = localStorage.getItem("sessionKey") 
  if (sessionKey) {
    console.log("Session key found in localStorage. Restoring session...") 

    const client = await createClient({
      nodeUrlPool: "http://localhost:7740",
      blockchainIid: 0,
    }) 

    const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum) 
    const evmKeyStoreInteractor = createKeyStoreInteractor(client, evmKeyStore) 

    try {
      const { session: restoredSession } = await evmKeyStoreInteractor.login({
        accountId: "restoredAccountId", // Use a placeholder or retrieve the account ID from storage
        config: {
          rules: ttlLoginRule(days(10)),
          flags: ["MySession"],
        },
        loginKeyStore: createLocalStorageLoginKeyStore(), // Restore session from local storage
      }) 
      session.value = restoredSession 
      console.log("Session restored:", session.value) 
    } catch (error) {
      console.error("Failed to restore session:", error) 
      localStorage.removeItem("sessionKey")  // Clear invalid session key
    }
  }
}) 

// Provide session, initSession, and logout function globally
provide("session", session) 
provide("initSession", initSession) 
provide("logout", logout) 
</script>

<template>
  <slot />
</template>