'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';

import {
  ProfilePhotoSection,
  ProfileTabs,
  BasicInfoTab,
  PreferencesTab,
  GameSettingsTab
} from '@/components/profile';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'preferences' | 'game'>('basic');
  
  const {
    profile,
    formData,
    loading,
    saving,
    error,
    successMessage,
    updateProfile,
    uploadImage,
    updateFormData,
    addSkill,
    removeSkill,
    addInterest,
    removeInterest,
  } = useProfile();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile();
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!profile) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}
      
      {/* Profile Photo Section */}
      <ProfilePhotoSection
        profile={profile}
        name={formData.name}
        onImageUpload={handleImageUpload}
        saving={saving}
      />
      
      {/* Tabs and Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'basic' && (
            <BasicInfoTab
              formData={formData}
              onChange={updateFormData}
            />
          )}
          
          {activeTab === 'preferences' && (
            <PreferencesTab
              formData={formData}
              onChange={updateFormData}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
              onAddInterest={addInterest}
              onRemoveInterest={removeInterest}
            />
          )}
          
          {activeTab === 'game' && (
            <GameSettingsTab
              formData={formData}
              onChange={updateFormData}
            />
          )}
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
                saving
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}