
import React from 'react';
import { Prize } from '../types';

interface PrizeInfoProps {
  prizes: Prize[];
}

const PrizeInfo: React.FC<PrizeInfoProps> = ({ prizes }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl px-4 py-6 bg-red-800/80 rounded-xl border-2 border-yellow-500/50 backdrop-blur-sm shadow-xl">
      {prizes.map((p) => (
        <div 
          key={p.id} 
          className={`flex flex-col items-center p-3 rounded-lg border border-yellow-500/30 ${p.remaining === 0 ? 'bg-gray-800 opacity-50' : 'bg-red-900/50'}`}
        >
          <span className="text-yellow-400 text-sm font-bold mb-1">{p.name.split(':')[0]}</span>
          <span className="text-white text-lg font-bold mb-2">{p.name}</span>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-16 bg-red-700 rounded-full overflow-hidden">
               <div 
                className="h-full bg-yellow-400 transition-all duration-500" 
                style={{ width: `${(p.remaining / p.total) * 100}%` }}
               />
            </div>
            <span className="text-yellow-200 text-sm font-mono">{p.remaining}/{p.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrizeInfo;
