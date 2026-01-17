import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background-dark text-white">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-primary mb-4">TravelCheck</h1>
            <p className="text-text-muted">区块链旅行打卡 DApp</p>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
