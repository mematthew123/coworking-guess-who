import React from 'react';
import { Trophy, Gamepad2, TrendingUp, Users, AlertCircle } from 'lucide-react';

const GameLeaderboard = () => {
  const stats = [
    { value: '1,004', label: 'TOTAL GAMES', icon: Gamepad2, color: 'bg-yellow' },
    { value: '7', label: 'COMPLETED', icon: Trophy, color: 'bg-pink' },
    { value: '996', label: 'ACTIVE', icon: TrendingUp, color: 'bg-green' },
    { value: '0.7%', label: 'FINISH RATE', icon: AlertCircle, color: 'bg-red' },
  ];

  const topWinners = [
    {
      rank: 1,
      name: 'MATTHEW RHOADS',
      wins: 4,
      totalGames: 1003,
      winRate: '0.4%',
      lastPlayed: 'TODAY',
      medal: 'gold'
    },
    {
      rank: 2,
      name: 'MATTHEW R',
      wins: 3,
      totalGames: 988,
      winRate: '0.3%',
      lastPlayed: 'TODAY',
      medal: 'silver'
    },
    {
      rank: 3,
      name: 'GEORGE COSTANZA',
      wins: 0,
      totalGames: 13,
      winRate: '0%',
      lastPlayed: 'TODAY',
      medal: 'bronze'
    }
  ];

  const mostActive = [
    {
      rank: 1,
      name: 'MATTHEW RHOADS',
      totalGames: 1003,
      asPlayerOne: 809,
      asPlayerTwo: 194
    },
    {
      rank: 2,
      name: 'MATTHEW R',
      totalGames: 988,
      asPlayerOne: 182,
      asPlayerTwo: 806
    },
    {
      rank: 3,
      name: 'GEORGE COSTANZA',
      totalGames: 13,
      asPlayerOne: 13,
      asPlayerTwo: 0
    }
  ];

  interface Winner {
    rank: number;
    name: string;
    wins: number;
    totalGames: number;
    winRate: string;
    lastPlayed: string;
    medal: 'gold' | 'silver' | 'bronze';
  }

  const getMedalStyles = (medal: Winner['medal']): string => {
    switch (medal) {
      case 'gold':
        return 'bg-yellow';
      case 'silver':
        return 'bg-white';
      case 'bronze':
        return 'bg-orange';
      default:
        return 'bg-white';
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* Geometric Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-10 w-64 h-64 bg-pink border-8 border-black rotate-12' />
        <div className='absolute bottom-10 right-20 w-48 h-96 bg-blue border-8 border-black -rotate-6' />
        <div className='absolute top-1/3 right-1/4 w-56 h-56 bg-green border-8 border-black rotate-45' />
        <div className='absolute bottom-1/3 left-1/4 w-72 h-36 bg-yellow border-8 border-black -rotate-12' />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-8xl font-black uppercase mb-6">
            <span className='inline-block bg-black text-yellow px-6 py-3 border-8 border-yellow shadow-brutal-xl transform -rotate-2'>
              🏆 LEADERBOARD
            </span>
          </h1>
          <p className="text-2xl font-black uppercase bg-white border-6 border-black px-6 py-3 inline-block shadow-brutal-md transform rotate-1">
            WHO&apos;S THE BEST GUESSER?!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.color} border-6 border-black p-6 shadow-brutal-md hover:shadow-brutal-xl hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100 transform ${
                  index % 2 === 0 ? '-rotate-1' : 'rotate-1'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-10 h-10 text-black" strokeWidth={3} />
                  <span className="text-4xl font-black text-black">
                    {stat.value}
                  </span>
                </div>
                <p className="text-black font-black uppercase">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Top Winners */}
        <div className="bg-white border-8 border-black p-8 shadow-brutal-xl mb-8">
          <h2 className="text-4xl font-black uppercase mb-6 flex items-center gap-3 bg-pink text-white px-4 py-2 inline-block shadow-brutal-md">
            <Trophy className="w-8 h-8" strokeWidth={3} />
            TOP WINNERS
          </h2>
          <div className="space-y-4">
            {topWinners.map((player) => (
              <div
                key={player.rank}
                className={`${getMedalStyles(player.medal as 'gold' | 'silver' | 'bronze')} border-6 border-black p-6 shadow-brutal-md hover:shadow-brutal-xl hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-black text-black">
                      {getRankEmoji(player.rank)}
                    </span>
                    <div>
                      <h3 className="text-2xl font-black uppercase text-black">{player.name}</h3>
                      <p className="text-sm font-bold uppercase text-black">
                        {player.totalGames} GAMES • {player.winRate} WIN RATE • PLAYED: {player.lastPlayed}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl font-black text-black">
                      {player.wins}
                    </span>
                    <p className="text-sm font-black uppercase text-black">WINS</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Players */}
{/* Most Active Players */}
        <div className="bg-white border-8 border-black p-4 md:p-8 shadow-brutal-xl mb-8">
          <h2 className="text-2xl md:text-4xl font-black uppercase mb-6 flex items-center gap-3 bg-blue text-white px-4 py-2 shadow-brutal-md">
            <Gamepad2 className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
            MOST ACTIVE
          </h2>
          <div className="space-y-4">
            {mostActive.map((player, index) => (
              <div
                key={player.rank}
                className={`border-6 border-black p-4 md:p-6 shadow-brutal-md hover:shadow-brutal-xl hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100 ${
                  index === 0 ? 'bg-purple' : index === 1 ? 'bg-mint' : 'bg-peach'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-2xl md:text-3xl font-black text-black bg-white border-4 border-black w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shadow-brutal-sm shrink-0">
                      {player.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg md:text-2xl font-black uppercase text-black break-words">{player.name}</h3>
                      <p className="text-xs md:text-sm font-bold uppercase text-black break-words">
                        P1: {player.asPlayerOne} TIMES • P2: {player.asPlayerTwo} TIMES
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                    <span className="text-3xl md:text-5xl font-black text-black">
                      {player.totalGames}
                    </span>
                    <p className="text-xs md:text-sm font-black uppercase text-black">GAMES</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-black text-yellow border-8 border-yellow p-8 shadow-brutal-xl">
          <h3 className="text-4xl font-black uppercase mb-6 flex items-center gap-3">
            <Users className="w-10 h-10" strokeWidth={3} />
            GAME FACTS
          </h3>
          <div className="space-y-4 text-yellow">
            <p className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <span className="font-bold uppercase">
                COMPLETION RATE IS ONLY{' '}
                <span className="bg-red text-black px-3 py-1 font-black">
                  0.7%
                </span>{' '}
                - 996 OUT OF 1,004 GAMES STILL GOING!
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">🏃</span>
              <span className="font-bold uppercase">
                MATTHEW RHOADS HAS STARTED OVER 1,000 GAMES BUT ONLY FINISHED 4!
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">🎲</span>
              <span className="font-bold uppercase">
                IT&apos;S A &quot;GUESS WHO&quot; GAME WHERE YOU IDENTIFY COWORKING MEMBERS!
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <span className="font-bold uppercase">
                MOST GAMES GET ABANDONED - TOO HARD OR TOO BORING?!
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLeaderboard;
