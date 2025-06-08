interface ProfileTabsProps {
  activeTab: 'basic' | 'preferences' | 'game';
  onTabChange: (tab: 'basic' | 'preferences' | 'game') => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs = [
    { id: 'basic' as const, label: 'Basic Information' },
    { id: 'preferences' as const, label: 'Skills & Preferences' },
    { id: 'game' as const, label: 'Game Settings' }
  ];
  
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}