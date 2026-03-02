'use client'

import * as React from 'react'
import { Upload, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type DropzoneFile = File

type DropzoneProps = {
  value: DropzoneFile[]
  onValueChange: (files: DropzoneFile[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  disabled?: boolean
  className?: string
}

export function Dropzone({
  value,
  onValueChange,
  accept,
  multiple = true,
  maxFiles,
  disabled,
  className,
}: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const addFiles = React.useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return

      const next = [...value, ...incoming]
      const capped = typeof maxFiles === 'number' ? next.slice(0, maxFiles) : next
      onValueChange(capped)
    },
    [maxFiles, onValueChange, value]
  )

  const onDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (disabled) return

      const incoming = Array.from(e.dataTransfer.files || [])
      addFiles(incoming)
    },
    [addFiles, disabled]
  )

  return (
    <div className={cn('space-y-3', className)}>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled || undefined}
        className={cn(
          'w-full border border-[#A8D5BA] bg-white/60 p-4 transition-colors rounded-none',
          isDragging ? 'bg-white border-[#3d6c58]' : 'hover:bg-white',
          disabled && 'opacity-60 pointer-events-none'
        )}
        onDragEnter={(e) => {
          e.preventDefault()
          if (disabled) return
          setIsDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (disabled) return
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          if (disabled) return
          setIsDragging(false)
        }}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <Upload className="h-5 w-5 text-[#3d6c58]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-[#3d6c58]">
              Drag & drop files here, or click to upload
            </div>
            <div className="text-xs text-[#4a6741]">
              {accept ? `Accepted: ${accept}` : 'Images or documents'}
              {typeof maxFiles === 'number' ? ` • Max ${maxFiles} file${maxFiles === 1 ? '' : 's'}` : ''}
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            const incoming = Array.from(e.target.files || [])
            addFiles(incoming)
            // allow selecting the same file again
            e.currentTarget.value = ''
          }}
        />
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, idx) => (
            <div
              key={`${file.name}-${file.size}-${idx}`}
              className="flex items-center justify-between gap-2 border border-[#A8D5BA] bg-white/60 px-3 py-2 rounded-none"
            >
              <div className="min-w-0">
                <div className="text-sm text-[#1f3f2c] truncate">{file.name}</div>
                <div className="text-xs text-[#4a6741]">{Math.ceil(file.size / 1024)} KB</div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#A8D5BA] bg-white hover:bg-white rounded-none"
                onClick={() => {
                  const next = value.filter((_, i) => i !== idx)
                  onValueChange(next)
                }}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4 text-[#3d6c58]" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
