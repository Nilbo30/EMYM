
import React, { useEffect, useRef } from 'react';
import { DungeonLevel, EntityType, Position } from '../types';

interface MiniMapProps {
  dungeon: DungeonLevel;
  playerPosition: Position;
  hasTracker?: boolean;
}

const MiniMap: React.FC<MiniMapProps> = ({ dungeon, playerPosition, hasTracker }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 3; // Size of each tile in pixels
    canvas.width = dungeon.width * cellSize;
    canvas.height = dungeon.height * cellSize;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        // Only draw explored tiles
        if (dungeon.explored[y][x] || dungeon.isHub) {
            const tile = dungeon.tiles[y][x];
            
            if (x === playerPosition.x && y === playerPosition.y) {
                ctx.fillStyle = '#ef4444'; // Player Red
            } else if (tile === EntityType.WALL) {
                ctx.fillStyle = '#4b5563'; // Gray Wall
            } else {
                ctx.fillStyle = '#1f2937'; // Dark Floor
            }

            // Draw specific important entities on map
            const entity = dungeon.entities.find(e => e.position.x === x && e.position.y === y);
            
            if (entity) {
                if (hasTracker) {
                    // Tracker Colors - Shows EVERYTHING relevant
                    if (entity.type === EntityType.ENEMY) {
                        ctx.fillStyle = '#ef4444'; // Red for Monster
                    } else if (entity.type === EntityType.STAIRS || entity.type === EntityType.PORTAL) {
                         ctx.fillStyle = '#3b82f6'; // Blue for Stairs/Exit
                    } else if (entity.type === EntityType.CHEST || entity.type === EntityType.GOLD || entity.type === EntityType.EQUIPMENT || entity.type === EntityType.ITEM || entity.type === EntityType.SCROLL || entity.type === EntityType.POTION || entity.type === EntityType.FOOD) {
                         ctx.fillStyle = '#facc15'; // Yellow for Loot
                    } else if (entity.type === EntityType.TRAP && !entity.isHidden) {
                        ctx.fillStyle = '#7f1d1d'; // Dark Red for visible trap
                    }
                } else {
                    // Standard Visibility (Without Tracker)
                    // Only show structural/critical things, no Loot/Enemies
                    if (entity.type === EntityType.STAIRS || entity.type === EntityType.PORTAL) {
                        // Even Stairs might be hidden without tracker based on prompt "mini map montre ... l'escalier une fois découvert"
                        // But usually, stairs are static. Let's assume Tracker is needed for highlighting them on the map specifically.
                        // We will allow stairs to be faintly visible or wall colored if no tracker, 
                        // but to strictly follow "Show stairs once discovered" via perk, we hide them here or blend them.
                        // Let's blend them into floor so they aren't obvious without tracker.
                         ctx.fillStyle = '#1f2937'; 
                    }
                    if (entity.type === EntityType.CHEST && !entity.isOpen) {
                         // Chests are loot, hide them
                         ctx.fillStyle = '#1f2937';
                    }
                }
            }

            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

  }, [dungeon, playerPosition, hasTracker]);

  return (
    <div className="bg-gray-900 border border-gray-700 p-1 rounded inline-block shadow-lg">
      <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase text-center">
          {hasTracker ? "Tracker Active" : "No Signal"}
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default MiniMap;
