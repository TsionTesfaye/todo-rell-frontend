// ~/stores/session.ts
import { defineStore } from "pinia" 
import { ref } from "vue" 
import { createClient } from "postchain-client" 
import {
  type Session,
  createKeyStoreInteractor,
  createSingleSigAuthDescriptorRegistration,
  createWeb3ProviderEvmKeyStore,
  hours,
  registerAccount,
  registrationStrategy,
  ttlLoginRule,
} from "@chromia/ft4" 

declare global {
  interface Window {
    ethereum?: any 
  }
}

export const useSessionStore = defineStore("session", () => {
  const session = ref<Session | null>(null) 

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
          rules: ttlLoginRule(hours(2)),
          flags: ["MySession"],
        },
      }) 
      session.value = newSession 
    } else {
      const authDescriptor = createSingleSigAuthDescriptorRegistration(["A", "T"], evmKeyStore.id) 
      const { session: newSession } = await registerAccount(
        client,
        evmKeyStore,
        registrationStrategy.open(authDescriptor, {
          config: {
            rules: ttlLoginRule(hours(2)),
            flags: ["MySession"],
          },
        }),
        {
          name: "create_user",
          args: ["RandomUser_" + Math.floor(Math.random() * 1000)],
        }
      ) 
      session.value = newSession 
    }

    console.log("Session initialized:", session.value) 
  } 

  return { session, initSession } 
}) 