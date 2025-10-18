"""
Sample/Dummy data for Mashujaa Voices
Kenyan Heritage Stories for carousel and demo purposes
"""

from typing import List, Dict, Optional
from datetime import datetime

class MashujaaStory:
    """Story data structure matching frontend MashujaaStory interface"""
    
    def __init__(
        self,
        id: str,
        title: str,
        story: str,
        image_description: str,
        image_url: Optional[str] = None,
        image_filename: Optional[str] = None,
        audio_url: Optional[str] = None,
        audio_format: Optional[str] = None,
        audio_filename: Optional[str] = None,
        created_at: str = None,
        cultural_themes: Optional[List[str]] = None
    ):
        self.id = id
        self.title = title
        self.story = story
        self.image_description = image_description
        self.image_url = image_url
        self.image_filename = image_filename
        self.audio_url = audio_url
        self.audio_format = audio_format
        self.audio_filename = audio_filename
        self.created_at = created_at or datetime.now().isoformat()
        self.cultural_themes = cultural_themes or []
    
    def to_dict(self) -> Dict:
        """Convert story to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'story': self.story,
            'imageDescription': self.image_description,
            'imageUrl': self.image_url,
            'imageFilename': self.image_filename,
            'audioUrl': self.audio_url,
            'audioFormat': self.audio_format,
            'audioFileName': self.audio_filename,
            'createdAt': self.created_at,
            'culturalThemes': self.cultural_themes
        }

# Sample Stories Data
SAMPLE_STORIES = [
    MashujaaStory(
        id='sample-dedan-kimathi',
        title='Dedan Kimathi: The Forest Fighter',
        story="""In the heart of Kenya's struggle for freedom, a leader emerged whose name would echo through the hills and valleys: Dedan Kimathi. Born in the Nyeri district, Kimathi's early life was marked by a thirst for knowledge and a deep-seated resentment against colonial rule.

He joined the Kenya Land and Freedom Army (Mau Mau), quickly rising through the ranks due to his strategic brilliance and unwavering courage. Kimathi's leadership was characterized by his ability to unite diverse groups under a common cause, fostering a sense of shared identity and purpose among the freedom fighters.

