interface BasicInfoTabProps {
  formData: {
    name: string;
    profession: string;
    company: string;
    bio: string;
    socialLinks: {
      linkedin: string;
      twitter: string;
      website: string;
    };
  };
  onChange: (updates: Partial<BasicInfoTabProps['formData']>) => void;
}

export default function BasicInfoTab({ formData, onChange }: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profession
        </label>
        <input
          type="text"
          value={formData.profession}
          onChange={(e) => onChange({ profession: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => onChange({ company: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us a bit about yourself..."
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Social Links</h3>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
          <input
            type="url"
            value={formData.socialLinks.linkedin}
            onChange={(e) => onChange({
              socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Twitter</label>
          <input
            type="url"
            value={formData.socialLinks.twitter}
            onChange={(e) => onChange({
              socialLinks: { ...formData.socialLinks, twitter: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://twitter.com/yourhandle"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Website</label>
          <input
            type="url"
            value={formData.socialLinks.website}
            onChange={(e) => onChange({
              socialLinks: { ...formData.socialLinks, website: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
    </div>
  );
}