"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-[#BFFF00]" />
        ),
        info: (
          <InfoIcon className="size-4 text-[#87CEEB]" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-[#FFD1DC]" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-[#ffb4ab]" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-[#BFFF00]" />
        ),
      }}
      style={
        {
          "--normal-bg": "#152031",
          "--normal-text": "#d7e3fb",
          "--normal-border": "rgba(255,255,255,0.1)",
          "--border-radius": "24px",
          "--success-bg": "#152031",
          "--success-text": "#d7e3fb",
          "--success-border": "rgba(255,255,255,0.1)",
          "--error-bg": "#152031",
          "--error-text": "#d7e3fb",
          "--error-border": "rgba(255,255,255,0.1)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group-[.toaster]:border-[rgba(255,255,255,0.1)] group-[.toaster]:bg-[#152031] group-[.toaster]:text-[#d7e3fb] group-[.toaster]:rounded-[24px] group-[.toaster]:shadow-none",
          description: "group-[.toast]:text-[#c3caac]",
          actionButton: "group-[.toast]:bg-[#BFFF00] group-[.toast]:text-[#081425] group-[.toast]:font-bold group-[.toast]:rounded-full",
          cancelButton: "group-[.toast]:bg-transparent group-[.toast]:border-[#BFFF00] group-[.toast]:text-[#BFFF00] group-[.toast]:font-bold group-[.toast]:rounded-full",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
