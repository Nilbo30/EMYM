
import React from 'react';
import { Entity, EntityType, Rarity } from '../types';
import EntityIcon from './EntityIcon';

interface StorageModalProps {
  inventory: Entity[];
  storage: Entity[];
  onClose: () => void;
  onDeposit: (item: Entity) => void;
  onWithdraw: (item: Entity) => void;
}

const getRarityColor = (rarity?: Rarity) => {
    switch(rarity) {
        case Rarity.EPIC: return 'text-purple-400 border-purple-500';
        case Rarity.RARE: return 'text-blue-400 border-blue-500';
        case Rarity.UNCOMMON: return 'text-green-400 border-green-500';
        default: return 'text-gray-400 border-gray-700';
    }
};

const ItemRow: React.FC<{ item: Entity, actionLabel: string, onAction: () => void }> = ({ item, actionLabel, onAction }) => {
    const rarityClass = getRarityColor(item.rarity);
    return (
      <div className={`p-2 rounded bg-gray-800 border ${rarityClass.replace('text', 'border').split(' ')[1]} flex justify-between items-center group mb-2`}>
          <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center" style={{color: item.color}}>
                  <EntityIcon entity={item} size="w-5 h-5" />
              </div>
              <div>
                  <div className={`font-bold text-xs ${rarityClass.split(' ')[0]}`}>{item.name}</div>
              </div>
          </div>
          <button 
              onClick={onAction}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-[10px] rounded font-bold uppercase"
          >
              {actionLabel}
          </button>
      </div>
    );
};

const StorageModal: React.FC<StorageModalProps> = ({ inventory, storage, onClose, onDeposit, onWithdraw }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col h-[70vh] animate-slide-up">
            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-lg flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Hub Storage</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-2">✕</button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* INVENTORY SIDE */}
                <div className="flex-1 p-4 border-r border-gray-800 overflow-y-auto">
                    <h3 className="text-gray-500 uppercase text-xs font-bold mb-4 flex justify-between">
                        <span>Your Inventory</span>
                        <span>{inventory.length}/10</span>
                    </h3>
                    {inventory.length === 0 ? <p className="text-gray-600 italic text-sm">Empty</p> : 
                        inventory.map((item, idx) => (
                            <ItemRow key={item.id + idx} item={item} actionLabel="Deposit >" onAction={() => onDeposit(item)} />
                        ))
                    }
                </div>

                {/* STORAGE SIDE */}
                <div className="flex-1 p-4 overflow-y-auto bg-black/20">
                     <h3 className="text-gray-500 uppercase text-xs font-bold mb-4">Chest Storage</h3>
                     {storage.length === 0 ? <p className="text-gray-600 italic text-sm">Empty</p> : 
                        storage.map((item, idx) => (
                            <ItemRow key={item.id + idx} item={item} actionLabel="< Withdraw" onAction={() => onWithdraw(item)} />
                        ))
                    }
                </div>
            </div>
        </div>
    </div>
  );
};

export default StorageModal;