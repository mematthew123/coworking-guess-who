import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { Member } from '@/sanity.types';

interface ProfilePhotoSectionProps {
  profile: Member;
  name: string;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
}

export default function ProfilePhotoSection({ 
  profile, 
  name, 
  onImageUpload, 
  saving 
}: ProfilePhotoSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
            {profile.image ? (
              <Image
                src={urlFor(profile.image).width(128).height(128).url()}
                alt="Profile photo"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl text-gray-400 font-bold">
                  {name.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
              disabled={saving}
            />
          </label>
        </div>
        <div>
          <p className="text-gray-600">Upload a photo to help your coworkers recognize you!</p>
          <p className="text-sm text-gray-500 mt-1">Recommended: Square image, at least 200x200px</p>
        </div>
      </div>
    </div>
  );
}