import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Stories', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ]

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo - matching mockup exactly */}
          <Link to="/" className="flex items-center gap-3">
            <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
            <h2 className="text-xl font-bold tracking-tight text-text-light dark:text-text-dark">
              Mashujaa Voices
            </h2>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isActive ? 'text-primary' : 'text-text-light dark:text-text-dark'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Upload Button & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link to="/upload">
              <button className="flex items-center justify-center min-w-[120px] h-10 px-4 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all transform hover:scale-105">
                <span>Upload Image</span>
              </button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg bg-surface-light dark:bg-surface-dark"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? 'auto' : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block p-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </motion.div>
      </div>
    </header>
  )
}

export default Header