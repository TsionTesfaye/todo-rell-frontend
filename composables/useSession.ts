// ~/composables/useSession.ts
import { inject } from "vue" 
import type { Ref } from "vue" 
import type { Session } from "@chromia/ft4" 

export function useSession() {
  const session = inject<Ref<Session | null>>("session") 
  const initSession = inject<() => Promise<void>>("initSession") 

  if (!session || !initSession) {
    throw new Error("useSession must be used within SessionProvider") 
  }

  return { session, initSession } 
}
