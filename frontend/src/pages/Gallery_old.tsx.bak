// @ts-nocheck
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Play, Heart, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useStoriesStore } from '../store/uploadFlowStore'

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const { stories } = useStoriesStore()

  // Filter stories based on search term
  const filteredStories = stories.filter(story => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.story.toLowerCase().includes(searchTerm.toLowerCase())
  )
      likes: 89,
      views: 890,
      uploadedBy: 'John Mwangi'
    },
    {
      id: '3',
      title: 'Luo Fishing Traditions',
      tribe: 'Luo',
      location: 'Lake Victoria',
      imageUrl: '/api/placeholder/400/300',
      duration: '4:12',
      likes: 156,
      views: 1560,
      uploadedBy: 'Grace Ochieng'
    },
    {
      id: '4',
      title: 'Kalenjin Running Culture',
      tribe: 'Kalenjin',
      location: 'Rift Valley',
      imageUrl: '/api/placeholder/400/300',
      duration: '3:20',
      likes: 203,
      views: 2030,
      uploadedBy: 'Peter Kipchoge'
    },
    {
      id: '5',
      title: 'Coastal Dhow Building',
      tribe: 'Swahili',
      location: 'Lamu Island',
      imageUrl: '/api/placeholder/400/300',
      duration: '5:15',
      likes: 87,
      views: 870,
      uploadedBy: 'Amina Mohammed'
    },
    {
      id: '6',
      title: 'Turkana Beadwork',
      tribe: 'Turkana',
      location: 'Northern Kenya',
      imageUrl: '/api/placeholder/400/300',
      duration: '2:45',
      likes: 112,
      views: 1120,
      uploadedBy: 'Mary Ekiru'
    }
  ]

  const tribes = ['all', 'Kikuyu', 'Luo', 'Maasai', 'Kalenjin', 'Turkana', 'Swahili']

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.tribe.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || story.tribe === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-kenyan-black dark:text-kenyan-cream">
              Heritage Stories Gallery
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover the rich cultural heritage of Kenya through AI-narrated stories
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stories, tribes, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-kenyan-black dark:text-kenyan-cream focus:ring-2 focus:ring-kenyan-red focus:border-transparent"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-kenyan-black dark:text-kenyan-cream px-4 py-3 pr-10 rounded-lg focus:ring-2 focus:ring-kenyan-red focus:border-transparent"
              >
                {tribes.map(tribe => (
                  <option key={tribe} value={tribe}>
                    {tribe === 'all' ? 'All Tribes' : tribe}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <span className="text-2xl font-bold text-kenyan-red">{filteredStories.length}</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">
                {filteredStories.length === 1 ? 'story' : 'stories'} found
              </span>
            </div>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="gallery-card group"
              >
                <Link to={`/story/${story.id}`}>
                  <div className="relative">
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Overlay */}
                    <div className="carousel-overlay">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {story.duration}
                    </div>

                    {/* Tribe Badge */}
                    <div className="absolute top-3 left-3 bg-kenyan-red text-white px-2 py-1 rounded text-sm font-medium">
                      {story.tribe}
                    </div>
                  </div>
                </Link>

                {/* Story Info */}
                <div className="p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-semibold text-lg mb-2 text-kenyan-black dark:text-kenyan-cream group-hover:text-kenyan-red transition-colors">
                    <Link to={`/story/${story.id}`}>
                      {story.title}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    📍 {story.location}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>By {story.uploadedBy}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {story.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {story.views}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          {filteredStories.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="secondary" size="lg">
                Load More Stories
              </Button>
            </div>
          )}

          {/* No Results */}
          {filteredStories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-kenyan-black dark:text-kenyan-cream">
                No stories found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search terms or filters
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Gallery