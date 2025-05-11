'use client';
import { useState, useEffect } from 'react';

interface RealtimeIndicatorProps {
  lastUpdated?: string | Date; // Change type to accept both string and Date
  isMyTurn: boolean;
  isRealTimeActive?: boolean;
}

export default function RealtimeIndicator({ 
  lastUpdated, 
  isMyTurn,
  isRealTimeActive = true
}: RealtimeIndicatorProps) {
  const [countdown, setCountdown] = useState(30);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 30; // Reset to 30 seconds for auto-refresh
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Reset countdown when new data comes in
  useEffect(() => {
    setCountdown(30);
  }, [lastUpdated]);
  
  // Handle both string and Date types
  const lastUpdateTime = lastUpdated 
    ? lastUpdated instanceof Date
      ? lastUpdated.toLocaleTimeString()
      : new Date(lastUpdated).toLocaleTimeString() 
    : 'Never';
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500 mt-2">
      <div className="flex items-center">
        <div className={`h-2 w-2 rounded-full ${
          isRealTimeActive 
            ? isMyTurn ? 'bg-green-500' : 'bg-yellow-500'
            : 'bg-red-500'
        }`}></div>
        <span className="ml-2">
          {isRealTimeActive 
            ? isMyTurn ? 'Your turn' : "Opponent's turn"
            : 'Connectivity issues'}
        </span>
      </div>
      
      <div className="flex items-center mt-1 sm:mt-0">
        <span className="text-xs">
          {isRealTimeActive 
            ? `Auto-refresh in ${countdown}s`
            : 'Attempting to reconnect...'}
        </span>
        <button 
          onClick={() => window.location.reload()}
          className="ml-2 text-xs underline text-blue-500"
        >
          Refresh now
        </button>
      </div>
      
      <div className="text-xs mt-1 sm:mt-0 sm:ml-auto">
        Last updated: {lastUpdateTime}
      </div>
    </div>
  );
}