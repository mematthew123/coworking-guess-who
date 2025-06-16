import React from 'react';
import { Trophy, Gamepad2, TrendingUp, Users, AlertCircle } from 'lucide-react';

const GameLeaderboard = () => {
  const stats = [
    { value: '1,004', label: 'Total Games', icon: Gamepad2 },
    { value: '7', label: 'Completed Games', icon: Trophy },
    { value: '996', label: 'Active Games', icon: TrendingUp },
    { value: '0.7%', label: 'Completion Rate', icon: AlertCircle },
  ];

  const topWinners = [
    {
      rank: 1,
      name: 'Matthew Rhoads',
      wins: 4,
      totalGames: 1003,
      winRate: '0.4%',
      lastPlayed: 'Today',
      medal: 'gold'
    },
    {
      rank: 2,
      name: 'Matthew R',
      wins: 3,
      totalGames: 988,
      winRate: '0.3%',
      lastPlayed: 'Today',
      medal: 'silver'
    },
    {
      rank: 3,
      name: 'George Costanza',
      wins: 0,
      totalGames: 13,
      winRate: '0%',
      lastPlayed: 'Today',
      medal: 'bronze'
    }
  ];

  const mostActive = [
    {
      rank: 1,
      name: 'Matthew Rhoads',
      totalGames: 1003,
      asPlayerOne: 809,
      asPlayerTwo: 194
    },
    {
      rank: 2,
      name: 'Matthew R',
      totalGames: 988,
      asPlayerOne: 182,
      asPlayerTwo: 806
    },
    {
      rank: 3,
      name: 'George Costanza',
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
            return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-300';
        case 'silver':
            return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300';
        case 'bronze':
            return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300';
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
            🏆 Coworking Game Leaderboard
          </h1>
          <p className="text-lg text-gray-600">Guess Who&apos;s Who in the Coworking Space!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-primary-500" />
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="text-gray-600 text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Top Winners */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-700 mb-6 flex items-center gap-2">
            <Trophy className="w-7 h-7" />
            Top Winners
          </h2>
          <div className="space-y-4">
            {topWinners.map((player) => (
              <div
                key={player.rank}
                className={`rounded-xl border p-6 transform transition-all duration-300 hover:translate-x-2 hover:shadow-lg ${getMedalStyles(player.medal as 'gold' | 'silver' | 'bronze')}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-gray-700">
                      {getRankEmoji(player.rank)}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{player.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {player.totalGames} games played • {player.winRate} win rate • Last played: {player.lastPlayed}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                      {player.wins}
                    </span>
                    <p className="text-sm text-gray-500 uppercase">Wins</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Players */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-700 mb-6 flex items-center gap-2">
            <Gamepad2 className="w-7 h-7" />
            Most Active Players
          </h2>
          <div className="space-y-4">
            {mostActive.map((player) => (
              <div
                key={player.rank}
                className="bg-gray-50 rounded-xl border border-gray-200 p-6 transform transition-all duration-300 hover:bg-gray-100 hover:shadow-lg hover:translate-x-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-700 bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center">
                      {player.rank}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{player.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {player.asPlayerOne} as Player 1 • {player.asPlayerTwo} as Player 2
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                      {player.totalGames}
                    </span>
                    <p className="text-sm text-gray-500 uppercase">Games</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-accent-50 to-accent-100 rounded-3xl border border-accent-300 p-8">
          <h3 className="text-2xl font-bold text-accent-800 mb-4 flex items-center gap-2">
            <Users className="w-7 h-7" />
            Game Insights
          </h3>
          <div className="space-y-3 text-gray-700">
            <p className="flex items-start gap-2">
              <span className="text-lg">🎯</span>
              <span>
                The game has an extremely low completion rate of{' '}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
                  0.7%
                </span>{' '}
                with 996 out of 1,004 games still active.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">🏃</span>
              <span>
                Matthew Rhoads is the most dedicated player with over 1,000 games started, though only 4 have been completed.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">🎲</span>
              <span>
                The game appears to be a &quot;Guess Who&quot; style game where players try to identify each other&apos;s target members from the coworking space.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                Most games seem to be abandoned rather than completed, suggesting either the game is very difficult or players lose interest.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLeaderboard;