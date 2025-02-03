<script setup lang="ts">
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

const props = withDefaults(defineProps<SpinnerProps>(), {
  variant: "inline",
  size: "md",
  color: "gray",
})
const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-8",
      lg: "size-16",
      xl: "size-24",
    },
    color: {
      primary: "text-primary-500",
      black: "text-black",
      gray: "text-gray-300",
      secondary: "text-secondary-foreground",
    },
    variant: {
      block: "block w-full",
      inline: "inline-block",
    },
  },
})
type SpinnerProps = {
  variant?: NonNullable<Parameters<typeof spinnerVariants>[0]>["variant"]
  size?: NonNullable<Parameters<typeof spinnerVariants>[0]>["size"]
  color?: NonNullable<Parameters<typeof spinnerVariants>[0]>["color"]
}
</script>

<template>
  <Suspense>
    <Icon name="i-mdi-loading" :dynamic="false" :class="cn(spinnerVariants(props), $attrs.class ?? '')" />
    <template #fallback>
      <span :class="cn(spinnerVariants(props), $attrs.class ?? '')">Loading...</span>
    </template>
  </Suspense>
</template>
