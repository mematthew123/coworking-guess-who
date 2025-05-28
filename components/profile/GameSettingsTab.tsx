type GameSettingsTabProps = {
  formData: {
    name: string;
    profession: string;
    company: string;
    bio: string;
    skills: string[];
    interests: string[];
    workspacePreferences: {
      prefersQuiet: boolean;
      morningPerson: boolean;
      attendsEvents: boolean;
      preferredArea: 'hotDesk' | 'quietZone' | 'meetingArea' | 'phoneBooth' | 'kitchen';
    };
    socialLinks: {
      linkedin: string;
      twitter: string;
      website: string;
    };
    gameParticipation: boolean;
  };
  onChange: (updates: Partial<{
    name: string;
    profession: string;
    company: string;
    bio: string;
    skills: string[];
    interests: string[];
    workspacePreferences: {
      prefersQuiet: boolean;
      morningPerson: boolean;
      attendsEvents: boolean;
      preferredArea: 'hotDesk' | 'quietZone' | 'meetingArea' | 'phoneBooth' | 'kitchen';
    };
    socialLinks: {
      linkedin: string;
      twitter: string;
      website: string;
    };
    gameParticipation: boolean;
  }>) => void;
};

export default function GameSettingsTab({ formData, onChange }: GameSettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-2">About the Guess Who Game</h3>
        <p className="text-blue-800 text-sm mb-4">
          The community Guess Who game lets you play with your coworking colleagues.
          When you opt in, your profile becomes part of the game board and other players
          can try to guess who you are based on your skills, interests, and preferences!
        </p>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.gameParticipation}
            onChange={(e) => onChange({ gameParticipation: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700 font-medium">
            I want to participate in the community Guess Who game
          </span>
        </label>
      </div>
      
      {formData.gameParticipation && (
        <>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">Game Tips</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Make sure your profile is complete for the best game experience</li>
              <li>• Add diverse skills and interests to make the game more interesting</li>
              <li>• Your workspace preferences help create unique questions</li>
              <li>• Upload a profile photo so players can see you when they guess!</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Your Game Attributes</h4>
            <div className="space-y-2 text-sm">
              <AttributeRow label="Skills" value={`${formData.skills.length} added`} />
              <AttributeRow label="Interests" value={`${formData.interests.length} added`} />
              <AttributeRow 
                label="Morning Person" 
                value={formData.workspacePreferences.morningPerson ? 'Yes' : 'No'} 
              />
              <AttributeRow 
                label="Prefers Quiet" 
                value={formData.workspacePreferences.prefersQuiet ? 'Yes' : 'No'} 
              />
              <AttributeRow 
                label="Attends Events" 
                value={formData.workspacePreferences.attendsEvents ? 'Yes' : 'No'} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AttributeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}