
import React, { useState } from 'react';
import { GameState, Skill, Material, Entity, PotionEffect } from '../types';

interface CharacterSheetModalProps {
  gameState: GameState;
  stats: {
    damage: number;
    armor: number;
    evasion: number;
    critChance: number;
    visionRadius: number;
    fireRes: number;
    iceRes: number;
    electricRes: number;
    earthRes: number;
    waterRes: number;
    lightRes: number;
    darkRes: number;
  };
  onClose: () => void;
}

const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({ gameState, stats, onClose }) => {
  const { player } = gameState;
  const [hoveredStat, setHoveredStat] = useState<{
      label: string;
      sources: { name: string, value: string, color?: string }[];
      x: number;
      y: number;
  } | null>(null);

  const getStatBreakdown = (statKey: string) => {
      const sources: { name: string, value: string, color?: string }[] = [];
      const { skills, equipment, hp, maxHp, activeEffects } = player;

      if (statKey === 'damage') {
          sources.push({ name: 'Base', value: '1' });
          
          (Object.values(equipment) as (Entity | null)[]).forEach(item => {
              if (item?.equipmentStats?.damage) {
                   sources.push({ name: item.name, value: `+${item.equipmentStats.damage}`, color: 'text-yellow-400' });
              }
          });

          // Perks
          if (skills.combat) {
              const heavyHitter = skills.combat.unlockedPerks.filter(p => p === 'heavy_hitter').length;
              if (heavyHitter) sources.push({ name: 'Perk: Heavy Hitter', value: `+${heavyHitter * 2}`, color: 'text-blue-400' });

              const grip = skills.combat.unlockedPerks.filter(p => p === 'grip').length;
              if (grip) sources.push({ name: 'Perk: Grip', value: `+${grip}`, color: 'text-blue-400' });
          }

          if (skills.weaponry) {
              const stance = skills.weaponry.unlockedPerks.filter(p => p === 'stance').length;
              if (stance) sources.push({ name: 'Perk: Stance', value: `+${stance}`, color: 'text-blue-400' });
          }

          if (!equipment.mainHand && skills.fist) {
              const knuckles = skills.fist.unlockedPerks.filter(p => p === 'knuckles').length;
              if (knuckles) sources.push({ name: 'Perk: Knuckles', value: `+${knuckles}`, color: 'text-blue-400' });
          }
          
          if (equipment.mainHand?.material === Material.WOOD && skills.woodworking) {
              const val = skills.woodworking.unlockedPerks.filter(p => p === 'whittle').length;
              if (val) sources.push({ name: 'Perk: Whittle', value: `+${val}`, color: 'text-blue-400' });
          }

          if (skills.fire_magic?.unlockedPerks.includes('ember')) {
               const val = skills.fire_magic.unlockedPerks.filter(p => p === 'ember').length;
               sources.push({ name: 'Perk: Ember', value: `+${val}`, color: 'text-orange-400' });
          }
          
          if (equipment.neck && skills.amulet_mastery) {
              const val = skills.amulet_mastery.unlockedPerks.filter(p => p === 'attunement').length;
              if (val) sources.push({ name: 'Perk: Attunement', value: `+${val}`, color: 'text-pink-400' });
          }
          
          if (skills.cooking) {
            const feastRank = skills.cooking.unlockedPerks.filter(p => p === 'feast').length;
            if (feastRank > 0 && player.stamina === player.maxStamina) {
                sources.push({ name: 'Perk: Feast', value: `+${feastRank}`, color: 'text-orange-400' });
            }
          }
      }

      if (statKey === 'armor') {
           sources.push({ name: 'Base', value: '0' });
           (Object.values(equipment) as (Entity | null)[]).forEach(item => {
              if (item?.equipmentStats?.armor) {
                   sources.push({ name: item.name, value: `+${item.equipmentStats.armor}`, color: 'text-yellow-400' });
              }
          });
          if (skills.defense) {
            const thickSkin = skills.defense.unlockedPerks.filter(p => p === 'thick_skin').length;
            if (thickSkin) sources.push({ name: 'Perk: Thick Skin', value: `+${thickSkin}`, color: 'text-blue-400' });
          }
          
          if (skills.combat) {
            const guard = skills.combat.unlockedPerks.filter(p => p === 'guard').length;
            if (guard) sources.push({ name: 'Perk: Guard', value: `+${guard}`, color: 'text-blue-400' });
          }

          if (!equipment.mainHand && skills.fist) {
              const ironFist = skills.fist.unlockedPerks.filter(p => p === 'iron_fist').length;
              if (ironFist) sources.push({ name: 'Perk: Iron Skin', value: `+${ironFist}`, color: 'text-blue-400' });
          }
      }

      if (statKey === 'evasion') {
           sources.push({ name: 'Base', value: '5%' });
           if (skills.athletics) {
              const reflexes = skills.athletics.unlockedPerks.filter(p => p === 'evasion').length;
              if (reflexes) sources.push({ name: 'Perk: Reflexes', value: `+${reflexes}%`, color: 'text-blue-400' });
           }
      }

      if (statKey === 'crit') {
           sources.push({ name: 'Base', value: '5%' });
           if (skills.weaponry) {
              const precision = skills.weaponry.unlockedPerks.filter(p => p === 'crit_master').length; 
              if (precision > 0) {
                  sources.push({ name: 'Perk: Precision', value: `+${precision}%`, color: 'text-blue-400' });
              }
           }
          
          if (!equipment.mainHand && skills.fist) {
               const brawler = skills.fist.unlockedPerks.filter(p => p === 'brawler').length;
               if (brawler > 0) sources.push({ name: 'Perk: Brawler', value: `+${brawler * 2}%`, color: 'text-blue-400' });
          }
      }

      if (statKey === 'vision') {
          sources.push({ name: 'Base', value: '6' });
          if (skills.perception) {
              const keenEye = skills.perception.unlockedPerks.filter(p => p === 'keen_eye').length;
              if (keenEye > 0) {
                  sources.push({ name: 'Perk: Keen Eye', value: `+${(keenEye * 0.2).toFixed(1)}`, color: 'text-blue-400' });
              }
          }
      }

      return sources;
  }

  const handleMouseEnter = (e: React.MouseEvent, label: string, statKey: string) => {
      const sources = getStatBreakdown(statKey);
      if (sources.length > 0) {
          setHoveredStat({ label, sources, x: e.clientX, y: e.clientY });
      }
  };

  const handleMouseLeave = () => setHoveredStat(null);

  const StatRow = ({ label, value, subtext, statKey }: { label: string, value: string | number, subtext?: string, statKey?: string }) => (
    <div 
        className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 px-2 -mx-2 rounded transition-colors cursor-help relative"
        onMouseEnter={(e) => statKey ? handleMouseEnter(e, label, statKey) : undefined}
        onMouseLeave={handleMouseLeave}
    >
        <span className="text-gray-400 text-sm border-b border-dashed border-gray-700">{label}</span>
        <div className="text-right">
            <div className="font-mono font-bold text-white">{value}</div>
            {subtext && <div className="text-[10px] text-gray-500">{subtext}</div>}
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-up relative">
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-lg flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        Character Sheet
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">Overview of your capabilities</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-700 pb-2">Combat Statistics</h3>
                        <StatRow label="Attack Damage" value={stats.damage} subtext="Base + Weapon + Perks" statKey="damage" />
                        <StatRow label="Armor Rating" value={stats.armor} subtext="Equipment + Perks" statKey="armor" />
                        <StatRow label="Evasion Chance" value={`${(stats.evasion * 100).toFixed(1)}%`} subtext="Base + Agility" statKey="evasion" />
                        <StatRow label="Crit Chance" value={`${(stats.critChance * 100).toFixed(0)}%`} statKey="crit" />
                        <StatRow label="Vision Radius" value={stats.visionRadius.toFixed(1)} subtext="Tiles" statKey="vision" />
                        
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-6 mb-4 border-b border-gray-700 pb-2">Resistances</h3>
                        <StatRow label="Fire Res" value={`${(stats.fireRes * 100).toFixed(0)}%`} statKey="fireRes" />
                        <StatRow label="Ice Res" value={`${(stats.iceRes * 100).toFixed(0)}%`} statKey="iceRes" />
                        <StatRow label="Electric Res" value={`${(stats.electricRes * 100).toFixed(0)}%`} statKey="electricRes" />
                        <StatRow label="Earth Res" value={`${(stats.earthRes * 100).toFixed(0)}%`} statKey="earthRes" />
                        <StatRow label="Water Res" value={`${(stats.waterRes * 100).toFixed(0)}%`} statKey="waterRes" />
                        <StatRow label="Light Res" value={`${(stats.lightRes * 100).toFixed(0)}%`} statKey="lightRes" />
                        <StatRow label="Dark Res" value={`${(stats.darkRes * 100).toFixed(0)}%`} statKey="darkRes" />
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-700 pb-2">Skill Mastery</h3>
                        <div className="space-y-2">
                            {(Object.values(player.skills) as Skill[])
                            .filter(skill => skill.xp > 0 || skill.level > 1 || skill.id === 'global')
                            .map(skill => (
                                <div key={skill.id} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: skill.color }}></span>
                                        {skill.name}
                                    </span>
                                    <span className="font-mono text-gray-300">Lvl {skill.level}</span>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-6 mb-4 border-b border-gray-700 pb-2">Passive Perks</h3>
                        <div className="flex flex-wrap gap-2">
                             {player.skills.global?.unlockedPerks.includes('fast_learner') && <span className="text-[10px] bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-800">Fast Learner</span>}
                             {player.skills.global?.unlockedPerks.includes('auto_explorer') && <span className="text-[10px] bg-red-900/30 text-red-300 px-2 py-1 rounded border border-red-800">Auto Explorer</span>}
                             {player.skills.athletics?.unlockedPerks.includes('dash') && <span className="text-[10px] bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-800">Dash</span>}
                             {player.skills.recovery?.unlockedPerks.includes('regeneration') && <span className="text-[10px] bg-green-900/30 text-green-300 px-2 py-1 rounded border border-green-800">Regen</span>}
                             {player.skills.perception?.unlockedPerks.includes('night_eyes') && <span className="text-[10px] bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded border border-yellow-800">Night Eyes</span>}
                        </div>
                    </div>
                </div>
            </div>

            {hoveredStat && (
                <div 
                    className="fixed z-[100] p-3 bg-gray-950 border border-gray-600 rounded shadow-2xl pointer-events-none w-64 animate-fade-in"
                    style={{ 
                        top: hoveredStat.y + 10, 
                        left: hoveredStat.x > (window.innerWidth * 0.7) ? hoveredStat.x - 10 : hoveredStat.x + 10,
                        transform: hoveredStat.x > (window.innerWidth * 0.7) ? 'translateX(-100%)' : 'none'
                    }}
                >
                    <h4 className="text-sm font-bold text-white mb-2 border-b border-gray-800 pb-1">{hoveredStat.label} Breakdown</h4>
                    <div className="space-y-1">
                        {hoveredStat.sources.map((s, i) => (
                            <div key={i} className="flex justify-between text-xs items-center">
                                <span className="text-gray-400">{s.name}</span>
                                <span className={`font-mono font-bold ${s.color || 'text-gray-200'}`}>{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default CharacterSheetModal;
