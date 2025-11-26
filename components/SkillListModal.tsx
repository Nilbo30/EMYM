
import React, { useEffect, useRef } from 'react';
import { Skill } from '../types';
import SkillBar from './SkillBar';

interface SkillListModalProps {
  skills: Record<string, Skill>;
  onSelectSkill: (id: string) => void;
  onClose: () => void;
}

const SkillListModal: React.FC<SkillListModalProps> = ({ skills, onSelectSkill, onClose }) => {
  
  // Filter skills: Show only if XP > 0, Level > 1, or it's the Global skill
  const visibleSkills = (Object.values(skills) as Skill[]).filter(s => s.xp > 0 || s.level > 1 || s.id === 'global');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[80vh] animate-fade-in">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950 rounded-t-lg">
                <div>
                    <h2 className="text-2xl font-bold text-white">Character Skills</h2>
                    <p className="text-gray-400 text-xs mt-1">Select a skill to view its Mastery Tree</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900 rounded-b-lg">
                {visibleSkills.length === 0 ? (
                    <div className="col-span-2 text-center text-gray-500 italic py-10">
                        You have not discovered any skills yet. Explore the world to learn.
                    </div>
                ) : (
                    visibleSkills.map((skill) => (
                        <SkillBar 
                            key={skill.id} 
                            skill={skill} 
                            onClick={() => onSelectSkill(skill.id)} 
                        />
                    ))
                )}
            </div>
        </div>
    </div>
  );
};

export default SkillListModal;