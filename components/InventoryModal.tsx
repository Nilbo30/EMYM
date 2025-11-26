

import React, { useState } from 'react';
import { Entity, EntityType, Rarity, PlayerEquipment } from '../types';
import EntityIcon from './EntityIcon';
import Tooltip from './Tooltip';

interface InventoryModalProps {
  inventory: Entity[];
  equipment: PlayerEquipment;
  gold: number;
  playerStats: {
      hp: number;
      maxHp: number;
      stamina: number;
      maxStamina: number;
      mana: number;
      maxMana: number;
  };
  knownEffects: string[];
  onClose: () => void;
  onEquip: (item: Entity) => void;
  onUnequip: (slot: keyof PlayerEquipment) => void;
  onEat: (item: Entity) => void;
  onDrop: (item: Entity) => void;
}

const SLOTS: { key: keyof PlayerEquipment; label: string }[] = [
    { key: 'mainHand', label: 'Main Hand' },
    { key: 'head', label: 'Head' },
    { key: 'body', label: 'Body' },
    { key: 'hands', label: 'Hands' },
    { key: 'feet', label: 'Feet' },
    { key: 'neck', label: 'Neck' },
    { key: 'accessory', label: 'Ring' }
];

const InventoryModal: React.FC<InventoryModalProps> = ({ inventory, equipment, gold, playerStats, knownEffects, onClose, onEquip, onUnequip, onEat, onDrop }) => {
  const [hoverInfo, setHoverInfo] = useState<{ entity: Entity, x: number, y: number } | null>(null);

  const getRarityColor = (rarity?: Rarity) => {
      switch(rarity) {
          case Rarity.EPIC: return 'text-purple-400 border-purple-500';
          case Rarity.RARE: return 'text-blue-400 border-blue-500';
          case Rarity.UNCOMMON: return 'text-green-400 border-green-500';
          default: return 'text-gray-400 border-gray-700';
      }
  };

  const renderItemCard = (item: Entity, actionButton: React.ReactNode, slotLabel?: string) => {
    const rarityClass = getRarityColor(item.rarity);
    return (
        <div 
            key={item.id} 
            className={`p-3 rounded bg-gray-800 border ${rarityClass.replace('text', 'border').split(' ')[1]} flex justify-between items-center group relative`}
            onMouseEnter={(e) => setHoverInfo({ entity: item, x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setHoverInfo({ entity: item, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoverInfo(null)}
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-gray-900 flex items-center justify-center" style={{color: item.color}}>
                    <EntityIcon entity={item} size="w-6 h-6" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                         <div className={`font-bold text-sm ${rarityClass.split(' ')[0]}`}>{item.name}</div>
                         {slotLabel && <span className="text-[10px] uppercase bg-gray-900 text-gray-500 px-1 rounded">{slotLabel}</span>}
                    </div>
                    <div className="text-xs text-gray-500 italic">{item.flavor}</div>
                    {item.equipmentStats && (
                        <div className="text-[10px] text-yellow-500 mt-1">
                            {item.equipmentStats.damage && `DMG +${item.equipmentStats.damage} `}
                            {item.equipmentStats.armor && `ARM +${item.equipmentStats.armor} `}
                            {item.equipmentStats.effect && `Effect: ${item.equipmentStats.effect}`}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {actionButton}
            </div>
        </div>
    );
  };

  const equippedItems = SLOTS.filter(slot => equipment[slot.key] !== null);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-slide-up relative">
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-lg flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Inventory & Equipment</h2>
                    <div className="flex gap-4 mt-1">
                        <span className={`text-xs ${inventory.length >= 10 ? 'text-red-500' : 'text-gray-400'}`}>
                            Capacity: {inventory.length} / 10
                        </span>
                        <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                             <div className="w-4 h-4"><EntityIcon type={EntityType.GOLD} /></div>
                             <span>{gold}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-900 space-y-6">
                
                {/* Equipped Section */}
                {equippedItems.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-1">Equipped Gear</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {equippedItems.map(slot => {
                                const item = equipment[slot.key]!;
                                return renderItemCard(
                                    item,
                                    <button 
                                        onClick={() => onUnequip(slot.key)}
                                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded font-bold border border-gray-600"
                                    >
                                        Unequip
                                    </button>,
                                    slot.label
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Backpack Section */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-1">Backpack</h3>
                    {inventory.length === 0 ? (
                        <div className="text-center text-gray-600 italic py-4">
                            Your bag is empty.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {inventory.map((item, index) => {
                                return renderItemCard(
                                    item,
                                    <div className="flex gap-2">
                                        {item.type === EntityType.EQUIPMENT && (
                                            <button 
                                                onClick={() => onEquip(item)}
                                                className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded font-bold"
                                            >
                                                Equip
                                            </button>
                                        )}
                                        {(item.type === EntityType.FOOD || item.type === EntityType.POTION || item.type === EntityType.RECALL_ORB) && (
                                            <button 
                                                onClick={() => onEat(item)}
                                                className="px-3 py-1 bg-orange-700 hover:bg-orange-600 text-white text-xs rounded font-bold"
                                            >
                                                Use
                                            </button>
                                        )}
                                        {item.type === EntityType.SCROLL && (
                                             <button 
                                                onClick={() => onEat(item)}
                                                className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white text-xs rounded font-bold"
                                            >
                                                Read
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => onDrop(item)}
                                            className="px-3 py-1 bg-red-900/50 hover:bg-red-800 text-red-300 text-xs rounded font-bold border border-red-900"
                                        >
                                            Drop
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
        {hoverInfo && (
            <Tooltip 
                entity={hoverInfo.entity} 
                position={{ x: hoverInfo.x, y: hoverInfo.y }} 
                playerStats={playerStats}
                knownEffects={knownEffects}
            />
        )}
    </div>
  );
};

export default InventoryModal;