His capture in 1956 marked a turning point in the struggle, but his spirit of resistance continued to inspire generations. Kimathi's legacy is a testament to the power of resilience, leadership, and the unwavering pursuit of freedom.""",
        image_description='A powerful portrait of Dedan Kimathi in military uniform, standing proudly in the Kenyan forest with determination in his eyes.',
        image_url='/DedanKimathi.jpg',
        audio_url='/api/audio/speech_20251018_120015_kore.wav',
        audio_format='audio/wav',
        created_at='2024-10-14T10:30:00Z',
        cultural_themes=['Freedom Fighter', 'Mau Mau', 'Independence', 'Leadership', 'Kikuyu Heritage']
    ),
    
    MashujaaStory(
        id='sample-maasai-ceremony',
        title='The Sacred Maasai Coming of Age',
        story="""Under the vast African sky, young Maasai warriors gather for the ancient rite of passage that will transform them from boys to men. The ceremony begins before dawn, as elders paint intricate patterns on their bodies using ochre and clay.

The sound of traditional songs fills the air as families from across the region arrive, bringing cattle and gifts to honor this sacred transition. The young men, adorned in traditional red shukas, demonstrate their courage through ceremonial dances and tests of strength.

This ritual, passed down through countless generations, represents not just individual growth, but the continuity of Maasai culture. It is a celebration of community, tradition, and the unbreakable bonds that connect the Maasai people to their ancestral land.""",
        image_description='Young Maasai warriors in traditional red clothing performing a ceremonial dance during a coming-of-age ritual.',
        image_url='/DedanKimathi.jpg',  # Temporary placeholder - should be replaced with Maasai ceremony image
        audio_url='/test_combined_output.wav',
        audio_format='audio/wav',
        created_at='2024-10-14T11:15:00Z',
        cultural_themes=['Maasai Culture', 'Coming of Age', 'Traditional Ceremony', 'Warrior Culture', 'Pastoral Life']
    ),
    
    MashujaaStory(
        id='sample-luo-fishing',
        title='Fishermen of Lake Victoria',
        story="""As the first light of dawn breaks over Lake Victoria, the Luo fishermen prepare their traditional boats for another day on the waters that have sustained their people for centuries. The dhows, with their distinctive curved hulls, slice through the morning mist like shadows from the past.

These master fishermen carry with them generations of knowledge about the lake's moods, the movement of fish, and the ancient techniques passed down from father to son. Their nets, woven with precision and blessed by village elders, represent not just tools of trade but symbols of cultural identity.

The songs they sing while rowing echo across the water, telling stories of legendary catches, lost love, and the eternal bond between the Luo people and the great lake that shapes their destiny.""",
        image_description='Luo fishermen in traditional boats on Lake Victoria at sunrise, casting their nets into the golden waters.',
        image_url='/DedanKimathi.jpg',  # Temporary placeholder - should be replaced with Luo fishing image
        audio_url='/test_combined_output.wav',
        audio_format='audio/wav',
        created_at='2024-10-14T09:45:00Z',
        cultural_themes=['Luo Culture', 'Lake Victoria', 'Traditional Fishing', 'Community', 'Oral Traditions']
    ),
    
    MashujaaStory(
        id='sample-kikuyu-agriculture',
        title='Guardians of Mount Kenya',
        story="""At the foot of Mount Kenya, the Kikuyu people have cultivated their sacred lands for over a thousand years. Their terraced farms cascade down the mountain slopes like green staircases leading to the heavens, each level carefully tended by hands that know the soil's every secret.

The women, wearing colorful head wraps and carrying baskets woven from mountain reeds, move through the fields with the grace of those who understand the rhythm of the seasons. They plant not just crops, but hope, tradition, and the promise of abundance for future generations.

In the evening, as cooking fires begin to glow throughout the villages, the sweet aroma of roasting maize fills the air. This is more than sustenance; it is the continuation of a way of life that honors both the earth and the ancestors who first taught them to read the mountain's moods.""",
        image_description='Kikuyu women working in terraced agricultural fields on the slopes of Mount Kenya, with traditional farming tools.',
        audio_url=None,
        audio_format=None,
        created_at='2024-10-14T08:20:00Z',
        cultural_themes=['Kikuyu Culture', 'Agriculture', 'Mount Kenya', 'Women Farmers', 'Terraced Farming']
    ),
    
    MashujaaStory(
        id='sample-turkana-pastoralism',
        title='Nomads of the Northern Frontier',
        story="""In the harsh beauty of northern Kenya, the Turkana people move across the landscape like living poetry, their herds of cattle, goats, and camels flowing around them like rivers of life. Their knowledge of this arid land runs deeper than the ancient wells they dig with their hands.

The Turkana women, adorned with intricate beadwork that tells the story of their lineage, carry themselves with the dignity of queens. Their jewelry is not mere decoration but a library of cultural knowledge, each bead and pattern carrying meaning passed down through generations of desert mothers.

When drought threatens, the community comes together in ways that modern society has forgotten. They share water, pasture, and hope, proving that in the most challenging environments, human bonds become the strongest survival tool.""",
        image_description='Turkana pastoralists with their livestock in the arid northern landscape, showcasing traditional beadwork and desert survival skills.',
        audio_url=None,
        audio_format=None,
        created_at='2024-10-14T12:00:00Z',
        cultural_themes=['Turkana Culture', 'Pastoralism', 'Desert Life', 'Traditional Beadwork', 'Nomadic Lifestyle']
    ),
    
    MashujaaStory(
        id='sample-coastal-swahili',
        title='Tales from the Swahili Coast',
        story="""Along Kenya's Indian Ocean coastline, where the monsoon winds have carried traders and tales for centuries, the Swahili culture blossoms like the frangipani flowers that perfume the coastal air. In the narrow streets of Lamu and Mombasa, Arabic architecture mingles with African traditions to create something entirely unique.

The dhow builders work with wood that has traveled across oceans, their hands shaping vessels that will continue the ancient dance between Africa and the sea. Their craft, taught by masters who learned from Persian and Arab traders, represents the beautiful fusion that defines Swahili identity.

In the evening, as the call to prayer echoes across the rooftops, families gather on carved balconies to share stories that weave together African wisdom with Islamic teachings, creating a tapestry of faith and culture that has enriched the coast for over a millennium.""",
        image_description='Traditional Swahili architecture in a coastal town, with dhow boats in the harbor and people in traditional coastal dress.',
        audio_url=None,
        audio_format=None,
        created_at='2024-10-14T14:30:00Z',
        cultural_themes=['Swahili Culture', 'Coastal Life', 'Islamic Heritage', 'Trade History', 'Architecture']
    ),
]

