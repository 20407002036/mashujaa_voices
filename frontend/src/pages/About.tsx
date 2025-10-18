import { motion } from 'framer-motion'
import { Heart, Users, Globe, Zap, Shield, Award } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Narration',
      description: 'Advanced AI technology creates authentic voice narrations in Swahili and English, bringing your heritage photos to life with culturally appropriate storytelling.'
    },
    {
      icon: Heart,
      title: 'Cultural Preservation',
      description: 'We are committed to preserving Kenya\'s rich cultural heritage for future generations through digital storytelling and community engagement.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by Kenyans for Kenyans, our platform celebrates the diversity of our 42+ tribes and their unique traditions, customs, and stories.'
    },
    {
      icon: Globe,
      title: 'Global Accessibility',
      description: 'Share Kenya\'s cultural wealth with the world while maintaining authenticity and respect for traditional knowledge and customs.'
    },
    {
      icon: Shield,
      title: 'Cultural Respect',
      description: 'We prioritize cultural sensitivity and work with community elders and cultural experts to ensure accurate representation.'
    },
    {
      icon: Award,
      title: 'Quality Content',
      description: 'Every story is reviewed for cultural accuracy and respect, ensuring high-quality content that honors our heritage.'
    }
  ]

  const stats = [
    { number: '42+', label: 'Kenyan Tribes', description: 'Represented on our platform' },
    { number: '500+', label: 'Stories Shared', description: 'And growing every day' },
    { number: '10K+', label: 'Community Members', description: 'Preserving heritage together' },
    { number: '95%', label: 'Cultural Accuracy', description: 'Verified by cultural experts' }
  ]

  const team = [
    {
      name: 'Dr. Wanjiku Mwangi',
      role: 'Cultural Heritage Expert',
      tribe: 'Kikuyu',
      bio: 'PhD in African Cultural Studies, specializing in oral traditions and digital preservation.'
    },
    {
      name: 'James Kiplagat',
      role: 'AI Technology Lead',
      tribe: 'Kalenjin',
      bio: 'Machine Learning engineer with expertise in natural language processing and voice synthesis.'
    },
    {
      name: 'Amina Hassan',
      role: 'Community Outreach Director',
      tribe: 'Swahili',
      bio: 'Cultural anthropologist focused on coastal communities and traditional knowledge systems.'
    },
    {
      name: 'Samuel Maina',
      role: 'Product Manager',
      tribe: 'Luo',
      bio: 'Tech entrepreneur passionate about using technology to preserve African heritage.'
    }
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-kenyan-black dark:text-kenyan-cream">
            Preserving Kenya's Heritage Through
            <span className="text-kenyan-red"> Technology</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Mashujaa Voices is an AI-powered platform that transforms your heritage photos into 
            engaging audio stories, preserving Kenya's rich cultural diversity for future generations.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="bg-gradient-to-r from-kenyan-red to-kenyan-green text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-white/90 max-w-4xl mx-auto">
              To bridge the gap between traditional storytelling and modern technology, ensuring that 
              Kenya's cultural heritage is preserved, celebrated, and accessible to current and future 
              generations worldwide.
            </p>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-kenyan-black dark:text-kenyan-cream">
              What Makes Us Special
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Combining cutting-edge AI technology with deep cultural knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card text-center"
                >
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-kenyan-red/10 rounded-full">
                      <Icon className="w-8 h-8 text-kenyan-red" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-kenyan-black dark:text-kenyan-cream">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="bg-kenyan-black text-kenyan-cream rounded-2xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
              <p className="text-lg text-kenyan-cream/80 max-w-2xl mx-auto">
                Growing community of heritage preservationists
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-kenyan-gold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-kenyan-cream/80">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-kenyan-black dark:text-kenyan-cream">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Passionate Kenyans dedicated to preserving our cultural heritage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-kenyan-red to-kenyan-green rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-lg font-semibold mb-1 text-kenyan-black dark:text-kenyan-cream">
                  {member.name}
                </h3>
                <p className="text-kenyan-red font-medium mb-1">{member.role}</p>
                <p className="text-sm text-kenyan-gold mb-3">{member.tribe} Heritage</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Vision Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-kenyan-black dark:text-kenyan-cream">
              Our Vision for the Future
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              We envision a world where every cultural story is preserved, where traditional knowledge 
              is celebrated, and where technology serves as a bridge between past and future. Through 
              Mashujaa Voices, we're creating a digital archive of Kenya's soul, ensuring that our 
              children and their children will know where they come from.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-kenyan-red/10 rounded-full text-kenyan-red font-medium">
              <Heart className="w-5 h-5" />
              Made with love in Kenya
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default About