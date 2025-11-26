import React from 'react';

interface BankerModalProps {
  currentGold: number;
  bankedGold: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onClose: () => void;
}

const BankerModal: React.FC<BankerModalProps> = ({ currentGold, bankedGold, onDeposit, onWithdraw, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-yellow-600 rounded-lg shadow-2xl w-full max-w-lg flex flex-col animate-slide-up">
            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-yellow-900/20 to-gray-900 rounded-t-lg flex justify-between items-center">
                <h2 className="text-xl font-bold text-yellow-500">Royal Bank</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-2">✕</button>
            </div>

            <div className="p-6">
                <p className="text-gray-400 text-sm mb-6 italic text-center">
                    "Deposited gold is safe from death and earns <span className="text-green-400 font-bold">10% interest</span> at the start of every new run."
                </p>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="text-center p-4 bg-gray-800 rounded border border-gray-700">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">On Hand</div>
                        <div className="text-2xl font-mono text-white">{currentGold} <span className="text-yellow-500">$</span></div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded border border-yellow-700/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none"></div>
                        <div className="text-xs text-yellow-600 uppercase font-bold mb-1">In Bank</div>
                        <div className="text-2xl font-mono text-yellow-400">{bankedGold} <span className="text-yellow-500">$</span></div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Deposit Controls */}
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500 w-16 uppercase font-bold">Deposit</span>
                        <button 
                            onClick={() => onDeposit(10)} 
                            disabled={currentGold < 10}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold py-2 rounded border border-gray-600"
                        >
                            10
                        </button>
                        <button 
                            onClick={() => onDeposit(100)} 
                            disabled={currentGold < 100}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold py-2 rounded border border-gray-600"
                        >
                            100
                        </button>
                        <button 
                            onClick={() => onDeposit(currentGold)} 
                            disabled={currentGold === 0}
                            className="flex-1 bg-yellow-900/30 hover:bg-yellow-900/50 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold py-2 rounded border border-yellow-800 text-yellow-500"
                        >
                            All
                        </button>
                    </div>

                    {/* Withdraw Controls */}
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500 w-16 uppercase font-bold">Withdraw</span>
                        <button 
                            onClick={() => onWithdraw(10)} 
                            disabled={bankedGold < 10}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold py-2 rounded border border-gray-600"
                        >
                            10
                        </button>
                        <button 
                            onClick={() => onWithdraw(100)} 
                            disabled={bankedGold < 100}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold py-2 rounded border border-gray-600"
                        >
                            100
                        </button>
                        <button 
                            onClick={() => onWithdraw(bankedGold)} 
                            disabled={bankedGold === 0}
                            className="flex-1 bg-yellow-900/30 hover:bg-yellow-900/50 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold py-2 rounded border border-yellow-800 text-yellow-500"
                        >
                            All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BankerModal;