'use client';
import { useState, useEffect } from 'react';

interface RealtimeIndicatorProps {
  lastUpdated?: string;
  isMyTurn: boolean;
}

export default function RealtimeIndicator({ lastUpdated, isMyTurn }: RealtimeIndicatorProps) {
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 5;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Reset countdown when new data comes in
  useEffect(() => {
    setCountdown(5);
  }, [lastUpdated]);
  
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
      <div className={`h-2 w-2 rounded-full ${isMyTurn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      <span>{isMyTurn ? 'Your turn' : "Opponent's turn"}</span>
      <span className="text-xs">
        (Updates in {countdown}s)
      </span>
      {lastUpdated && (
        <span className="text-xs">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}