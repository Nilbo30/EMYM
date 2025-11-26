
import React from 'react';
import { ActiveEffect, PotionEffect } from '../types';

export const EFFECT_DESCRIPTIONS: Record<PotionEffect, string> = {
    [PotionEffect.STRENGTH]: "Increases melee damage dealt.",
    [PotionEffect.WEAKNESS]: "Reduces melee damage dealt.",
    [PotionEffect.STONESKIN]: "Increases Armor rating.",
    [PotionEffect.FRAILTY]: "Reduces Armor rating.",
    [PotionEffect.HASTE]: "Increases chance to evade attacks.",
    [PotionEffect.SLOWNESS]: "Reduces chance to evade attacks.",
    [PotionEffect.REGEN]: "Restores Health over time.",
    [PotionEffect.POISON]: "Take damage every turn.",
    [PotionEffect.LIGHTNING_DMG_UP]: "Increases Electric damage dealt.",
    [PotionEffect.LIGHTNING_RES_DOWN]: "Reduces resistance to Electric damage.",
    [PotionEffect.FIRE_DMG_UP]: "Increases Fire damage dealt.",
    [PotionEffect.ICE_DMG_UP]: "Increases Ice damage dealt.",
    [PotionEffect.EARTH_DMG_UP]: "Increases Earth damage dealt.",
    [PotionEffect.WATER_DMG_UP]: "Increases Water damage dealt.",
    [PotionEffect.LIGHT_DMG_UP]: "Increases Light damage dealt.",
    [PotionEffect.DARK_DMG_UP]: "Increases Dark damage dealt."
};

interface EffectTooltipProps {
  effect: ActiveEffect;
  position: { x: number; y: number };
}

const EffectTooltip: React.FC<EffectTooltipProps> = ({ effect, position }) => {
  const description = EFFECT_DESCRIPTIONS[effect.type] || "Unknown effect.";

  const isRightSide = position.x > (window.innerWidth * 0.7);

  const style: React.CSSProperties = {
      top: position.y + 15,
      left: isRightSide ? position.x - 15 : position.x + 15,
      transform: isRightSide ? 'translateX(-100%)' : 'none'
  };

  return (
    <div 
      className="fixed z-[100] pointer-events-none animate-fade-in"
      style={style}
    >
      <div className={`bg-gray-900/95 border rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] p-3 min-w-[200px] backdrop-blur ${effect.isNegative ? 'border-red-500/50 shadow-red-900/20' : 'border-green-500/50 shadow-green-900/20'}`}>
        <div className="font-bold text-sm mb-1 text-white flex items-center justify-between">
            <span>{effect.name}</span>
            <span className={`text-[9px] uppercase px-1 rounded border ${effect.isNegative ? 'border-red-500 text-red-400' : 'border-green-500 text-green-400'}`}>
                {effect.isNegative ? 'Debuff' : 'Buff'}
            </span>
        </div>
        <div className="text-xs text-gray-300 mb-3 italic">{description}</div>
        
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 uppercase text-[10px] font-bold">Duration</span>
                <span className="font-mono text-white">{effect.duration} Floors</span>
            </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 uppercase text-[10px] font-bold">Magnitude</span>
                <span className="font-mono text-white">{effect.magnitude}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EffectTooltip;