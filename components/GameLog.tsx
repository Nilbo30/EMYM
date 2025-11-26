import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface GameLogProps {
  logs: LogEntry[];
}

const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-gray-900/50 border-t border-gray-800 backdrop-blur-sm">
      <div className="px-4 py-2 bg-gray-950 border-b border-gray-800 text-xs font-mono text-gray-500 uppercase tracking-widest">
        Journal
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-sm scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {logs.length === 0 && (
           <div className="text-gray-600 italic text-center mt-10">The dungeon awaits...</div>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            className={`
              animate-slide-up py-0.5
              ${log.type === 'combat' ? 'text-red-400' : ''}
              ${log.type === 'gain' ? 'text-green-400' : ''}
              ${log.type === 'info' || log.type === 'narrative' ? 'text-gray-400' : ''}
              ${log.type === 'danger' ? 'text-orange-500' : ''}
            `}
          >
            <span className="opacity-30 mr-2 text-xs">[{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, minute:'2-digit', second:'2-digit'})}]</span>
            {log.message}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default GameLog;