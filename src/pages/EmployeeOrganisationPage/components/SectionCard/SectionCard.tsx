import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  /** Right-aligned header slot (an action button). */
  action?: ReactNode
  children: ReactNode
  testId?: string
}

/** The shared card shell for the three Organisation-screen sections. */
export const SectionCard = ({ title, action, children, testId }: SectionCardProps) => (
  <section className="rounded-lg border border-border bg-card p-4 sm:p-5" data-testid={testId}>
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {action}
    </div>
    <div className="mt-3">{children}</div>
  </section>
)