# Story categories for filtering
STORY_CATEGORIES = [
    'All Stories',
    'Freedom Fighters',
    'Traditional Ceremonies',
    'Cultural Practices',
    'Regional Heritage',
    'Historical Figures',
]

# Cultural themes for tagging
CULTURAL_THEMES = [
    'Freedom Fighter',
    'Traditional Ceremony',
    'Maasai Culture',
    'Kikuyu Culture',
    'Luo Culture',
    'Turkana Culture',
    'Swahili Culture',
    'Agriculture',
    'Pastoralism',
    'Fishing',
    'Independence',
    'Leadership',
    'Community',
    'Oral Traditions',
    'Beadwork',
    'Architecture',
    'Trade History',
]

class StoriesRepository:
    """Repository class for managing stories data"""
    
    def __init__(self):
        self.stories = SAMPLE_STORIES.copy()
    
    def get_all_stories(self) -> List[Dict]:
        """Get all stories"""
        return [story.to_dict() for story in self.stories]
    
    def get_story_by_id(self, story_id: str) -> Optional[Dict]:
        """Get a specific story by ID"""
        for story in self.stories:
            if story.id == story_id:
                return story.to_dict()
        return None
    
    def get_featured_stories(self, limit: int = 3) -> List[Dict]:
        """Get featured stories for homepage carousel"""
        return [story.to_dict() for story in self.stories[:limit]]
    
    def get_stories_by_category(self, category: str) -> List[Dict]:
        """Get stories filtered by category"""
        if category.lower() == 'all stories':
            return self.get_all_stories()
        
        filtered_stories = []
        for story in self.stories:
            if any(theme.lower() in category.lower() or category.lower() in theme.lower() 
                   for theme in story.cultural_themes):
                filtered_stories.append(story.to_dict())
        
        return filtered_stories
    
    def get_stories_by_theme(self, theme: str) -> List[Dict]:
        """Get stories filtered by cultural theme"""
        filtered_stories = []
        for story in self.stories:
            if theme in story.cultural_themes:
                filtered_stories.append(story.to_dict())
        
        return filtered_stories
    
    def get_categories(self) -> List[str]:
        """Get available story categories"""
        return STORY_CATEGORIES.copy()
    
    def get_themes(self) -> List[str]:
        """Get available cultural themes"""
        return CULTURAL_THEMES.copy()
    
    def add_story(self, story: MashujaaStory) -> bool:
        """Add a new story"""
        try:
            self.stories.append(story)
            return True
        except Exception:
            return False
    
    def update_story(self, story_id: str, updated_story: MashujaaStory) -> bool:
        """Update an existing story"""
        for i, story in enumerate(self.stories):
            if story.id == story_id:
                self.stories[i] = updated_story
                return True
        return False
    
    def delete_story(self, story_id: str) -> bool:
        """Delete a story by ID"""
        for i, story in enumerate(self.stories):
            if story.id == story_id:
                self.stories.pop(i)
                return True
        return False

# Global repository instance
stories_repository = StoriesRepository()