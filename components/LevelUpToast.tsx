
import React from 'react';
import { Skill } from '../types';

interface LevelUpToastProps {
  skill: Skill;
  onOpen: () => void;
  onClose: () => void;
}

const LevelUpToast: React.FC<LevelUpToastProps> = ({ skill, onOpen, onClose }) => {
  return (
    <div 
      className="fixed bottom-8 right-8 z-50 animate-slide-up cursor-pointer"
      onClick={onOpen}
    >
      <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg shadow-2xl p-4 flex items-center gap-4 hover:bg-gray-800 transition-colors relative overflow-hidden group w-80">
        <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
        
        <div className="flex flex-col relative z-10 flex-1">
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Level Up!</span>
            <span className="text-white font-bold text-lg" style={{ color: skill.color }}>{skill.name} &rarr; Lvl {skill.level}</span>
            <span className="text-gray-400 text-xs mt-1">+1 Mastery Point Available</span>
        </div>
        
        <div className="relative z-10 bg-gray-800 p-2 rounded-full border border-gray-600 group-hover:border-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
        </div>

        <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-1 right-1 text-gray-600 hover:text-white p-1 z-20 hover:bg-gray-700 rounded"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default LevelUpToast;
