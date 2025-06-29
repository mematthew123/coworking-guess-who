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
            <div className='flex justify-center items-center min-h-[400px] bg-cream'>
                <div className='bg-pink border-8 border-black p-8 shadow-brutal-xl animate-pulse'>
                    <div className='text-6xl font-black uppercase'>
                        LOADING...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-cream relative overflow-hidden'>
            {/* Geometric Background */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute top-10 right-20 w-48 h-48 bg-yellow border-8 border-black rotate-12' />
                <div className='absolute bottom-20 left-10 w-64 h-32 bg-blue border-8 border-black -rotate-6' />
                <div className='absolute top-1/3 right-1/4 w-32 h-32 bg-green border-8 border-black rotate-45' />
                <div className='absolute bottom-1/4 left-1/3 w-40 h-40 bg-orange border-8 border-black -rotate-12' />
            </div>

            <div className='relative z-10 max-w-7xl mx-auto p-6'>
                <div className='mb-8'>
                    <h1 className='text-6xl md:text-8xl font-black uppercase mb-4'>
                        <span className='inline-block bg-black text-yellow px-4 py-2 border-8 border-yellow shadow-brutal-xl transform -rotate-2'>
                            MEMBER
                        </span>
                        <br />
                        <span className='inline-block bg-pink text-white px-4 py-2 border-8 border-black shadow-brutal-xl transform rotate-1'>
                            DIRECTORY
                        </span>
                    </h1>
                    <p className='text-2xl font-black uppercase bg-white border-4 border-black p-4 inline-block shadow-brutal-md'>
                        FIND YOUR NEXT OPPONENT
                    </p>
                </div>

                {/* Search Bar */}
                <div className='mb-6'>
                    <div className='relative'>
                        <Search
                            className='absolute left-4 top-1/2 transform -translate-y-1/2 text-black w-6 h-6'
                            strokeWidth={3}
                        />
                        <input
                            type='text'
                            placeholder='SEARCH MEMBERS...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-14 pr-4 py-4 bg-white border-6 border-black text-black font-bold uppercase placeholder-gray-600 shadow-brutal-md focus:shadow-brutal-lg focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-100'
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className='mb-6'>
                    <div className='flex items-center justify-between mb-4'>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className='flex items-center gap-2 px-6 py-3 bg-yellow text-black font-black uppercase border-4 border-black shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100'
                        >
                            <Filter className='w-5 h-5' strokeWidth={3} />
                            <span>FILTERS</span>
                            {hasActiveFilters && (
                                <span className='bg-red text-white text-sm px-3 py-1 border-2 border-black'>
                                    {(selectedProfession !== 'all' ? 1 : 0) +
                                        selectedSkills.length}
                                </span>
                            )}
                        </button>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className='flex items-center gap-2 px-4 py-2 bg-white text-black font-black uppercase border-4 border-black shadow-brutal-sm hover:shadow-brutal-md hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100'
                            >
                                <X className='w-5 h-5' strokeWidth={3} />
                                CLEAR ALL
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className='bg-white border-6 border-black p-6 shadow-brutal-lg space-y-6'>
                            {/* Profession Filter */}
                            <div>
                                <label className='block text-xl font-black uppercase mb-3'>
                                    PROFESSION
                                </label>
                                <select
                                    value={selectedProfession}
                                    onChange={(e) =>
                                        setSelectedProfession(e.target.value)
                                    }
                                    className='w-full md:w-64 px-4 py-3 bg-yellow border-4 border-black font-bold uppercase shadow-brutal-sm focus:shadow-brutal-md transition-all duration-100'
                                >
                                    <option value='all'>ALL PROFESSIONS</option>
                                    {filterOptions.professions.map(
                                        (profession) => (
                                            <option
                                                key={profession}
                                                value={profession}
                                            >
                                                {profession?.toUpperCase()}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            {/* Skills Filter */}
                            <div>
                                <label className='block text-xl font-black uppercase mb-3'>
                                    SKILLS
                                </label>
                                <div className='flex flex-wrap gap-3'>
                                    {filterOptions.skills.map((skill) => (
                                        <button
                                            key={skill}
                                            onClick={() => toggleSkill(skill)}
                                            className={`px-4 py-2 border-4 border-black font-bold uppercase transition-all duration-100 ${
                                                selectedSkills.includes(skill)
                                                    ? 'bg-blue text-white shadow-brutal-md translate-x-[-2px] translate-y-[-2px]'
                                                    : 'bg-white text-black shadow-brutal-sm hover:shadow-brutal-md hover:translate-x-[-2px] hover:translate-y-[-2px]'
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
                <div className='mb-6 px-4 py-2 bg-black text-yellow font-black uppercase inline-block shadow-brutal-sm'>
                    SHOWING {filteredMembers.length} OF {members.length} MEMBERS
                </div>

                {/* Members Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredMembers.map((member, index) => (
                        <div
                            key={member._id}
                            className={`relative border-6 border-black p-6 shadow-brutal-md hover:shadow-brutal-xl hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100 cursor-pointer transform ${
                                index % 4 === 0
                                    ? 'bg-pink -rotate-1'
                                    : index % 4 === 1
                                      ? 'bg-yellow rotate-1'
                                      : index % 4 === 2
                                        ? 'bg-green -rotate-1'
                                        : 'bg-orange rotate-1'
                            }`}
                        >
                            <div className='flex items-start gap-4'>
                                {member.image ? (
                                    <Image
                                        width={64}
                                        height={64}
                                        src={urlFor(member.image).url()}
                                        alt={member.name || 'Member Image'}
                                        className='w-16 h-16 border-4 border-black object-cover'
                                    />
                                ) : (
                                    <div className='w-16 h-16 bg-black flex items-center justify-center border-4 border-white'>
                                        <span className='text-2xl font-black text-white'>
                                            {member.name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                )}

                                <div className='flex-1'>
                                    <h3 className='font-black text-xl uppercase text-black'>
                                        {member.name}
                                    </h3>
                                    <p className='font-bold uppercase text-black'>
                                        {member.profession}
                                    </p>
                                    {member.company && (
                                        <p className='text-sm font-bold uppercase text-black/80'>
                                            @ {member.company}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {member.bio && (
                                <p className='mt-4 text-sm font-bold text-black line-clamp-2'>
                                    {member.bio}
                                </p>
                            )}

                            {member.skills && member.skills.length > 0 && (
                                <div className='mt-4 flex flex-wrap gap-2'>
                                    {member.skills
                                        .slice(0, 3)
                                        .map((skill, skillIndex) => (
                                            <span
                                                key={skillIndex}
                                                className='text-xs px-2 py-1 bg-black text-white font-bold uppercase'
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    {member.skills.length > 3 && (
                                        <span className='text-xs font-bold uppercase text-black'>
                                            +{member.skills.length - 3} MORE
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filteredMembers.length === 0 && (
                    <div className='text-center py-12'>
                        <div className='bg-white border-8 border-black p-8 inline-block shadow-brutal-xl'>
                            <p className='text-2xl font-black uppercase mb-4'>
                                NO MEMBERS FOUND!
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className='bg-red text-white font-black uppercase px-6 py-3 border-4 border-black shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100'
                                >
                                    CLEAR FILTERS
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberDirectory;
