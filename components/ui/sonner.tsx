"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <>
      <style jsx global>{`
        [data-sonner-toast] [data-description] {
          color: #4e816b !important;
        }
        [data-sonner-toast][data-type="success"] [data-description] {
          color: #4e816b !important;
        }
        [data-sonner-toast][data-type="error"] [data-description] {
          color: #ef4444 !important;
        }
        [data-sonner-toast][data-type="info"] [data-description] {
          color: #3b82f6 !important;
        }
        [data-sonner-toast] button[data-close-button] {
          background: white !important;
          color: #4e816b !important;
          border: 2px solid #4e816b !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
        }
        [data-sonner-toast] button[data-close-button]:hover {
          background: #4e816b !important;
          color: white !important;
        }
        [data-sonner-toast] button[data-close-button] svg {
          width: 14px !important;
          height: 14px !important;
        }
      `}</style>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        closeButton
        richColors
        expand
        duration={5000}
        icons={{
          success: <CircleCheckIcon className="size-4 text-[#4e816b]" />,
          info: <InfoIcon className="size-4 text-blue-600" />,
          warning: <TriangleAlertIcon className="size-4 text-yellow-600" />,
          error: <OctagonXIcon className="size-4 text-red-600" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
        }}
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #156844',
            borderRadius: '0px',
            color: '#156844',
          },
          classNames: {
            toast: 'bg-white border border-[#4e816b] rounded-none',
            success: 'border-[#4e816b] text-[#4e816b]',
            error: 'border-red-500 text-red-500',
            info: 'border-blue-500 text-blue-500',
          },
        }}
        {...props}
      />
    </>
  )
}

export { Toaster }
