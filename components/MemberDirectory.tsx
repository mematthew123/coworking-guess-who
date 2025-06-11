'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Member } from '@/sanity.types';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

const MemberDirectory = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProfession, setSelectedProfession] = useState('all');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique values for filters
    const filterOptions = useMemo(() => {
        const professions = [
            ...new Set(members.map((m) => m.profession).filter(Boolean)),
        ].sort();
        const skills = [
            ...new Set(members.flatMap((m) => m.skills || [])),
        ].sort();
        return { professions, skills };
    }, [members]);

    // Fetch members on mount
    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);

            // Basic GROQ query to get all members with game participation
            const query = `*[_type == "member" && gameParticipation == true] | order(name asc) {
        _id,
        name,
        profession,
        company,
        skills,
        image,
        bio
      }`;

            const response = await fetch(
                `/api/members/search?query=${encodeURIComponent(query)}`,
            );
            if (!response.ok) throw new Error('Failed to fetch members');

            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter members based on search and filters
    const filteredMembers = useMemo(() => {
        return members.filter((member) => {
            // Text search
            const matchesSearch =
                !searchTerm ||
                member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.profession
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                member.company
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                member.bio?.toLowerCase().includes(searchTerm.toLowerCase());

            // Profession filter
            const matchesProfession =
                selectedProfession === 'all' ||
                member.profession === selectedProfession;

            // Skills filter
            const matchesSkills =
                selectedSkills.length === 0 ||
                selectedSkills.every((skill) => member.skills?.includes(skill));

            return matchesSearch && matchesProfession && matchesSkills;
        });
    }, [members, searchTerm, selectedProfession, selectedSkills]);

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill],
        );
    };

    const clearFilters = () => {
        setSelectedProfession('all');
        setSelectedSkills([]);
        setSearchTerm('');
    };

    const hasActiveFilters =
        selectedProfession !== 'all' || selectedSkills.length > 0;

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-[400px]'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    return (
        <div className='max-w-7xl mx-auto p-6'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                    Member Directory
                </h1>
                <p className='text-gray-600'>
                    Find and connect with coworking members
                </p>
            </div>

            {/* Search Bar */}
            <div className='mb-6'>
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <input
                        type='text'
                        placeholder='Search by name, profession, company, or bio...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                </div>
            </div>

            {/* Filters */}
            <div className='mb-6'>
                <div className='flex items-center justify-between mb-4'>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                    >
                        <Filter className='w-4 h-4' />
                        <span>Filters</span>
                        {hasActiveFilters && (
                            <span className='bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
                                {(selectedProfession !== 'all' ? 1 : 0) +
                                    selectedSkills.length}
                            </span>
                        )}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className='text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1'
                        >
                            <X className='w-4 h-4' />
                            Clear filters
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className='bg-gray-50 p-4 rounded-lg space-y-4'>
                        {/* Profession Filter */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Profession
                            </label>
                            <select
                                value={selectedProfession}
                                onChange={(e) =>
                                    setSelectedProfession(e.target.value)
                                }
                                className='w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
                            >
                                <option value='all'>All Professions</option>
                                {filterOptions.professions.map((profession) => (
                                    <option key={profession} value={profession}>
                                        {profession}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Skills Filter */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Skills
                            </label>
                            <div className='flex flex-wrap gap-2'>
                                {filterOptions.skills.map((skill) => (
                                    <button
                                        key={skill}
                                        onClick={() => toggleSkill(skill)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                            selectedSkills.includes(skill)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className='mb-4 text-sm text-gray-600'>
                Showing {filteredMembers.length} of {members.length} members
            </div>

            {/* Members Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredMembers.map((member) => (
                    <div
                        key={member._id}
                        className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'
                    >
                        <div className='flex items-start gap-4'>
                            {member.image ? (
                                <Image
                                    width={64}
                                    height={64}
                                    src={urlFor(member.image).url()}
                                    alt={member.name || 'Member Image'}
                                    className='w-16 h-16 rounded-full object-cover'
                                />
                            ) : (
                                <div className='w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center'>
                                    <span className='text-xl font-medium text-blue-600'>
                                        {member.name?.charAt(0) || '?'}
                                    </span>
                                </div>
                            )}

                            <div className='flex-1'>
                                <h3 className='font-semibold text-gray-900'>
                                    {member.name}
                                </h3>
                                <p className='text-sm text-gray-600'>
                                    {member.profession}
                                </p>
                                {member.company && (
                                    <p className='text-sm text-gray-500'>
                                        {member.company}
                                    </p>
                                )}
                            </div>
                        </div>

                        {member.bio && (
                            <p className='mt-4 text-sm text-gray-600 line-clamp-2'>
                                {member.bio}
                            </p>
                        )}

                        {member.skills && member.skills.length > 0 && (
                            <div className='mt-4 flex flex-wrap gap-1'>
                                {member.skills
                                    .slice(0, 3)
                                    .map((skill, index) => (
                                        <span
                                            key={index}
                                            className='text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full'
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                {member.skills.length > 3 && (
                                    <span className='text-xs text-gray-500'>
                                        +{member.skills.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredMembers.length === 0 && (
                <div className='text-center py-12'>
                    <p className='text-gray-500'>
                        No members found matching your criteria.
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className='mt-4 text-blue-600 hover:text-blue-800'
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MemberDirectory;
