import { AuthProvider } from '@/contexts/AuthContext'
import { LayoutProvider } from '@/contexts/LayoutContext'
import { CommandMenuProvider } from '@/contexts/CommandMenuContext'
import { Router } from '@/router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

const App = () => {
  return (
    <div data-testid="app-container">
      <AuthProvider>
        <LayoutProvider>
          <CommandMenuProvider>
            <TooltipProvider delayDuration={200}>
              <Router />
            </TooltipProvider>
          </CommandMenuProvider>
        </LayoutProvider>
      </AuthProvider>
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
