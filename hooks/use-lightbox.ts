import { useCallback, useMemo, useState } from "react"

type LightboxSlide = {
  src: string
  alt?: string
}

type UseLightboxResult = {
  open: boolean
  index: number
  slides: LightboxSlide[]
  openAt: (nextIndex: number) => void
  close: () => void
  setIndex: (nextIndex: number) => void
}

export function useLightbox(slides: LightboxSlide[]): UseLightboxResult {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const memoSlides = useMemo(() => slides, [slides])

  const openAt = useCallback((nextIndex: number) => {
    setIndex(nextIndex)
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  return {
    open,
    index,
    slides: memoSlides,
    openAt,
    close,
    setIndex,
  }
}
