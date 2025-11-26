import React from 'react';
import { Entity, EntityType, EquipmentSlot, Rarity, PlayerEquipment } from '../types';
import EntityIcon from './EntityIcon';

interface TooltipProps {
  entity: Entity;
  position: { x: number; y: number };
  playerEquipment?: PlayerEquipment;
  playerStats?: { hp: number; maxHp: number; stamina: number; maxStamina: number; mana?: number; maxMana?: number; };
  knownEffects?: string[]; // New Prop
}

const Tooltip: React.FC<TooltipProps> = ({ entity, position, playerEquipment, playerStats, knownEffects = [] }) => {
  if (!entity) return null;

  const isItem = entity.type === EntityType.ITEM || entity.type === EntityType.EQUIPMENT || entity.type === EntityType.FOOD || entity.type === EntityType.POTION || entity.type === EntityType.RECALL_ORB || entity.type === EntityType.SCROLL;
  const isEnemy = entity.type === EntityType.ENEMY;

  let statsText = '';
  // ... (keep existing statsText logic) ...
  if (entity.type === EntityType.EQUIPMENT && entity.equipmentStats) {
      if (entity.equipmentStats.damage) statsText = `Damage: +${entity.equipmentStats.damage}`;
      if (entity.equipmentStats.armor) statsText = `Armor: +${entity.equipmentStats.armor}`;
      if (entity.equipmentStats.effect) statsText = `Effect: ${entity.equipmentStats.effect}`;
      if (entity.equipmentStats.element) statsText += ` (${entity.equipmentStats.element} Dmg)`;
  } else if (entity.type === EntityType.FOOD) {
      statsText = entity.flavor || '';
  } else if (entity.type === EntityType.POTION) {
      if (entity.potionEffect) {
          if (knownEffects.includes(entity.potionEffect)) {
             // Reveal Effect Name
             statsText = entity.potionEffect.replace(/_/g, " ");
             if (entity.magnitude) statsText += ` (Lvl ${entity.magnitude})`;
          } else {
             statsText = "Unknown Effect";
          }
      } else {
          statsText = entity.flavor || '';
      }
  } else if (isEnemy) {
      statsText = `HP: ${entity.hp} / ${entity.maxHp}`;
  } else if (entity.type === EntityType.RECALL_ORB) {
      statsText = "Returns to Sanctuary";
  } else if (entity.type === EntityType.SCROLL) {
      if (entity.scrollEffect && knownEffects.includes(entity.scrollEffect)) {
           statsText = entity.scrollEffect.replace(/_/g, " ");
           if (entity.magnitude) statsText += ` (Pow ${entity.magnitude})`;
      } else {
           statsText = "Unidentified Magic";
      }
  }

  // ... (keep existing bonusText/comparison logic) ...
  let equippedComparison: Entity | null = null;
  let comparisonText: React.ReactNode = null;
  let statusText: React.ReactNode = null;
  let bonusText: React.ReactNode = null;

  if (entity.type === EntityType.EQUIPMENT && entity.equipmentStats) {
      // Re-implement bonusText construction since it was cut off in thought process
      const stats = entity.equipmentStats;
      const bonuses = [];
      if (stats.bonusDodge) bonuses.push(`+${(stats.bonusDodge * 100).toFixed(0)}% Dodge`);
      if (stats.bonusDoubleStrike) bonuses.push(`+${(stats.bonusDoubleStrike * 100).toFixed(0)}% Double Strike`);
      if (stats.bonusCrit) bonuses.push(`+${(stats.bonusCrit * 100).toFixed(0)}% Crit`);
      if (stats.bonusHp) bonuses.push(`+${stats.bonusHp} Max HP`);
      if (stats.bonusStamina) bonuses.push(`+${stats.bonusStamina} Max Stamina`);
      
      if (stats.fireRes) bonuses.push(`+${(stats.fireRes * 100).toFixed(0)}% Fire Res`);
      if (stats.iceRes) bonuses.push(`+${(stats.iceRes * 100).toFixed(0)}% Ice Res`);
      if (stats.electricRes) bonuses.push(`+${(stats.electricRes * 100).toFixed(0)}% Elec Res`);
      if (stats.earthRes) bonuses.push(`+${(stats.earthRes * 100).toFixed(0)}% Earth Res`);
      if (stats.waterRes) bonuses.push(`+${(stats.waterRes * 100).toFixed(0)}% Water Res`);
      if (stats.lightRes) bonuses.push(`+${(stats.lightRes * 100).toFixed(0)}% Light Res`);
      if (stats.darkRes) bonuses.push(`+${(stats.darkRes * 100).toFixed(0)}% Dark Res`);

      if (stats.elementalAffixes) {
          stats.elementalAffixes.forEach(affix => {
              bonuses.push(`${(affix.chance * 100).toFixed(0)}% Chance ${affix.minDmg}-${affix.maxDmg} ${affix.element} Dmg`);
          });
      }

      if (bonuses.length > 0) {
          bonusText = (
              <div className="text-[10px] text-green-400 mt-1 border-t border-gray-800 pt-1">
                  {bonuses.map((b, i) => <div key={i}>{b}</div>)}
              </div>
          );
      }

       // Comparison Logic
      if (playerEquipment) {
          const slot = entity.equipmentStats.slot;
          let equippedKey: keyof PlayerEquipment | null = null;
          
          if (slot === EquipmentSlot.MAIN_HAND) equippedKey = 'mainHand';
          else if (slot === EquipmentSlot.BODY) equippedKey = 'body';
          else if (slot === EquipmentSlot.HEAD) equippedKey = 'head';
          else if (slot === EquipmentSlot.HANDS) equippedKey = 'hands';
          else if (slot === EquipmentSlot.FEET) equippedKey = 'feet';
          else if (slot === EquipmentSlot.NECK) equippedKey = 'neck';
          else if (slot === EquipmentSlot.ACCESSORY) equippedKey = 'accessory';
          
          if (equippedKey && playerEquipment[equippedKey]) {
              equippedComparison = playerEquipment[equippedKey];
          }
          
          if (equippedComparison && equippedComparison.equipmentStats) {
              const newDmg = entity.equipmentStats.damage || 0;
              const oldDmg = equippedComparison.equipmentStats.damage || 0;
              const newArm = entity.equipmentStats.armor || 0;
              const oldArm = equippedComparison.equipmentStats.armor || 0;
              
              const diffDmg = newDmg - oldDmg;
              const diffArm = newArm - oldArm;
              
              if (diffDmg !== 0 || diffArm !== 0) {
                 comparisonText = (
                     <div className="mt-1 pt-1 border-t border-gray-700 text-[10px] font-mono">
                        {diffDmg !== 0 && (
                            <div className={diffDmg > 0 ? 'text-green-400' : 'text-red-400'}>
                                {diffDmg > 0 ? '+' : ''}{diffDmg} Dmg
                            </div>
                        )}
                        {diffArm !== 0 && (
                            <div className={diffArm > 0 ? 'text-green-400' : 'text-red-400'}>
                                {diffArm > 0 ? '+' : ''}{diffArm} Arm
                            </div>
                        )}
                     </div>
                 )
              }
          }
      }
  }

  // Food/Potion Status Preview
  if (entity.type === EntityType.FOOD && playerStats) {
       statusText = <div className="text-[10px] text-orange-400 mt-1">Stamina: {playerStats.stamina}/{playerStats.maxStamina}</div>
  } else if (entity.type === EntityType.POTION && !entity.potionEffect && playerStats) {
       statusText = <div className="text-[10px] text-red-400 mt-1">HP: {playerStats.hp}/{playerStats.maxHp}</div>
  } else if (entity.type === EntityType.POTION && entity.potionEffect) {
       if (knownEffects.includes(entity.potionEffect)) {
           statusText = <div className="text-[10px] text-teal-400 mt-1">Effect Known</div>;
       } else {
           statusText = <div className="text-[10px] text-teal-400 mt-1">Effect: ???</div>;
       }
  }
  else if (isEnemy && entity.combatStats?.attackElement) {
       bonusText = <div className="text-[10px] text-purple-400 mt-1">Deals {entity.combatStats.attackElement} Damage</div>;
  }

  const getRarityColor = (rarity?: Rarity) => {
      switch(rarity) {
          case Rarity.EPIC: return 'text-purple-400 border-purple-500';
          case Rarity.RARE: return 'text-blue-400 border-blue-500';
          case Rarity.UNCOMMON: return 'text-green-400 border-green-500';
          default: return 'text-gray-400 border-gray-700';
      }
  };

  const rarityClass = getRarityColor(entity.rarity);

  const isRightSide = position.x > (window.innerWidth * 0.7);

  const style: React.CSSProperties = {
      top: position.y + 15,
      left: isRightSide ? position.x - 15 : position.x + 15,
      transform: isRightSide ? 'translateX(-100%)' : 'none'
  };

  return (
    <div 
      className="fixed z-50 pointer-events-none animate-fade-in"
      style={style}
    >
      <div className={`bg-gray-900/95 border rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] p-3 min-w-[200px] backdrop-blur ${entity.rarity === Rarity.EPIC ? 'border-purple-500/50 shadow-purple-900/20' : entity.rarity === Rarity.RARE ? 'border-blue-500/50 shadow-blue-900/20' : entity.rarity === Rarity.UNCOMMON ? 'border-green-500/50 shadow-green-900/20' : 'border-gray-700'}`}>
        <div className="flex justify-between items-start mb-1 gap-2">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6" style={{ color: entity.color }}>
                    <EntityIcon entity={entity} />
                </div>
                <h4 className="font-bold text-sm" style={{ color: entity.color }}>{entity.name}</h4>
            </div>
            {entity.rarity && (
                 <span className={`text-[9px] uppercase px-1 py-0.5 rounded border ${rarityClass.replace('text', 'border').split(' ')[1]} ${rarityClass.split(' ')[0]}`}>
                     {entity.rarity}
                 </span>
            )}
        </div>
        
        <div className="text-[10px] uppercase text-gray-500 mb-1 flex justify-between">
            <span>
                {entity.type === EntityType.EQUIPMENT && entity.equipmentStats ? entity.equipmentStats.slot.replace('_', ' ') : entity.type.replace('_', ' ')}
            </span>
        </div>
        
        {statsText && (
            <div className="text-xs font-mono text-yellow-500 mb-1 border-b border-gray-800 pb-1">
                {statsText}
            </div>
        )}
        
        {bonusText}
        {comparisonText}
        {statusText}

        <div className="text-xs text-gray-400 italic mt-1">
             {entity.flavor || (isEnemy ? "A dangerous foe." : "An object of interest.")}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;