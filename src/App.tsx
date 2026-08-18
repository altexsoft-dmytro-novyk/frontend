import { LayoutProvider } from '@/contexts/LayoutContext'
import { Router } from '@/router'

const App = () => {
  return (
    <div data-testid="app-container">
      <LayoutProvider>
        <Router />
      </LayoutProvider>
    </div>
  )
}

export default App
