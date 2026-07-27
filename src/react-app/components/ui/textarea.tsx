import * as React from "react"

import { cn } from "@/react-app/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "bg-background border border-border resize-none rounded-xl px-3 py-3 text-base transition-colors md:text-sm placeholder:text-muted-foreground flex min-h-16 w-full outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
