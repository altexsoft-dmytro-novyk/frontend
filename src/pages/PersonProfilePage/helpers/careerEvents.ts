import {
  ArrowRightLeft,
  Award,
  Briefcase,
  Building2,
  CalendarClock,
  GraduationCap,
  LogIn,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { CareerEvent } from '@/types/domain'

const ICONS: Record<string, LucideIcon> = {
  joined_company: LogIn,
  grade_change: Award,
  position_change: Briefcase,
  department_change: Building2,
  employment_type_change: ArrowRightLeft,
  extended_leave: CalendarClock,
  mentorship_start: GraduationCap,
  mentorship_end: Users,
}

export function eventIcon(type: string): LucideIcon {
  return ICONS[type] ?? CalendarClock
}

export function eventLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/** A short human sentence from the event's `details` JSON. */
export function eventDetailText(event: CareerEvent): string | null {
  const details = event.details ?? {}
  const from = details.from
  const to = details.to
  if (from !== undefined && to !== undefined) return `${String(from)} → ${String(to)}`
  if (typeof details.title === 'string') return details.title
  const entries = Object.entries(details).filter(([, v]) => v !== null && v !== undefined)
  if (entries.length === 0) return null
  return entries.map(([k, v]) => `${k}: ${String(v)}`).join(', ')
}
