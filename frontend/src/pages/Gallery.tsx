import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Play, Calendar, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useStoriesStore } from '../store/uploadFlowStore'
import { useStoriesApi } from '../hooks/useStoriesApi'
import { StoriesLoading, StoriesError } from '../components/ui/StoriesComponents'

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { stories: userStories } = useStoriesStore()
  const { stories: apiStories, isLoading, error } = useStoriesApi()

  // Combine API stories with user stories (excluding sample stories from user storage)
  const allStories = [
    ...apiStories,
    ...userStories.filter(story => !story.id.startsWith('sample-'))
  ]

  // Filter stories based on search term
  const filteredStories = allStories.filter(story => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.story.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-text-light dark:text-text-dark mb-4"
          >
            Stories Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-subtle-light dark:text-subtle-dark max-w-2xl mx-auto"
          >
            Discover the rich tapestry of Kenyan heritage through AI-generated stories from your community
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle-light dark:text-subtle-dark w-5 h-5" />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-subtle-light/50 dark:border-subtle-dark/50 bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Stories Grid */}
        {isLoading ? (
          <StoriesLoading message="Loading stories gallery..." />
        ) : error ? (
          <StoriesError error={error} />
        ) : filteredStories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FileText className="w-16 h-16 text-subtle-light dark:text-subtle-dark mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
              {allStories.length === 0 ? 'No stories yet' : 'No stories found'}
            </h3>
            <p className="text-subtle-light dark:text-subtle-dark mb-6">
              {allStories.length === 0 
                ? 'Upload your first image to create a Kenyan heritage story!' 
                : 'Try adjusting your search terms'
              }
            </p>
            {allStories.length === 0 && (
              <Link to="/upload">
                <Button className="inline-flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Create Your First Story
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-soft overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Story Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-subtle-light/30 to-subtle-dark/30 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-subtle-light dark:text-subtle-dark" />
                </div>

                {/* Story Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  
                  <p className="text-subtle-light dark:text-subtle-dark text-sm mb-3 line-clamp-3">
                    {story.story.substring(0, 150)}...
                  </p>

                  <div className="flex items-center justify-between text-sm text-subtle-light dark:text-subtle-dark mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(story.createdAt).toLocaleDateString()}
                    </div>
                    {story.audioUrl && (
                      <div className="flex items-center">
                        <Play className="w-4 h-4 mr-1" />
                        Audio
                      </div>
                    )}
                  </div>

                  {/* Cultural Themes */}
                  {story.culturalThemes && story.culturalThemes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {story.culturalThemes.slice(0, 3).map((theme, themeIndex) => (
                        <span
                          key={themeIndex}
                          className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs rounded-full"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <Link to={`/story/${story.id}`} className="block">
                    <Button className="w-full">
                      Read Story
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {allStories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <h3 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
              Have more stories to share?
            </h3>
            <p className="text-subtle-light dark:text-subtle-dark mb-6">
              Upload another image and let AI discover the hidden heritage within
            </p>
            <Link to="/upload">
              <Button className="inline-flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Create Another Story
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Gallery