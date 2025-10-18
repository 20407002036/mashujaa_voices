import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Header from './components/layout/Header'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Story from './pages/Story'
import Gallery from './pages/Gallery'
import About from './pages/About'
import { APITestComponent } from './components/ui/APITestComponent'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <Header />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/story/:id" element={<Story />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/test" element={
              <div className="container mx-auto py-20">
                <APITestComponent />
              </div>
            } />
          </Routes>
        </motion.main>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#f97316',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App