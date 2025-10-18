import { Link } from 'react-router-dom'
import { Headphones, Mail, MapPin, Github, Twitter, Facebook } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Github, href: '#', label: 'GitHub' },
  ]

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Upload Story', href: '/upload' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About', href: '/about' },
  ]

  return (
    <footer className="bg-kenyan-black text-kenyan-cream">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-kenyan-red rounded-lg">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Mashujaa Voices</h3>
                <p className="text-sm text-kenyan-cream/80">AI Heritage Stories</p>
              </div>
            </div>
            <p className="text-kenyan-cream/80 text-sm">
              Preserving and sharing Kenya's rich cultural heritage through AI-powered storytelling.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-kenyan-gold">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-kenyan-cream/80 hover:text-kenyan-gold transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cultural Heritage */}
          <div className="space-y-4">
            <h4 className="font-semibold text-kenyan-gold">Our Heritage</h4>
            <ul className="space-y-2 text-sm text-kenyan-cream/80">
              <li>Kikuyu Stories</li>
              <li>Luo Traditions</li>
              <li>Maasai Culture</li>
              <li>Kalenjin Heritage</li>
              <li>Coastal Narratives</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="font-semibold text-kenyan-gold">Connect</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-kenyan-cream/80">
                <Mail className="w-4 h-4" />
                info@mashujaavoices.ke
              </div>
              <div className="flex items-center gap-2 text-sm text-kenyan-cream/80">
                <MapPin className="w-4 h-4" />
                Nairobi, Kenya
              </div>
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      className="p-2 bg-kenyan-cream/10 hover:bg-kenyan-red rounded-lg transition-all duration-200 hover:scale-110"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-kenyan-cream/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-kenyan-cream/60">
              © {currentYear} Mashujaa Voices. Preserving Kenyan heritage with pride.
            </p>
            <div className="flex items-center gap-6 text-sm text-kenyan-cream/60">
              <a href="#" className="hover:text-kenyan-gold transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-kenyan-gold transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-kenyan-gold transition-colors">
                Code of Conduct
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer