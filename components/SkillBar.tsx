

import React from 'react';
import { Skill } from '../types';
import { PERK_TREE } from './SkillTreeModal';

interface SkillBarProps {
  skill: Skill;
  onClick: () => void;
}

const SkillBar: React.FC<SkillBarProps> = ({ skill, onClick }) => {
  const progress = Math.min(100, (skill.xp / skill.maxXp) * 100);
  
  // Logic: Only show the "Points Available" dot if the player can AFFORD at least one unlocked perk
  const perks = PERK_TREE[skill.id] || [];
  const hasAffordablePerk = perks.some(perk => {
      const currentRank = skill.unlockedPerks.filter(id => id === perk.id).length;
      const maxRanks = perk.maxRanks || 1;
      const isMaxed = currentRank >= maxRanks;
      const canAfford = skill.points >= perk.cost;
      
      let prereqsMet = true;
      if (perk.prerequisites) {
          prereqsMet = perk.prerequisites.every(req => skill.unlockedPerks.includes(req));
      }
      
      return !isMaxed && prereqsMet && canAfford;
  });

  return (
    <div 
      onClick={onClick}
      className="group relative cursor-pointer select-none transform transition-all duration-200 hover:scale-[1.02] hover:bg-gray-800/50 p-3 rounded-lg border border-transparent hover:border-gray-700"
    >
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
            <span className="font-bold text-sm uppercase tracking-wider" style={{ color: skill.color }}>
               {skill.name}
            </span>
            <span className="text-[10px] bg-gray-950 text-gray-400 px-1.5 py-0.5 rounded border border-gray-800 font-mono">
                Lvl {skill.level}
            </span>
            
            {/* Unspent Points Indicator - Only if Affordable */}
            {hasAffordablePerk && (
             <div className="flex items-center ml-2 animate-bounce">
               <span className="bg-yellow-500 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)] flex items-center gap-1">
                 <span>+</span>
                 <span>{skill.points}</span>
               </span>
             </div>
           )}
        </div>
        <span className="text-xs text-gray-500 font-mono">
          {Math.floor(skill.xp)} / {skill.maxXp} XP
        </span>
      </div>
      
      {/* Bar Container */}
      <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-800 relative shadow-inner">
         {/* Background tint */}
         <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity`} style={{backgroundColor: skill.color}} />
         
         {/* Progress Bar */}
        <div
          className="h-full transition-all duration-500 ease-out relative"
          style={{ width: `${progress}%`, backgroundColor: skill.color }}
        >
            <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white opacity-50 shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
        </div>
      </div>

      {/* Hover Text (Leveling Info) */}
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded border border-gray-700 pointer-events-none z-20">
          <span className="text-[10px] text-gray-300 font-mono">{skill.levelingInfo}</span>
      </div>
    </div>
  );
};

export default SkillBar;