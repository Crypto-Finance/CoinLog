import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        `h-10 w-full min-w-0 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[#101c2d]
         px-3 py-2 text-base text-[#d7e3fb] transition-colors outline-none
         file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium
         file:text-[#d7e3fb] placeholder:text-[#c3caac] focus-visible:border-[#BFFF00]
         focus-visible:ring-3 focus-visible:ring-[#BFFF00]/50 disabled:pointer-events-none
         disabled:cursor-not-allowed disabled:bg-[#152031] disabled:opacity-50
         aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
         md:text-sm`,
        className
      )}
      {...props}
    />
  );
}

export { Input }
