import { motion } from 'framer-motion'
import { Upload, Volume2 } from 'lucide-react'
import { Link } from 'react-router-dom'
// import { Button } from '../components/ui/Button'
import { useFeaturedStories } from '../hooks/useStoryData'
import { StoriesLoading, StoriesError } from '../components/ui/StoriesComponents'

const Home = () => {
  const { stories: featuredStories, isLoading, error } = useFeaturedStories();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Section - matching mockup exactly */}
      <section className="relative py-24 md:py-32 lg:py-40 text-center text-white overflow-hidden">
        <div className="absolute inset-0 kenyan-flag-gradient animate-flagWave opacity-20 dark:opacity-10"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative container mx-auto px-6 flex flex-col items-center gap-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-black tracking-tighter leading-tight drop-shadow-lg"
          >
            Where Kenya's Past Speaks Again
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl text-lg md:text-xl text-white/80 drop-shadow-sm"
          >
            Upload a historical image. Let AI narrate its story.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-4 mt-4"
          >
            <Link to="/upload">
              <button className="flex items-center gap-2 justify-center h-12 px-6 bg-primary text-white rounded-lg text-base font-bold shadow-xl shadow-primary/40 hover:bg-primary/90 transition-all transform hover:scale-105">
                <Upload className="w-5 h-5" />
                <span>Upload Image</span>
              </button>
            </Link>
            
            <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
              <Volume2 className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Explore Archives Section - matching mockup */}
      <section className="py-16 sm:py-24 bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center mb-12"
          >
            <h3 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark">
              Explore the Archives
            </h3>
            <p className="mt-2 max-w-2xl text-text-muted-light dark:text-text-muted-dark">
              Click on an image to hear its story, brought to life.
            </p>
          </motion.div>

          {/* Horizontal Scrolling Cards */}
          <div className="relative">
            {isLoading ? (
              <StoriesLoading message="Loading featured stories..." />
            ) : error ? (
              <StoriesError error={error} />
            ) : (
              <div className="overflow-x-auto pb-8 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
                <div className="flex gap-6">
                  {featuredStories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="snap-center flex-shrink-0 w-[280px] group"
                  >
                    <Link to={`/story/${story.id}`} className="block">
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl bg-gradient-to-br from-primary/20 to-accent-gold/20">
                        {/* Actual image or placeholder */}
                        {story.imageUrl ? (
                          <img 
                            src={story.imageUrl} 
                            alt={story.imageDescription} 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center p-6">
                              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                                <Volume2 className="w-8 h-8 text-primary" />
                              </div>
                              <p className="text-sm text-text-light dark:text-text-dark font-medium">
                                Cultural Story
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                          <p className="font-bold text-lg">{story.title}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home