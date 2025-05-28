import SkillsInterestsSection from './SkillsInterestsSection';

interface PreferencesTabProps {
  formData: {
    skills: string[];
    interests: string[];
    workspacePreferences: {
      prefersQuiet: boolean;
      morningPerson: boolean;
      attendsEvents: boolean;
      preferredArea: 'hotDesk' | 'quietZone' | 'meetingArea' | 'phoneBooth' | 'kitchen';
    };
  };
  onChange: (updates: { workspacePreferences: PreferencesTabProps['formData']['workspacePreferences'] }) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  onAddInterest: (interest: string) => void;
  onRemoveInterest: (interest: string) => void;
}

export default function PreferencesTab({
  formData,
  onChange,
  onAddSkill,
  onRemoveSkill,
  onAddInterest,
  onRemoveInterest
}: PreferencesTabProps) {
  return (
    <div className="space-y-6">
      {/* Skills */}
      <SkillsInterestsSection
        title="Skills"
        items={formData.skills}
        placeholder="Add a skill..."
        colorScheme="blue"
        onAdd={onAddSkill}
        onRemove={onRemoveSkill}
      />
      
      {/* Interests */}
      <SkillsInterestsSection
        title="Interests"
        items={formData.interests}
        placeholder="Add an interest..."
        colorScheme="green"
        onAdd={onAddInterest}
        onRemove={onRemoveInterest}
      />
      
      {/* Workspace Preferences */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Workspace Preferences</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.workspacePreferences.prefersQuiet}
              onChange={(e) => onChange({
                workspacePreferences: {
                  ...formData.workspacePreferences,
                  prefersQuiet: e.target.checked
                }
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">I prefer quiet work environments</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.workspacePreferences.morningPerson}
              onChange={(e) => onChange({
                workspacePreferences: {
                  ...formData.workspacePreferences,
                  morningPerson: e.target.checked
                }
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">I&#39;m a morning person</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.workspacePreferences.attendsEvents}
              onChange={(e) => onChange({
                workspacePreferences: {
                  ...formData.workspacePreferences,
                  attendsEvents: e.target.checked
                }
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">I regularly attend community events</span>
          </label>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Work Area
          </label>
          <select
            value={formData.workspacePreferences.preferredArea}
            onChange={(e) => onChange({
              workspacePreferences: {
                ...formData.workspacePreferences,
                preferredArea: e.target.value as 'hotDesk' | 'quietZone' | 'meetingArea' | 'phoneBooth' | 'kitchen'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hotDesk">Hot Desk</option>
            <option value="quietZone">Quiet Zone</option>
            <option value="meetingArea">Meeting Area</option>
            <option value="phoneBooth">Phone Booth</option>
            <option value="kitchen">Kitchen/Lounge</option>
          </select>
        </div>
      </div>
    </div>
  );
}