import type { SectionKey, SectionLevel } from '@/types/domain'

export interface SectionGate {
  /** Render the panel at all (`false` → the viewer has no access to this section). */
  visible: boolean
  /**
   * Show the edit / add affordance. `undefined` means "unknown — show it
   * optimistically and fall back to handling a 403" (an older backend that
   * doesn't send the access map).
   */
  canWrite: boolean | undefined
}

/** Resolves a section's gate from the profile's `access` map (§3.3.5). */
export function sectionGate(
  access: Record<SectionKey, SectionLevel> | undefined,
  key: SectionKey
): SectionGate {
  if (!access) return { visible: true, canWrite: undefined }
  const level = access[key]
  return { visible: level !== 'none', canWrite: level === 'write' }
}
