import { useEffect, useRef, useState } from 'react'
import type { ImportRowError } from '@/types/api'

/**
 * `ImportResult` behaviour: move focus to the summary heading when it mounts so
 * a partial success is not missed, and offer the skipped rows as clipboard text
 * (`line<TAB>email<TAB>reason` per line) to hand back to the data owner.
 */
export const useImportResult = (errors: ImportRowError[]) => {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!copied) {
      return
    }
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copySkippedRows = async () => {
    const text = errors
      .map(rowError => `${rowError.line}\t${rowError.email ?? ''}\t${rowError.reason}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard access denied / unavailable — the table stays on screen to
      // copy by hand; no error surface for a convenience action.
    }
  }

  return { headingRef, copied, copySkippedRows }
}
