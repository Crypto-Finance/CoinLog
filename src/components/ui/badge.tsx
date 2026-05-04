import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/utils"

const badgeVariants = cva(
  `group/badge inline-flex h-6 shrink-0 items-center justify-center gap-1 overflow-hidden
   rounded-full border border-transparent px-2.5 py-0.5 text-xs font-bold whitespace-nowrap
   transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
   has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive
   aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
   [&>svg]:pointer-events-none [&>svg]:size-3!`,
  {
    variants: {
      variant: {
        default: "bg-[#BFFF00] text-[#081425] hover:bg-[#BFFF00]/90",
        secondary:
          "border-[2px] border-[#BFFF00] bg-transparent text-[#d7e3fb] hover:bg-[#BFFF00]/10",
        destructive:
          `bg-[#ffb4ab] text-[#690005] focus-visible:ring-destructive/20
           dark:focus-visible:ring-destructive/40 hover:bg-[#ffb4ab]/90`,
        outline:
          "border-[1px] border-[rgba(255,255,255,0.1)] text-[#d7e3fb] hover:bg-[#1f2a3c]",
        "neon-outline":
          "border-[rgba(255,255,255,0.2)] text-[#d7e3fb] bg-transparent hover:bg-[#1f2a3c] hover:text-[#BFFF00]",
        ghost:
          "text-[#d7e3fb] hover:bg-[#1f2a3c]",
        link: "text-[#BFFF00] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
