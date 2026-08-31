import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/* eslint-disable react-refresh/only-export-components */

interface CommandMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const CommandMenuContext = createContext<CommandMenuContextValue | undefined>(undefined)

interface CommandMenuProviderProps {
  children: ReactNode
}

export const CommandMenuProvider = ({ children }: CommandMenuProviderProps) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <CommandMenuContext.Provider value={{ open, setOpen, toggle: () => setOpen(p => !p) }}>
      {children}
    </CommandMenuContext.Provider>
  )
}

export const useCommandMenu = () => {
  const context = useContext(CommandMenuContext)
  if (!context) {
    throw new Error('useCommandMenu must be used within CommandMenuProvider')
  }
  return context
}
