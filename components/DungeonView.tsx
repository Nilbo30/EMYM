import React from 'react';
import { GameState, EntityType, Position, Entity } from '../types';
import EntityIcon from './EntityIcon';

interface DungeonViewProps {
  gameState: GameState;
  onHoverEntity: (entity: Entity | null, x: number, y: number) => void;
  onEntityClick?: (entity: Entity) => void;
}

const VIEWPORT_SIZE = 21; // Keeps player centered on standard screens

const getDungeonTheme = (level: number) => {
    // Hub
    if (level === 0) return { wallBg: '#334155', wallFg: '#475569', floorBg: '#0f172a' };

    const themeIndex = (level - 1) % 5;
    switch (themeIndex) {
        case 0: return { wallBg: '#431407', wallFg: '#78350f', floorBg: '#1c1917' }; // Mines
        case 1: return { wallBg: '#14532d', wallFg: '#166534', floorBg: '#052e16' }; // Poison
        case 2: return { wallBg: '#1e3a8a', wallFg: '#1e40af', floorBg: '#0f172a' }; // Water
        case 3: return { wallBg: '#581c87', wallFg: '#7e22ce', floorBg: '#2e1065' }; // Arcane
        case 4: return { wallBg: '#7f1d1d', wallFg: '#991b1b', floorBg: '#450a0a' }; // Inferno
        default: return { wallBg: '#1f2937', wallFg: '#374151', floorBg: '#111827' };
    }
};

const DungeonView: React.FC<DungeonViewProps> = ({ gameState, onHoverEntity, onEntityClick }) => {
  const { player, dungeon } = gameState;
  const theme = getDungeonTheme(dungeon.levelNumber);
  
  const halfView = Math.floor(VIEWPORT_SIZE / 2);

  // PERK: Night Eyes (Vision +3)
  const baseVision = 6;
  const hasNightEyes = player.skills.perception.unlockedPerks.includes('night_eyes');
  const visionRadius = hasNightEyes ? baseVision + 3 : baseVision;
  
  const handleMouseEnter = (e: React.MouseEvent, entity: Entity | null) => {
      if (entity) {
          onHoverEntity(entity, e.clientX, e.clientY);
      }
  };

  const handleMouseLeave = () => {
      onHoverEntity(null, 0, 0);
  };

  const handleClick = (entity: Entity | null) => {
      if (entity && onEntityClick) {
          onEntityClick(entity);
      }
  };

  const renderTile = (viewX: number, viewY: number) => {
    const dungeonX = player.position.x - halfView + viewX;
    const dungeonY = player.position.y - halfView + viewY;
    
    // Check bounds
    if (
      dungeonX < 0 || 
      dungeonX >= dungeon.width || 
      dungeonY < 0 || 
      dungeonY >= dungeon.height
    ) {
      return <div key={`${viewX}-${viewY}`} className="w-8 h-8 bg-black shrink-0" />;
    }

    const dist = Math.sqrt(Math.pow(dungeonX - player.position.x, 2) + Math.pow(dungeonY - player.position.y, 2));
    const isVisible = dist < visionRadius || dungeon.isHub; 
    const isExplored = dungeon.explored[dungeonY][dungeonX];

    if (!isVisible && !isExplored) {
        return <div key={`${viewX}-${viewY}`} className="w-8 h-8 bg-black shrink-0" />;
    }
    
    const tileType = dungeon.tiles[dungeonY][dungeonX];
    
    // FIND BEST ENTITY TO RENDER
    const entitiesOnTile = dungeon.entities.filter(e => e.position.x === dungeonX && e.position.y === dungeonY);
    
    const getEntityPriority = (e: Entity) => {
        if (e.type === EntityType.ENEMY) return 10;
        if (e.type === EntityType.GOLD) return 9;
        if (e.type === EntityType.EQUIPMENT) return 8;
        if (e.type === EntityType.POTION || e.type === EntityType.FOOD || e.type === EntityType.RECALL_ORB || e.type === EntityType.ITEM) return 7;
        if (e.type === EntityType.CHEST && !e.isOpen) return 6;
        if (e.type === EntityType.PORTAL) return 5;
        if (e.type === EntityType.STAIRS) return 4;
        if (e.type === EntityType.STORAGE) return 4;
        if (e.type === EntityType.CHEST && e.isOpen) return 1; 
        if (e.type === EntityType.TRAP) return 0;
        return 0;
    };

    entitiesOnTile.sort((a, b) => getEntityPriority(b) - getEntityPriority(a));
    const entity = entitiesOnTile.length > 0 ? entitiesOnTile[0] : undefined;
    const isPlayer = player.position.x === dungeonX && player.position.y === dungeonY;

    // Determine Render Target
    let renderEntity: Entity | null = null;
    let fallbackType = tileType; // WALL or FLOOR
    
    // Check Visibility for Entity
    if (isPlayer) {
        fallbackType = EntityType.PLAYER;
        renderEntity = null; // We treat player as a type here for EntityIcon convenience, or we can mock an entity
    } else if (entity && (isVisible || (entity.type === EntityType.STAIRS && player.skills.arcana.unlockedPerks.includes('clairvoyance')))) {
         if (entity.type === EntityType.TRAP && entity.isHidden) {
             // Hidden trap = Floor
             renderEntity = null;
             fallbackType = EntityType.FLOOR;
         } else {
             renderEntity = entity;
         }
    }

    // Styling
    let style: React.CSSProperties = {};
    let className = "w-8 h-8 flex items-center justify-center transition-colors shrink-0 ";

    // Background Color (Theme)
    if (tileType === EntityType.WALL) {
        style = { backgroundColor: theme.wallBg, color: theme.wallFg };
    } else {
        style = { backgroundColor: theme.floorBg, color: '#374151' };
    }

    // Foreground Color (Entity)
    if (isPlayer) {
        style.color = '#fff';
    } else if (renderEntity) {
        style.color = renderEntity.color;
    }

    // Fog of War
    if (!isVisible && isExplored) {
        className += " brightness-[0.3] grayscale ";
    } else {
        className += " brightness-100 ";
    }
    
    const canClick = isVisible && renderEntity && renderEntity.type === EntityType.ENEMY;
    if (canClick) className += " cursor-pointer hover:bg-red-900/30 ";
    if (isPlayer) className += " ring-1 ring-white/20 ";

    return (
      <div 
        key={`${viewX}-${viewY}`}
        className={className}
        style={style}
        onMouseEnter={(e) => isVisible ? handleMouseEnter(e, renderEntity) : undefined}
        onMouseLeave={handleMouseLeave}
        onClick={() => canClick && handleClick(renderEntity)}
      >
        <EntityIcon entity={renderEntity} type={isPlayer ? EntityType.PLAYER : fallbackType} size="w-6 h-6" />
      </div>
    );
  };

  const grid = [];
  for (let y = 0; y < VIEWPORT_SIZE; y++) {
    const row = [];
    for (let x = 0; x < VIEWPORT_SIZE; x++) {
      row.push(renderTile(x, y));
    }
    grid.push(<div key={y} className="flex">{row}</div>);
  }

  return (
    <div className="inline-block border-4 border-gray-800 rounded bg-black p-1 shadow-2xl">
      {grid}
    </div>
  );
};

export default DungeonView;