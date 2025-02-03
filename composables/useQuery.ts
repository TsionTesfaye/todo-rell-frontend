import { computed, inject, ref, watch } from "vue" 
import type { RawGtv, DictPair } from "postchain-client" 
import type { Session } from "@chromia/ft4" 

// This function assumes that session.value is a properly typed Session instance
export function useQuery<TReturn extends RawGtv, TArgs extends DictPair | undefined = DictPair>(
  name: string,
  args?: TArgs
) {
  const session = inject<Session | null>("session")  // Inject the session
  if (!session) {
    throw new Error("SessionProvider is missing! Wrap your app with <SessionProvider>.") 
  }

  const serializedArgs = ref(JSON.stringify(args))  // Store serialized arguments
  const data = ref<TReturn | undefined>() 

  // Function to send the query
  const sendQuery = async () => {
    if (!session || !args) return 
    try {
      // Ensure session.query is called with the correct generic type
      const response = await session.query<TReturn>({ name, args }) as TReturn  // Type the response explicitly
      serializedArgs.value = JSON.stringify(args) 
      data.value = response 
    } catch (error) {
      console.error("Query failed:", error) 
    }
  } 

  // Re-run the query if session, query name, or arguments change
  watch([session, () => name, serializedArgs], async () => {
    await sendQuery() 
  }, { immediate: true }) 

  return {
    result: computed(() => data.value),
    reload: sendQuery,
  } 
}
