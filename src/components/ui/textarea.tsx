import * as React from "react"

import { cn } from "@/lib/utils/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[#101c2d] px-3 py-2.5 text-base text-[#d7e3fb] transition-colors outline-none placeholder:text-[#c3caac] focus-visible:border-[#BFFF00] focus-visible:ring-3 focus-visible:ring-[#BFFF00]/50 disabled:cursor-not-allowed disabled:bg-[#152031] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
