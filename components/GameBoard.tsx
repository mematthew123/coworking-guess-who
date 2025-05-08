import React from 'react';
import Image from 'next/image';
import { Member } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';

interface GameBoardProps {
  members: Member[];
  eliminatedIds: string[];
  onToggleMember: (id: string) => void;
  readonly?: boolean;
}

export default function GameBoard({ 
  members, 
  eliminatedIds, 
  onToggleMember,
  readonly = false 
}: GameBoardProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {members.map((member) => (
        <div
          key={member._id}
          onClick={() => !readonly && onToggleMember(member._id)}
          className={`relative rounded-lg overflow-hidden transition-all ${
            readonly ? '' : 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1'
          } ${
            eliminatedIds.includes(member._id) 
              ? 'opacity-40 grayscale' 
              : ''
          }`}
        >
          {/* Member image */}
          <div className="aspect-w-3 aspect-h-4 bg-gray-100">
            {member.image ? (
              <Image 
                src={urlFor(member.image).width(200).height(267).url()}
                alt={'Profile picture of ' + member.name}
                width={200}
                height={267}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-blue-100">
                <span className="text-5xl text-blue-500 font-bold">
                  {member.name?.charAt(0) ?? ''}
                </span>
              </div>
            )}
          </div>
          
          {/* Member name */}
          <div className="bg-white p-2 text-center">
            <h3 className="font-medium text-gray-900 truncate">{member.name}</h3>
            <p className="text-xs text-gray-500 truncate">{member.profession}</p>
          </div>
          
          {/* Eliminated overlay */}
          {eliminatedIds.includes(member._id) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500 rotate-45 transform origin-center"></div>
              <div className="w-full h-0.5 bg-red-500 -rotate-45 transform origin-center"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}