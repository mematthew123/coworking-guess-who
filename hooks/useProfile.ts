import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Member } from '@/sanity.types';

interface ProfileFormData {
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
}

export function useProfile() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    profession: '',
    company: '',
    bio: '',
    skills: [],
    interests: [],
    workspacePreferences: {
      prefersQuiet: false,
      morningPerson: false,
      attendsEvents: false,
      preferredArea: 'hotDesk',
    },
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: '',
    },
    gameParticipation: false,
  });
  
  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      if (!isLoaded || !user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/onboarding');
            return;
          }
          throw new Error('Failed to fetch profile');
        }
        
        const memberDoc = await response.json();
        
        setProfile(memberDoc);
        setFormData({
          name: memberDoc.name || '',
          profession: memberDoc.profession || '',
          company: memberDoc.company || '',
          bio: memberDoc.bio || '',
          skills: memberDoc.skills || [],
          interests: memberDoc.interests || [],
          workspacePreferences: memberDoc.workspacePreferences || {
            prefersQuiet: false,
            morningPerson: false,
            attendsEvents: false,
            preferredArea: 'hotDesk',
          },
          socialLinks: memberDoc.socialLinks || {
            linkedin: '',
            twitter: '',
            website: '',
          },
          gameParticipation: memberDoc.gameParticipation || false,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [isLoaded, user, router]);
  
  // Update profile
  const updateProfile = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  // Upload image
  const uploadImage = async (file: File) => {
    if (!profile) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const profileResponse = await fetch('/api/profile');
      if (profileResponse.ok) {
        const updatedProfile = await profileResponse.json();
        setProfile(updatedProfile);
      }
      
      setSuccessMessage('Profile photo updated!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setSaving(false);
    }
  };
  
  // Update form data
  const updateFormData = (updates: Partial<ProfileFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  // Skill handlers
  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill.trim()] }));
    }
  };
  
  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };
  
  // Interest handlers
  const addInterest = (interest: string) => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, interest.trim()] }));
    }
  };
  
  const removeInterest = (interest: string) => {
    setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };
  
  return {
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
  };
}