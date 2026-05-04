import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/utils"

const buttonVariants = cva(
  `group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding
   text-sm font-bold whitespace-nowrap transition-all outline-none select-none
   focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50
   active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50
   aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
   dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40
   [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-[2px] border-primary bg-transparent text-foreground hover:bg-primary/10",
        secondary:
          "border-[2px] border-primary bg-transparent text-foreground hover:bg-primary/10",
        ghost:
          "bg-transparent text-foreground hover:bg-accent",
        destructive:
          "bg-[#ffb4ab] text-[#690005] hover:bg-[#ffb4ab]/90",
        link: "text-primary underline-offset-4 hover:underline",
        neon: "bg-[#BFFF00] text-[#081425] hover:bg-[#BFFF00]/90",
        "neon-outline": "border-[rgba(255,255,255,0.2)] text-[#d7e3fb] hover:bg-[#1f2a3c] hover:text-[#BFFF00]",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: `h-7 gap-1 rounded-full px-3 text-xs
          in-data-[slot=button-group]:rounded-full
          has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2
          [&_svg:not([class*='size-'])]:size-3`,
        sm: `h-8 gap-1 rounded-full px-3.5 text-[0.8rem]
          in-data-[slot=button-group]:rounded-full
          has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5
          [&_svg:not([class*='size-'])]:size-3.5`,
        lg: "h-11 gap-1.5 px-5 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-full in-data-[slot=button-group]:rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-full in-data-[slot=button-group]:rounded-full",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
