/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

// Attribute categories configuration
const ATTRIBUTE_CATEGORIES = {
  professionalAttributes: {
    title: 'Professional Background',
    icon: '💼',
    attributes: {
      isInTech: 'Works in Technology',
      isDesigner: 'Designer',
      isDeveloper: 'Developer',
      isManager: 'Management Role',
      isFreelancer: 'Freelancer/Consultant',
      isRemote: 'Works Fully Remote',
      hasStartup: 'Runs a Startup',
      isInMarketing: 'Works in Marketing'
    }
  },
  technicalSkills: {
    title: 'Technical Skills',
    icon: '💻',
    attributes: {
      knowsJavaScript: 'JavaScript',
      knowsPython: 'Python',
      knowsReact: 'React',
      knowsAI: 'AI/Machine Learning',
      knowsDesignTools: 'Design Tools (Figma, etc)',
      knowsDataAnalysis: 'Data Analysis'
    }
  },
  personalTraits: {
    title: 'Personal Traits',
    icon: '🌟',
    attributes: {
      isMorningPerson: 'Morning Person',
      prefersQuiet: 'Prefers Quiet Spaces',
      attendsEvents: 'Attends Community Events',
      likesCoffee: 'Coffee Enthusiast',
      isVegetarian: 'Vegetarian/Vegan',
      hasPets: 'Has Pets',
      playsMusic: 'Plays Musical Instrument',
      doesYoga: 'Practices Yoga/Meditation'
    }
  },
  workStyle: {
    title: 'Work Style',
    icon: '🏢',
    attributes: {
      usesHotDesk: 'Uses Hot Desk Area',
      usesQuietZone: 'Works in Quiet Zone',
      usesMeetingRooms: 'Frequently Books Meeting Rooms',
      worksWeekends: 'Sometimes Works Weekends',
      takesCallsOften: 'Takes Many Calls',
      wearsHeadphones: 'Usually Wears Headphones'
    }
  },
  hobbies: {
    title: 'Hobbies & Interests',
    icon: '🎯',
    attributes: {
      playsVideoGames: 'Video Games',
      doesSports: 'Sports & Fitness',
      likesHiking: 'Hiking & Outdoors',
      readsBooks: 'Reading',
      watchesAnime: 'Anime/Manga',
      doesPhotography: 'Photography',
      likesBoardGames: 'Board Games',
      doesArt: 'Art & Crafts'
    }
  },
  experience: {
    title: 'Experience & Background',
    icon: '🌍',
    attributes: {
      isNewMember: 'New Member (< 3 months)',
      isVeteranMember: 'Veteran Member (> 1 year)',
      isUnder30: 'Under 30',
      hasKids: 'Has Children',
      speaksMultipleLanguages: 'Speaks 3+ Languages',
      hasLivedAbroad: 'Has Lived Abroad'
    }
  }
};

interface BooleanAttributesTabProps {
  formData: any;
  onChange: (updates: any) => void;
}

export default function BooleanAttributesTab({ formData, onChange }: BooleanAttributesTabProps) {
  const toggleAttribute = (category: string, attribute: string) => {
    const currentValue = formData[category]?.[attribute] || false;
    onChange({
      [category]: {
        ...formData[category],
        [attribute]: !currentValue
      }
    });
  };

  // Count total selected attributes
  const getTotalSelected = () => {
    let total = 0;
    Object.keys(ATTRIBUTE_CATEGORIES).forEach(category => {
      const categoryData = formData[category as keyof typeof ATTRIBUTE_CATEGORIES] || {};
      total += Object.values(categoryData).filter(val => val === true).length;
    });
    return total;
  };

  const totalSelected = getTotalSelected();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Profile Completeness</h3>
        <div className="flex items-center justify-between">
          <p className="text-blue-800">
            You&apos;ve selected <strong>{totalSelected}</strong> attributes
          </p>
          <div className="text-sm text-blue-600">
            {totalSelected < 10 && '🔴 Add more for better gameplay'}
            {totalSelected >= 10 && totalSelected < 20 && '🟡 Good start!'}
            {totalSelected >= 20 && '🟢 Great profile!'}
          </div>
        </div>
        <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min((totalSelected / 40) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Attribute Categories */}
      {Object.entries(ATTRIBUTE_CATEGORIES).map(([categoryKey, categoryData]) => {
        const categoryFormData = formData[categoryKey] || {};
        const selectedCount = Object.values(categoryFormData).filter(val => val === true).length;

        return (
          <div key={categoryKey} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-2xl">{categoryData.icon}</span>
                {categoryData.title}
              </h3>
              <span className="text-sm text-gray-500">
                {selectedCount} selected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(categoryData.attributes).map(([attrKey, attrLabel]) => {
                const isSelected = categoryFormData[attrKey] || false;

                return (
                  <label
                    key={attrKey}
                    className={`
                      flex items-center p-3 rounded-lg cursor-pointer transition-all
                      ${isSelected 
                        ? 'bg-blue-50 border-2 border-blue-500' 
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAttribute(categoryKey, attrKey)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`ml-3 ${isSelected ? 'font-medium' : ''}`}>
                      {attrLabel}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Tips Section */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Tips for a Great Game Profile</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Select attributes that truly represent you - honesty makes the game more fun!</li>
          <li>• Aim for at least 15-20 attributes for the best gameplay experience</li>
          <li>• Mix attributes from different categories to make yourself unique</li>
          <li>• Remember: other players will try to guess who you are based on these attributes</li>
        </ul>
      </div>
    </div>
  );
}