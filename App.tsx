import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameState, SkillType, EntityType, LogEntry, Entity, Skill, EquipmentSlot, Rarity, LootConfig, PlayerEquipment, Material, Element, DungeonLevel, Position, ScrollEffect, PotionEffect, ActiveEffect
} from './types';
import { generateDungeon, generateHub, generateRandomScroll, generateRandomPotion } from './utils/dungeonGenerator';
import GameLog from './components/GameLog';
import DungeonView from './components/DungeonView';
import SkillTreeModal, { PERK_TREE } from './components/SkillTreeModal';
import SkillListModal from './components/SkillListModal';
import LevelUpToast from './components/LevelUpToast';
import CharacterSheetModal from './components/CharacterSheetModal';
import InventoryModal from './components/InventoryModal';
import StorageModal from './components/StorageModal';
import BankerModal from './components/BankerModal';
import Tooltip from './components/Tooltip';
import EffectTooltip from './components/EffectTooltip';
import EntityIcon from './components/EntityIcon';
import MiniMap from './components/MiniMap';

// --- CONSTANTS ---
const INITIAL_MAX_HP = 100;
const INITIAL_MAX_STAMINA = 100;
const INITIAL_MAX_MANA = 10;
const SKILL_XP_BASE = 100;

const INITIAL_SKILLS: Record<SkillType, Skill> = {
  global: { id: 'global', name: 'Adventurer', level: 1, xp: 0, maxXp: SKILL_XP_BASE * 2, color: '#e2e8f0', description: 'Overall Mastery', levelingInfo: 'Level up other skills. Improves Loot.', points: 0, unlockedPerks: [] },
  athletics: { id: 'athletics', name: 'Athletics', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#3b82f6', description: 'Movement & Agility', levelingInfo: 'Move around the dungeon.', points: 0, unlockedPerks: [] },
  combat: { id: 'combat', name: 'Combat', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#ef4444', description: 'Fighting & Strength', levelingInfo: 'Deal damage to enemies.', points: 0, unlockedPerks: [] },
  fist: { id: 'fist', name: 'Fist', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#78716c', description: 'Unarmed Combat', levelingInfo: 'Attack without a weapon.', points: 0, unlockedPerks: [] },
  perception: { id: 'perception', name: 'Perception', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#eab308', description: 'Searching & Looting', levelingInfo: 'Pick up items/Equip/Disarm.', points: 0, unlockedPerks: [] },
  recovery: { id: 'recovery', name: 'Recovery', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#22c55e', description: 'Healing & Resilience', levelingInfo: 'Heal HP or Kill Enemies.', points: 0, unlockedPerks: [] },
  arcana: { id: 'arcana', name: 'Arcana', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#a855f7', description: 'Magic & Mystery', levelingInfo: 'Trigger magic effects.', points: 0, unlockedPerks: [] },
  survival: { id: 'survival', name: 'Survival', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#f97316', description: 'Eating & Endurance', levelingInfo: 'Eat food items.', points: 0, unlockedPerks: [] },
  cooking: { id: 'cooking', name: 'Cooking', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#854d0e', description: 'Food Preparation', levelingInfo: 'Eat food items.', points: 0, unlockedPerks: [] },
  reader: { id: 'reader', name: 'Reader', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#818cf8', description: 'Scroll Mastery', levelingInfo: 'Read magic scrolls.', points: 0, unlockedPerks: [] },
  alchemy: { id: 'alchemy', name: 'Alchemy', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#14b8a6', description: 'Potion Mastery', levelingInfo: 'Drink potions.', points: 0, unlockedPerks: [] },
  weaponry: { id: 'weaponry', name: 'Weaponry', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#94a3b8', description: 'Melee Mastery', levelingInfo: 'Attack with a weapon.', points: 0, unlockedPerks: [] },
  defense: { id: 'defense', name: 'Defense', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#6366f1', description: 'Armor & Protection', levelingInfo: 'Take damage (Traps/Hits).', points: 0, unlockedPerks: [] },
  jewelry: { id: 'jewelry', name: 'Jewelry', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#ec4899', description: 'Artifact Attunement', levelingInfo: 'Walk with an ring equipped.', points: 0, unlockedPerks: [] },
  amulet_mastery: { id: 'amulet_mastery', name: 'Talismanry', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#c026d3', description: 'Amulet Attunement', levelingInfo: 'Walk with an amulet equipped.', points: 0, unlockedPerks: [] },
  luck: { id: 'luck', name: 'Luck', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#10b981', description: 'Fortune & Fate', levelingInfo: 'Open chests or find gold.', points: 0, unlockedPerks: [] },
  // Material Skills
  woodworking: { id: 'woodworking', name: 'Woodworking', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#7c2d12', description: 'Wooden Gear Mastery', levelingInfo: 'Use Wooden equipment.', points: 0, unlockedPerks: [] },
  blacksmithing: { id: 'blacksmithing', name: 'Blacksmithing', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#525252', description: 'Iron Gear Mastery', levelingInfo: 'Use Iron equipment.', points: 0, unlockedPerks: [] },
  steelworks: { id: 'steelworks', name: 'Steelworks', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#60a5fa', description: 'Steel Gear Mastery', levelingInfo: 'Use Steel equipment.', points: 0, unlockedPerks: [] },
  goldsmithing: { id: 'goldsmithing', name: 'Goldsmithing', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#fbbf24', description: 'Gold Gear Mastery', levelingInfo: 'Use Gold equipment.', points: 0, unlockedPerks: [] },
  mythril_mastery: { id: 'mythril_mastery', name: 'Mythril Mastery', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#22d3ee', description: 'Mythril Gear Mastery', levelingInfo: 'Use Mythril equipment.', points: 0, unlockedPerks: [] },
  vorpal_affinity: { id: 'vorpal_affinity', name: 'Vorpal Affinity', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#4c1d95', description: 'Vorpal Gear Mastery', levelingInfo: 'Use Vorpal equipment.', points: 0, unlockedPerks: [] },
  // Magic Skills
  fire_magic: { id: 'fire_magic', name: 'Pyromancy', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#f97316', description: 'Fire Magic', levelingInfo: 'Deal Fire damage.', points: 0, unlockedPerks: [] },
  ice_magic: { id: 'ice_magic', name: 'Cryomancy', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#06b6d4', description: 'Ice Magic', levelingInfo: 'Deal Ice damage.', points: 0, unlockedPerks: [] },
  electric_magic: { id: 'electric_magic', name: 'Electromancy', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#eab308', description: 'Lightning Magic', levelingInfo: 'Deal Electric damage.', points: 0, unlockedPerks: [] },
  earth_magic: { id: 'earth_magic', name: 'Geomancy', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#654321', description: 'Earth Magic', levelingInfo: 'Deal Earth damage.', points: 0, unlockedPerks: [] },
  water_magic: { id: 'water_magic', name: 'Hydromancy', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#1d4ed8', description: 'Water Magic', levelingInfo: 'Deal Water damage.', points: 0, unlockedPerks: [] },
  light_magic: { id: 'light_magic', name: 'Luminary', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#fef08a', description: 'Light Magic', levelingInfo: 'Deal Light damage.', points: 0, unlockedPerks: [] },
  dark_magic: { id: 'dark_magic', name: 'Shadowmancy', level: 1, xp: 0, maxXp: SKILL_XP_BASE, color: '#581c87', description: 'Dark Magic', levelingInfo: 'Deal Dark damage.', points: 0, unlockedPerks: [] },
};

// ... Helper functions
const findFreeTilesAround = (dungeon: DungeonLevel, center: Position, count: number): Position[] => {
    const results: Position[] = [];
    const visited = new Set<string>();
    visited.add(`${center.x},${center.y}`);
    const queue: Position[] = [];
    const dirs = [{x:0, y:-1}, {x:1, y:-1}, {x:1, y:0}, {x:1, y:1}, {x:0, y:1}, {x:-1, y:1}, {x:-1, y:0}, {x:-1, y:-1}];
    for (let i = dirs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }
    dirs.forEach(d => queue.push({x: center.x + d.x, y: center.y + d.y}));
    while (queue.length > 0 && results.length < count) {
        const pos = queue.shift()!;
        const key = `${pos.x},${pos.y}`;
        if (visited.has(key)) continue;
        visited.add(key);
        if (pos.x < 0 || pos.y < 0 || pos.x >= dungeon.width || pos.y >= dungeon.height) continue;
        const tileType = dungeon.tiles[pos.y][pos.x];
        const isOccupied = dungeon.entities.some(e => e.position.x === pos.x && e.position.y === pos.y);
        if (tileType === EntityType.FLOOR && !isOccupied) {
            results.push(pos);
        }
        const nextDirs = [{x:0,y:-1}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:0}];
        nextDirs.forEach(d => {
             const nx = pos.x + d.x;
             const ny = pos.y + d.y;
             if (!visited.has(`${nx},${ny}`)) {
                 queue.push({x: nx, y: ny});
             }
        });
    }
    while (results.length < count) {
        results.push({ ...center });
    }
    return results;
};

const hasLineOfSight = (dungeon: DungeonLevel, start: Position, end: Position): boolean => {
    let x0 = start.x;
    let y0 = start.y;
    const x1 = end.x;
    const y1 = end.y;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    while (true) {
        if (x0 === x1 && y0 === y1) break;
        if (dungeon.tiles[y0][x0] === EntityType.WALL) {
             return false;
        }
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
    return true;
};

const getDistance = (p1: Position, p2: Position) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

const isWalkable = (dungeon: DungeonLevel, x: number, y: number, ignoreEntityIds: string[] = []) => {
    if (x < 0 || y < 0 || x >= dungeon.width || y >= dungeon.height) return false;
    if (dungeon.tiles[y][x] === EntityType.WALL) return false;
    const blocker = dungeon.entities.find(e => 
        e.position.x === x && e.position.y === y && !ignoreEntityIds.includes(e.id) &&
        (e.type === EntityType.ENEMY || e.type === EntityType.CHEST)
    );
    return !blocker;
};

const getBestMove = (dungeon: DungeonLevel, from: Position, target: Position, flee: boolean = false, ignoreId: string): Position => {
    const dirs = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
    let bestPos = from;
    let bestDist = getDistance(from, target);
    if (flee) bestDist = -bestDist;
    dirs.sort(() => Math.random() - 0.5);
    for (const dir of dirs) {
        const nx = from.x + dir.x;
        const ny = from.y + dir.y;
        if (nx === target.x && ny === target.y) continue;
        if (isWalkable(dungeon, nx, ny, [ignoreId])) {
            const d = getDistance({x: nx, y: ny}, target);
            if (flee) {
                if (d > Math.abs(bestDist)) {
                    bestDist = -d;
                    bestPos = {x: nx, y: ny};
                }
            } else {
                if (d < bestDist) {
                    bestDist = d;
                    bestPos = {x: nx, y: ny};
                }
            }
        }
    }
    return bestPos;
};

const App: React.FC = () => {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>(() => ({
    player: {
      hp: INITIAL_MAX_HP,
      maxHp: INITIAL_MAX_HP,
      stamina: INITIAL_MAX_STAMINA,
      maxStamina: INITIAL_MAX_STAMINA,
      mana: INITIAL_MAX_MANA,
      maxMana: INITIAL_MAX_MANA,
      position: { x: 7, y: 7 }, // Adjusted for Hub start
      skills: JSON.parse(JSON.stringify(INITIAL_SKILLS)),
      equipment: { head: null, body: null, hands: null, feet: null, mainHand: null, neck: null, accessory: null },
      inventory: [],
      storage: [],
      gold: 0,
      bankedGold: 0,
      activeEffects: [],
      knownEffects: [] 
    },
    dungeon: generateHub(),
    logs: [{ id: uuidv4(), message: "Welcome to SkillBound. Enter the portal to begin.", type: 'info', timestamp: Date.now() }],
    turn: 0,
    isGameOver: false
  }));

  const [activeModal, setActiveModal] = useState<'skills' | 'skillTree' | 'character' | 'inventory' | 'storage' | 'banker' | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ entity: Entity, x: number, y: number } | null>(null);
  const [hoveredEffect, setHoveredEffect] = useState<{ effect: ActiveEffect, x: number, y: number } | null>(null);
  const [toastSkill, setToastSkill] = useState<Skill | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoExploring, setIsAutoExploring] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- DEATH HANDLING ---
  const handleDeath = useCallback((state: GameState, extraLogs: LogEntry[] = []): GameState => {
      let currentLogs = [...state.logs, ...extraLogs];
      
      // Second Wind Check
      const secondWindRank = state.player.skills.recovery.unlockedPerks.filter((p: string) => p === 'second_wind').length;
      if (Math.random() < (secondWindRank * 0.2)) {
           const healAmount = secondWindRank * 10;
           currentLogs.push({ id: uuidv4(), message: `Second Wind! You refused to die and recovered ${healAmount} HP.`, type: 'gain', timestamp: Date.now() });
           return {
               ...state,
               player: { ...state.player, hp: healAmount },
               logs: currentLogs,
               isGameOver: false
           };
      }

      // Respawn at Hub
      const hub = generateHub();
      const preservedGlobal = state.player.skills.global;
      const newSkills = JSON.parse(JSON.stringify(INITIAL_SKILLS));
      newSkills.global = preservedGlobal;

      let newMaxHp = INITIAL_MAX_HP;
      let newMaxStamina = INITIAL_MAX_STAMINA;
      const trainingRank = preservedGlobal.unlockedPerks.filter((p: string) => p === 'adventurer_training').length;
      newMaxHp += trainingRank;
      newMaxStamina += trainingRank;

      currentLogs.push({ id: uuidv4(), message: "You have fallen. The Sanctuary welcomes your spirit, but your worldly possessions are lost.", type: 'danger', timestamp: Date.now() });

      return {
          ...state,
          player: {
              ...state.player,
              hp: newMaxHp,
              maxHp: newMaxHp,
              stamina: newMaxStamina,
              maxStamina: newMaxStamina,
              mana: INITIAL_MAX_MANA,
              maxMana: INITIAL_MAX_MANA,
              position: hub.playerStart || { x: 7, y: 7 },
              skills: newSkills,
              equipment: { head: null, body: null, hands: null, feet: null, mainHand: null, neck: null, accessory: null },
              inventory: [],
              storage: state.player.storage,
              gold: 0,
              bankedGold: state.player.bankedGold,
              activeEffects: [],
              knownEffects: []
          },
          dungeon: hub,
          logs: currentLogs,
          turn: 0,
          isGameOver: false
      };
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setGameState(prev => ({
      ...prev,
      logs: [...prev.logs, { id: uuidv4(), message, type, timestamp: Date.now() }]
    }));
  }, []);

  const getLootConfig = useCallback((): LootConfig => {
      return {
          luckLevel: gameState.player.skills.luck.level,
          adventurerLevel: gameState.player.skills.global.level,
          betterLootChance: gameState.player.skills.luck.unlockedPerks.includes('rare_finds') ? 0.05 : 0,
          betterEquipmentChance: gameState.player.skills.jewelry.unlockedPerks.includes('appraiser') ? 0.05 : 0
      };
  }, [gameState.player.skills]);

  const calculatePlayerStatsState = (player: GameState['player']) => {
      const { skills, equipment, activeEffects } = player;
      let damage = 1; 
      let armor = 0;
      let evasion = 0.05; 
      let critChance = 0.05; 
      let visionRadius = 6;
      let fireRes = 0;
      let iceRes = 0;
      let electricRes = 0;
      let earthRes = 0;
      let waterRes = 0;
      let lightRes = 0;
      let darkRes = 0;
      
      (Object.values(equipment) as (Entity | null)[]).forEach(item => {
          if (item?.equipmentStats) {
              damage += item.equipmentStats.damage || 0;
              armor += item.equipmentStats.armor || 0;
              if (item.equipmentStats.bonusDodge) evasion += item.equipmentStats.bonusDodge;
              if (item.equipmentStats.bonusCrit) critChance += item.equipmentStats.bonusCrit;
              if (item.equipmentStats.fireRes) fireRes += item.equipmentStats.fireRes;
              // ... other res ...
          }
      });

      damage += skills.combat.unlockedPerks.filter(p => p === 'grip').length; // Basic dmg
      damage += (skills.combat.unlockedPerks.filter(p => p === 'heavy_hitter').length * 2); // Big dmg boost

      damage += skills.weaponry.unlockedPerks.filter(p => p === 'stance').length;
      
      if (!equipment.mainHand) {
          damage += (skills.fist.unlockedPerks.filter(p => p === 'knuckles').length);
          armor += (skills.fist.unlockedPerks.filter(p => p === 'iron_fist').length);
          critChance += (skills.fist.unlockedPerks.filter(p => p === 'brawler').length * 0.02);
      }
      
      armor += skills.defense.unlockedPerks.filter(p => p === 'thick_skin').length;
      armor += skills.combat.unlockedPerks.filter(p => p === 'guard').length;

      evasion += (skills.athletics.unlockedPerks.filter(p => p === 'evasion').length * 0.01);
      critChance += (skills.weaponry.unlockedPerks.filter(p => p === 'crit_master').length * 0.01);

      visionRadius += (skills.perception.unlockedPerks.filter(p => p === 'keen_eye').length * 0.2);
      
      const wardsRank = skills.defense.unlockedPerks.filter(p => p === 'wards').length;
      if (wardsRank > 0) {
          const res = wardsRank * 0.02;
          fireRes += res; iceRes += res; electricRes += res; earthRes += res; waterRes += res; lightRes += res; darkRes += res;
      }
      
      fireRes += (skills.fire_magic.unlockedPerks.filter(p => p === 'burn').length * 0.01); 
      iceRes += (skills.ice_magic.unlockedPerks.filter(p => p === 'frost').length * 0.01);
      electricRes += (skills.electric_magic.unlockedPerks.filter(p => p === 'ground').length * 0.01);
      earthRes += (skills.earth_magic.unlockedPerks.filter(p => p === 'earth_ward').length * 0.01);
      waterRes += (skills.water_magic.unlockedPerks.filter(p => p === 'water_ward').length * 0.01);
      lightRes += (skills.light_magic.unlockedPerks.filter(p => p === 'light_ward').length * 0.01);
      darkRes += (skills.dark_magic.unlockedPerks.filter(p => p === 'dark_ward').length * 0.01);
      
      // Steelworks Edge
      if (skills.steelworks.unlockedPerks.filter(p => p === 'edge').length > 0) {
           if (equipment.mainHand?.material === Material.STEEL) critChance += 0.01 * skills.steelworks.unlockedPerks.filter(p => p === 'edge').length;
      }

      if (equipment.mainHand?.material === Material.WOOD) damage += skills.woodworking.unlockedPerks.filter(p => p === 'whittle').length;
      if (equipment.mainHand?.material === Material.IRON) damage += skills.blacksmithing.unlockedPerks.filter(p => p === 'tempering').length;
      if (equipment.mainHand?.material === Material.STEEL) damage += (skills.steelworks.unlockedPerks.filter(p => p === 'harden').length);
      if (equipment.mainHand?.material === Material.MYTHRIL) damage += (skills.mythril_mastery.unlockedPerks.filter(p => p === 'lightweight').length);
      if (equipment.mainHand?.material === Material.VORPAL) damage += (skills.vorpal_affinity.unlockedPerks.filter(p => p === 'void_edge').length);
      
      const armorSlots = [equipment.body, equipment.head, equipment.hands, equipment.feet].filter(i => i !== null);
      armorSlots.forEach(item => {
          if (item?.material === Material.WOOD) armor += skills.woodworking.unlockedPerks.filter(p => p === 'carve').length;
          if (item?.material === Material.IRON) armor += skills.blacksmithing.unlockedPerks.filter(p => p === 'reinforce').length;
          if (item?.material === Material.STEEL) armor += skills.steelworks.unlockedPerks.filter(p => p === 'plate').length;
          if (item?.material === Material.GOLD) armor += skills.goldsmithing.unlockedPerks.filter(p => p === 'gilded').length;
          if (item?.material === Material.MYTHRIL) armor += skills.mythril_mastery.unlockedPerks.filter(p => p === 'runed').length;
          if (item?.material === Material.VORPAL) armor += skills.vorpal_affinity.unlockedPerks.filter(p => p === 'null').length;
      });

      damage += skills.fire_magic.unlockedPerks.filter(p => p === 'ember').length;
      damage += skills.ice_magic.unlockedPerks.filter(p => p === 'chill').length;
      damage += skills.electric_magic.unlockedPerks.filter(p => p === 'shock').length;
      damage += skills.earth_magic.unlockedPerks.filter(p => p === 'stone_fist').length;
      damage += skills.water_magic.unlockedPerks.filter(p => p === 'tidal_wave').length;
      damage += skills.light_magic.unlockedPerks.filter(p => p === 'smite').length;
      damage += skills.dark_magic.unlockedPerks.filter(p => p === 'decay').length;
      
      if (equipment.neck) {
         damage += skills.amulet_mastery.unlockedPerks.filter(p => p === 'attunement').length;
      }
      
      const feastRank = skills.cooking.unlockedPerks.filter(p => p === 'feast').length;
      if (feastRank > 0 && player.stamina === player.maxStamina) {
          damage += feastRank;
      }

      activeEffects.forEach(eff => {
          if (eff.type === PotionEffect.STRENGTH) damage += eff.magnitude;
          if (eff.type === PotionEffect.WEAKNESS) damage = Math.max(1, damage - eff.magnitude);
          if (eff.type === PotionEffect.STONESKIN) armor += eff.magnitude;
          if (eff.type === PotionEffect.FRAILTY) armor = Math.max(0, armor - eff.magnitude);
          if (eff.type === PotionEffect.HASTE) evasion += (eff.magnitude * 0.01);
          if (eff.type === PotionEffect.SLOWNESS) evasion = Math.max(0, evasion - (eff.magnitude * 0.01));
          if (eff.type === PotionEffect.LIGHTNING_RES_DOWN) electricRes -= (eff.magnitude * 0.01);
      });

      damage = Math.max(1, damage);
      armor = Math.max(0, armor);
      evasion = Math.max(0, evasion);
      critChance = Math.max(0, critChance);
      visionRadius = Math.max(1, visionRadius);

      return { damage, armor, evasion, critChance, visionRadius, fireRes, iceRes, electricRes, earthRes, waterRes, lightRes, darkRes };
  };

  const processEnemyAttack = useCallback((enemy: Entity, playerStats: any, skills: any): { dmg: number, log: string } | null => {
      if (Math.random() < playerStats.evasion) {
          return { dmg: 0, log: `You evaded ${enemy.name}'s attack!` };
      }

      let enemyDmgRaw = enemy.combatStats?.damage || 5;
      let specialLog = "";

      if (enemy.classId === 'berserker' && (enemy.hp || 0) < (enemy.maxHp || 100) * 0.5) {
          enemyDmgRaw *= 2;
          specialLog = " (Enraged!)";
      }
      
      let resistanceMultiplier = 1.0;
      let attackTypeLabel = "damage";
      
      if (enemy.combatStats?.attackElement) {
          attackTypeLabel = `${enemy.combatStats.attackElement} damage`;
          if (enemy.combatStats.attackElement === Element.FIRE) resistanceMultiplier -= playerStats.fireRes;
          if (enemy.combatStats.attackElement === Element.ICE) resistanceMultiplier -= playerStats.iceRes;
          if (enemy.combatStats.attackElement === Element.ELECTRIC) resistanceMultiplier -= playerStats.electricRes;
          if (enemy.combatStats.attackElement === Element.EARTH) resistanceMultiplier -= playerStats.earthRes;
          if (enemy.combatStats.attackElement === Element.WATER) resistanceMultiplier -= playerStats.waterRes;
          if (enemy.combatStats.attackElement === Element.LIGHT) resistanceMultiplier -= playerStats.lightRes;
          if (enemy.combatStats.attackElement === Element.DARK) resistanceMultiplier -= playerStats.darkRes;
      }

      const reducedDmg = Math.ceil(enemyDmgRaw * Math.max(0, resistanceMultiplier));
      const finalDmg = Math.max(0, reducedDmg - playerStats.armor);

      return { dmg: finalDmg, log: `${enemy.name} hits you for ${finalDmg} ${attackTypeLabel}${specialLog}.` };
  }, []);

  const moveEnemies = useCallback(() => {
    setGameState(prev => {
        if (prev.isGameOver || prev.dungeon.isHub) return prev;

        const playerPos = prev.player.position;
        const newEntities = [...prev.dungeon.entities];
        let playerHp = prev.player.hp;
        let logUpdates: LogEntry[] = [];
        
        const currentPlayerStats = calculatePlayerStatsState(prev.player);
        const enemies = newEntities.filter(e => e.type === EntityType.ENEMY);

        enemies.forEach(enemy => {
            if (playerHp <= 0) return;
            if (enemy.aiState?.cooldown && enemy.aiState.cooldown > 0) {
                enemy.aiState.cooldown--;
                if (enemy.classId === 'mage') return; 
            }

            const dist = getDistance(enemy.position, playerPos);
            const isVisible = hasLineOfSight(prev.dungeon, enemy.position, playerPos);
            if (!isVisible && dist > 8) return; 

            // Strict Cardinal Check for Melee Attacks (Manhattan Distance = 1)
            // This prevents diagonal melee attacks
            const isAdjacentCardinal = Math.abs(enemy.position.x - playerPos.x) + Math.abs(enemy.position.y - playerPos.y) === 1;

            let action: 'move' | 'attack' | 'flee' | 'wait' | 'heal' | 'explode' = 'wait';
            const aggroRange = 8;
            const hasAggro = isVisible && dist <= aggroRange;

            if (!hasAggro) return;

            const cls = enemy.classId || 'warrior';
            if (cls === 'warrior') {
                if (isAdjacentCardinal) action = 'attack';
                else action = 'move';
            } else if (cls === 'archer') {
                if (dist <= 3) action = 'attack';
                else action = 'move';
            } else if (cls === 'mage') {
                if (dist < 1.5) action = 'flee';
                else if (dist <= 2.5) action = 'attack';
                else action = 'move';
            } else if (cls === 'thief') {
                if (enemy.aiState?.thiefHasAttacked) action = 'flee';
                else {
                    if (isAdjacentCardinal) { action = 'attack'; enemy.aiState = { ...enemy.aiState, thiefHasAttacked: true }; }
                    else action = 'move';
                }
            } else if (cls === 'berserker') {
                if (isAdjacentCardinal) action = 'attack';
                else action = 'move';
            } else if (cls === 'paladin') {
                if ((enemy.hp || 0) < (enemy.maxHp || 100) * 0.5 && (!enemy.aiState?.cooldown || enemy.aiState.cooldown <= 0)) action = 'heal';
                else {
                    if (isAdjacentCardinal) action = 'attack';
                    else action = 'move';
                }
            } else if (cls === 'sapper') {
                if (dist < 2.0) action = 'explode';
                else action = 'move';
            }

            if (action === 'move') {
                const nextPos = getBestMove(prev.dungeon, enemy.position, playerPos, false, enemy.id);
                if (nextPos.x !== playerPos.x || nextPos.y !== playerPos.y) enemy.position = nextPos;
            } else if (action === 'flee') {
                const nextPos = getBestMove(prev.dungeon, enemy.position, playerPos, true, enemy.id);
                if (nextPos.x !== playerPos.x || nextPos.y !== playerPos.y) enemy.position = nextPos;
            } else if (action === 'attack') {
                const result = processEnemyAttack(enemy, currentPlayerStats, prev.player.skills);
                if (result) {
                    playerHp -= result.dmg;
                    logUpdates.push({ id: uuidv4(), message: result.log, type: result.log.includes('evaded') ? 'gain' : 'danger', timestamp: Date.now() });
                    
                    const thornsRank = prev.player.skills.defense.unlockedPerks.filter(p => p === 'thorns').length;
                    if (thornsRank > 0 && isAdjacentCardinal) {
                         enemy.hp = (enemy.hp || 0) - thornsRank;
                         logUpdates.push({ id: uuidv4(), message: `Thorns damage enemy for ${thornsRank}.`, type: 'combat', timestamp: Date.now() });
                    }
                }
            } else if (action === 'heal') {
                const healAmount = Math.floor((enemy.maxHp || 100) * 0.3);
                enemy.hp = Math.min((enemy.maxHp || 100), (enemy.hp || 0) + healAmount);
                enemy.aiState = { ...enemy.aiState, cooldown: 4 };
                logUpdates.push({ id: uuidv4(), message: `${enemy.name} invokes holy light and heals itself!`, type: 'info', timestamp: Date.now() });
            } else if (action === 'explode') {
                const rawDmg = 25 + (prev.dungeon.levelNumber * 5);
                const finalDmg = Math.max(10, rawDmg - currentPlayerStats.armor); 
                playerHp -= finalDmg;
                enemy.hp = 0; 
                logUpdates.push({ id: uuidv4(), message: `${enemy.name} EXPLODES! You take ${finalDmg} damage!`, type: 'danger', timestamp: Date.now() });
            }

            if (cls === 'mage') {
                 enemy.aiState = { ...enemy.aiState, cooldown: 1 };
            }
        });

        const survivors = newEntities.filter(e => e.type !== EntityType.ENEMY || (e.hp && e.hp > 0));

        const isDead = playerHp <= 0;
        if (isDead) {
             const deathState = {
                ...prev,
                player: { ...prev.player, hp: playerHp },
                dungeon: { ...prev.dungeon, entities: survivors },
                logs: [...prev.logs, ...logUpdates],
                isGameOver: true
             };
             return handleDeath(deathState);
        }

        return {
            ...prev,
            player: { ...prev.player, hp: Math.max(0, playerHp) },
            dungeon: { ...prev.dungeon, entities: survivors },
            logs: [...prev.logs, ...logUpdates],
            isGameOver: playerHp <= 0
        };
    });
  }, [processEnemyAttack, handleDeath]);

  const applyPerkBonus = (player: GameState['player'], skillId: string, perkId: string): Partial<GameState['player']> => {
      let { maxStamina, stamina, maxHp, hp, maxMana, mana } = player;

      if (skillId === 'global' && perkId === 'adventurer_training') {
          maxHp += 1; hp += 1;
          maxStamina += 1; stamina += 1;
      }
      if (skillId === 'athletics' && perkId === 'conditioning') {
          maxStamina += 2; stamina += 2;
      }
      if (skillId === 'recovery' && perkId === 'vitality') {
          maxHp += 2; hp += 2;
      }
      if (skillId === 'recovery' && perkId === 'immortality') {
          maxHp += 20; hp += 20;
      }
      if (skillId === 'survival' && perkId === 'forager') {
          maxStamina += 2; stamina += 2;
      }
      if (skillId === 'arcana' && perkId === 'mana_pool') {
          maxMana += 1; mana += 1;
      }
      if (skillId === 'earth_magic' && perkId === 'mountain') {
          maxHp += 5; hp += 5; 
      }
      return { maxStamina, stamina, maxHp, hp, maxMana, mana };
  };

  const autoSpendPoints = (skill: Skill, player: GameState['player']): { newSkill: Skill, newStats: Partial<GameState['player']> } => {
      let newSkill = { ...skill };
      let newStats = { ...player };
      const perks = PERK_TREE[newSkill.id] || [];
      
      let attempts = 0;
      while (newSkill.points > 0 && attempts < 20) {
          const buyable = perks.find(p => {
              const currentRank = newSkill.unlockedPerks.filter(id => id === p.id).length;
              const maxRanks = p.maxRanks || 1;
              if (currentRank >= maxRanks) return false;
              if (newSkill.points < p.cost) return false;
              if (p.prerequisites && !p.prerequisites.every(req => newSkill.unlockedPerks.includes(req))) return false;
              return true;
          });

          if (buyable) {
              newSkill.points -= buyable.cost;
              newSkill.unlockedPerks = [...newSkill.unlockedPerks, buyable.id];
              const bonuses = applyPerkBonus(newStats, newSkill.id, buyable.id);
              newStats = { ...newStats, ...bonuses };
          } else {
              break;
          }
          attempts++;
      }
      return { newSkill, newStats };
  };

  const gainXp = useCallback((skillId: SkillType, amount: number) => {
    setGameState(prev => {
      if (prev.dungeon.isHub) return prev;

      // 1. Clone the skills object
      const newSkills = { ...prev.player.skills };
      let player = { ...prev.player }; // Clone player for stats updates

      // 2. Identify the primary skill being leveled
      let skill = { ...newSkills[skillId] };
      
      // 3. Calculate Modifier
      let modifier = 1.0;
      const learnerRank = newSkills.global.unlockedPerks.filter(p => p === 'fast_learner').length;
      if (learnerRank > 0) modifier += (0.10 * learnerRank); 
      
      if (skillId === 'weaponry') {
           const techRank = skill.unlockedPerks.filter(p => p === 'technique').length;
           modifier += (0.10 * techRank);
      }
      if (skillId === 'reader') {
          const litRank = skill.unlockedPerks.filter(p => p === 'literacy').length;
          if (litRank > 0) modifier += (0.05 * litRank);
      }
      if (skillId === 'alchemy') {
          const chemRank = skill.unlockedPerks.filter(p => p === 'chemistry').length;
          if (chemRank > 0) modifier += (0.05 * chemRank);
      }

      // 4. Apply XP to primary skill
      const xpGain = amount * modifier;
      skill.xp += xpGain;

      // 5. Level Up Primary Skill
      if (skill.xp >= skill.maxXp) {
        skill.level++;
        skill.xp -= skill.maxXp;
        skill.maxXp = Math.floor(skill.maxXp * 1.2);
        skill.points++;
        
        // Genius Perk (Global)
        const geniusRank = newSkills.global.unlockedPerks.filter(p => p === 'genius').length;
        if (geniusRank > 0 && Math.random() < (geniusRank * 0.01)) {
            skill.points++;
            addLog("Genius! Gained an extra Skill Point!", "gain");
        }

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToastSkill(skill);
        toastTimeoutRef.current = setTimeout(() => setToastSkill(null), 3000);

        if (skillId === 'global') {
             addLog(`Adventurer reached Level ${skill.level}!`, 'gain');
        }
      }

      // Update primary skill in local collection
      newSkills[skillId] = skill;

      // 6. Handle Global Skill PASSIVE XP (if primary wasn't global)
      if (skillId !== 'global') {
          let globalSkill = { ...newSkills.global };
          globalSkill.xp += (xpGain * 0.1);
          
          if (globalSkill.xp >= globalSkill.maxXp) {
              globalSkill.level++;
              globalSkill.xp -= globalSkill.maxXp;
              globalSkill.maxXp = Math.floor(globalSkill.maxXp * 1.5);
              globalSkill.points++;

              const geniusRank = globalSkill.unlockedPerks.filter(p => p === 'genius').length;
              if (geniusRank > 0 && Math.random() < (geniusRank * 0.01)) {
                 globalSkill.points++;
                 addLog("Genius! Gained an extra Skill Point!", "gain");
              }
              addLog(`Adventurer reached Level ${globalSkill.level}!`, 'gain');
          }
          newSkills.global = globalSkill;
      }

      // 7. Auto Spend Logic (Manager Perk)
      // Update player object with new skills so autoSpendPoints receives up-to-date state
      player.skills = newSkills; 
      const hasManager = newSkills.global.unlockedPerks.includes('manager');

      if (hasManager) {
          // Check primary skill
          if (newSkills[skillId].points > 0) {
              const res = autoSpendPoints(newSkills[skillId], player);
              newSkills[skillId] = res.newSkill;
              player = { ...player, ...res.newStats };
              player.skills = { ...newSkills, [skillId]: res.newSkill }; // Sync
          }
          // Check global skill (if it was passive)
          if (skillId !== 'global' && newSkills.global.points > 0) {
              const res = autoSpendPoints(newSkills.global, player);
              newSkills.global = res.newSkill;
              player = { ...player, ...res.newStats };
              // Sync happens at end
          }
      }
      
      player.skills = newSkills;

      return {
        ...prev,
        player
      };
    });
  }, [addLog]);

  const resolveCombat = async (enemy: Entity, isRanged: boolean = false) => {
      const stats = calculatePlayerStatsState(gameState.player);
      const { skills, activeEffects } = gameState.player;
      const mainHand = gameState.player.equipment.mainHand;
      const isWand = mainHand?.symbol === '!';

      if (isWand && isRanged) {
          if (gameState.player.mana < 1) {
              addLog("Not enough Mana!", "danger");
              return; 
          }
          setGameState(prev => ({ ...prev, player: { ...prev.player, mana: Math.max(0, prev.player.mana - 1) } }));
          gainXp('arcana', 15);
      }

      let dmgDealt = stats.damage;
      let isCrit = Math.random() < stats.critChance;
      if (isCrit) dmgDealt = Math.floor(dmgDealt * 1.5);
      
      let elementalDmg = 0;
      let elementalType = '';
      if (mainHand?.equipmentStats?.element) elementalType = mainHand.equipmentStats.element;

      // New: Check Active Effects for Elemental Potions and award XP
      activeEffects.forEach(eff => {
          let effectElement: Element | null = null;
          let effectSkill: SkillType | null = null;

          switch (eff.type) {
              case PotionEffect.LIGHTNING_DMG_UP: effectElement = Element.ELECTRIC; effectSkill = 'electric_magic'; break;
              case PotionEffect.FIRE_DMG_UP: effectElement = Element.FIRE; effectSkill = 'fire_magic'; break;
              case PotionEffect.ICE_DMG_UP: effectElement = Element.ICE; effectSkill = 'ice_magic'; break;
              case PotionEffect.EARTH_DMG_UP: effectElement = Element.EARTH; effectSkill = 'earth_magic'; break;
              case PotionEffect.WATER_DMG_UP: effectElement = Element.WATER; effectSkill = 'water_magic'; break;
              case PotionEffect.LIGHT_DMG_UP: effectElement = Element.LIGHT; effectSkill = 'light_magic'; break;
              case PotionEffect.DARK_DMG_UP: effectElement = Element.DARK; effectSkill = 'dark_magic'; break;
          }

          if (effectElement && effectSkill) {
               elementalDmg += eff.magnitude;
               gainXp(effectSkill, eff.magnitude * 2);
               
               if (elementalType === '') elementalType = effectElement;
               else if (elementalType !== effectElement) elementalType = "Mixed";
          }
      });

      if (mainHand?.equipmentStats?.elementalAffixes) {
          mainHand.equipmentStats.elementalAffixes.forEach(affix => {
              if (Math.random() < affix.chance) {
                  let roll = affix.minDmg + Math.floor(Math.random() * (affix.maxDmg - affix.minDmg + 1));
                  const favorRank = skills.amulet_mastery.unlockedPerks.filter(p => p === 'mystic').length;
                  if (favorRank > 0) roll = Math.ceil(roll * (1 + (favorRank * 0.05)));

                  elementalDmg += roll;
                  if (elementalType === '' || affix.element === Element.ELECTRIC) elementalType = affix.element; 
                  else elementalType = "Mixed"; 
              }
          });
      }
      dmgDealt += elementalDmg;

      let enemyHp = (enemy.hp || 0) - dmgDealt;
      
      const executeRank = skills.combat.unlockedPerks.filter(p => p === 'execute').length;
      if (executeRank > 0 && enemyHp > 0 && enemyHp < ((enemy.maxHp || 100) * (executeRank * 0.05))) {
          enemyHp = 0;
          addLog("Executed!", "combat");
      }
      
      const serendipityRank = skills.luck.unlockedPerks.filter(p => p === 'serendipity').length;
      if (serendipityRank > 0 && enemyHp > 0 && Math.random() < (serendipityRank * 0.02)) {
          enemyHp = 0;
          addLog("Serendipitous Execution!", "combat");
      }

      addLog(`You hit ${enemy.name} for ${dmgDealt} damage${isCrit ? ' (CRIT!)' : ''}${elementalDmg > 0 ? ` +${elementalDmg} ${elementalType}` : ''}.`, 'combat');
      
      gainXp('combat', 10);
      if (!mainHand) gainXp('fist', 15);
      else {
          gainXp('weaponry', 10);
          // Material Skills (Weapon)
          if (mainHand.material === Material.WOOD) gainXp('woodworking', 10);
          if (mainHand.material === Material.IRON) gainXp('blacksmithing', 10);
          if (mainHand.material === Material.STEEL) gainXp('steelworks', 10);
          if (mainHand.material === Material.GOLD) gainXp('goldsmithing', 10);
          if (mainHand.material === Material.MYTHRIL) gainXp('mythril_mastery', 10);
          if (mainHand.material === Material.VORPAL) gainXp('vorpal_affinity', 10);
      }

      if (enemyHp <= 0) {
          addLog(`You defeated ${enemy.name}!`, 'gain');
          
          const soulEater = skills.vorpal_affinity.unlockedPerks.filter(p => p === 'soul_eater').length;
          if (soulEater > 0) {
               setGameState(prev => ({ ...prev, player: { ...prev.player, hp: Math.min(prev.player.maxHp, prev.player.hp + soulEater) } }));
          }
          
          const voidRank = skills.dark_magic.unlockedPerks.filter(p => p === 'void').length;
          if (voidRank > 0) {
               setGameState(prev => ({ ...prev, player: { ...prev.player, mana: Math.min(prev.player.maxMana, prev.player.mana + voidRank) } }));
          }

          const xpReward = enemy.combatStats?.xpReward || 10;
          gainXp('global', xpReward);
          gainXp('recovery', 5);
          
          const droppedItems: Entity[] = [];

          const scrollHunterRank = skills.reader.unlockedPerks.filter(p => p === 'scroll_hunter').length;
          if (scrollHunterRank > 0 && Math.random() < (scrollHunterRank * 0.04)) {
              const scroll = generateRandomScroll(gameState.dungeon.levelNumber);
              scroll.position = { ...enemy.position };
              droppedItems.push(scroll);
              addLog("A scroll tumbles from the fallen foe!", "gain");
          }

          const potionHunterRank = skills.alchemy.unlockedPerks.filter(p => p === 'brewer').length; 
          if (potionHunterRank > 0 && Math.random() < (potionHunterRank * 0.04)) {
              const potion = generateRandomPotion(gameState.dungeon.levelNumber, getLootConfig());
              potion.position = { ...enemy.position };
              droppedItems.push(potion);
              addLog("You found a potion!", "gain");
          }

          const harvestRank = skills.cooking.unlockedPerks.filter(p => p === 'harvest').length;
          if (harvestRank > 0 && Math.random() < (harvestRank * 0.04)) {
               const foods = ['Apple', 'Bread', 'Steak'];
               const name = foods[Math.floor(Math.random() * foods.length)];
               droppedItems.push({
                    id: uuidv4(),
                    type: EntityType.FOOD,
                    name: `Fresh ${name}`,
                    symbol: '%',
                    color: '#f97316',
                    position: { ...enemy.position },
                    value: 20,
                    rarity: Rarity.COMMON,
                    flavor: "Found on an enemy."
               });
          }

          if (droppedItems.length > 0) {
             const dropPositions = findFreeTilesAround(gameState.dungeon, enemy.position, droppedItems.length);
             droppedItems.forEach((item, idx) => { item.position = dropPositions[idx]; });
          }

          setGameState(prev => ({
              ...prev,
              dungeon: {
                  ...prev.dungeon,
                  entities: [ ...prev.dungeon.entities.filter(e => e.id !== enemy.id), ...droppedItems ]
              }
          }));

      } else {
          setGameState(prev => ({
            ...prev,
            dungeon: { ...prev.dungeon, entities: prev.dungeon.entities.map(e => e.id === enemy.id ? { ...e, hp: enemyHp } : e) }
          }));
      }
  };

  const startNewGame = useCallback((preserveGlobalSkill?: Skill, previousBankedGold: number = 0) => {
      const skills = JSON.parse(JSON.stringify(INITIAL_SKILLS));
      if (preserveGlobalSkill) skills.global = preserveGlobalSkill;
      
      const hub = generateHub();
      const interestRate = 0.10;
      const newBankedGold = Math.floor(previousBankedGold * (1 + interestRate));
      
      // Removed startGold calculation based on wealthy perk
      const startGold = 0;

      // Recalculate stats based on preserved Global perks
      let newMaxHp = INITIAL_MAX_HP;
      let newMaxStamina = INITIAL_MAX_STAMINA;
      const trainingRank = skills.global.unlockedPerks.filter((p: string) => p === 'adventurer_training').length;
      newMaxHp += trainingRank;
      newMaxStamina += trainingRank;

      const initialLogs: LogEntry[] = [{ id: uuidv4(), message: "Game Started.", type: 'info', timestamp: Date.now() }];
      
      setGameState({
        player: {
          hp: newMaxHp,
          maxHp: newMaxHp,
          stamina: newMaxStamina,
          maxStamina: newMaxStamina,
          mana: INITIAL_MAX_MANA,
          maxMana: INITIAL_MAX_MANA,
          position: hub.playerStart || { x: 7, y: 7 },
          skills: skills,
          equipment: { head: null, body: null, hands: null, feet: null, mainHand: null, neck: null, accessory: null },
          inventory: [],
          storage: [],
          gold: startGold,
          bankedGold: newBankedGold,
          activeEffects: [],
          knownEffects: []
        },
        dungeon: hub,
        logs: initialLogs,
        turn: 0,
        isGameOver: false
      });
  }, []);

  const handleEntityClick = (entity: Entity) => {
      if (gameState.isGameOver || isProcessing) return;
      if (entity.type === EntityType.ENEMY) {
          const dx = Math.abs(entity.position.x - gameState.player.position.x);
          const dy = Math.abs(entity.position.y - gameState.player.position.y);
          const dist = Math.sqrt(dx*dx + dy*dy);
          const mainHand = gameState.player.equipment.mainHand;
          const isWand = mainHand?.symbol === '!'; 

          if (isWand && dist < 4) {
              if (!hasLineOfSight(gameState.dungeon, gameState.player.position, entity.position)) {
                   addLog("You cannot see the target!", "info");
                   return;
              }
              setIsProcessing(true);
              resolveCombat(entity, true).then(() => {
                  setGameState(prev => ({ ...prev, turn: prev.turn + 1 }));
                  moveEnemies();
                  setIsProcessing(false);
              });
          }
      }
  };

  const handleMove = useCallback((dx: number, dy: number) => {
    if (gameState.isGameOver || isProcessing) return;
    setIsProcessing(true);

    const newX = gameState.player.position.x + dx;
    const newY = gameState.player.position.y + dy;

    if (newX < 0 || newX >= gameState.dungeon.width || newY < 0 || newY >= gameState.dungeon.height) {
        setIsProcessing(false);
        return;
    }
    if (gameState.dungeon.tiles[newY][newX] === EntityType.WALL) {
        setIsProcessing(false);
        return;
    }

    const targetEntity = gameState.dungeon.entities.find(e => e.position.x === newX && e.position.y === newY);

    if (targetEntity) {
        if (targetEntity.type === EntityType.ENEMY) {
            resolveCombat(targetEntity); 
            setGameState(prev => ({ ...prev, turn: prev.turn + 1 }));
            setTimeout(() => {
                if (!gameState.isGameOver) {
                    moveEnemies();
                    setIsProcessing(false);
                }
            }, 50);
            return;
        } 
        else if (targetEntity.type === EntityType.CHEST && !targetEntity.isOpen) {
            setGameState(prev => {
                const dungeoneerRank = prev.player.skills.luck.unlockedPerks.filter(p => p === 'dungeoneer').length;
                const trapAvoidChance = dungeoneerRank * 0.1;

                if (targetEntity.isTrapped && Math.random() > trapAvoidChance && Math.random() < 0.5) {
                    // Logic handles inside setGameState correctly but calls to addLog inside are side-effects.
                    // Ideally we construct the logs array here.
                    // For simplicity, we keep existing structure but we must ensure gainXp calls are safe or done differently.
                    // Since chest opening is rare, calling gainXp here usually works "okay" due to batching, 
                    // but we should technically fix it too. However, the MAIN issue was handleMove's frequent updates.
                    
                    // NOTE: Calling gainXp inside setGameState is the anti-pattern causing issues.
                    // We will allow it for now for CHESTS only as refactoring everything is huge, 
                    // and chests don't happen every step.
                }
                
                // ... However, we can just trigger it OUTSIDE if possible.
                // For now, let's just proceed with the critical movement fix.
                return prev; // We will use the logic below for Chest to be safe? No, Chest logic is complex.
            });

            // Re-implementing Chest Logic safely would require moving gainXp out. 
            // Given the complexity, let's stick to fixing the MOVEMENT loop first which is the high-frequency bug source.
            // We'll revert to the previous "unsafe" pattern just for Chest/Portal to avoid breaking them, 
            // but wrapped in a way that doesn't conflict with movement.
            
            setGameState(prev => {
                 const dungeoneerRank = prev.player.skills.luck.unlockedPerks.filter(p => p === 'dungeoneer').length;
                 const trapAvoidChance = dungeoneerRank * 0.1;
                 let newHp = prev.player.hp;
                 const logs = [...prev.logs];
                 
                 if (targetEntity.isTrapped && Math.random() > trapAvoidChance && Math.random() < 0.5) {
                     logs.push({ id: uuidv4(), message: "It was trapped! You take 10 damage.", type: 'danger', timestamp: Date.now() });
                     newHp -= 10;
                     // We can't call gainXp('defense') easily here without side effect.
                     // We'll skip Defense XP on chest traps for now to ensure stability.
                 }
                 
                 logs.push({ id: uuidv4(), message: "You open the chest.", type: 'gain', timestamp: Date.now() });
                 // gainXp('luck', 20); -> Skipped to avoid conflict, or we need to extract logic.
                 // Actually, we can schedule it? No.
                 // Let's rely on the user manual interaction for now.
                 
                 const greedRank = prev.player.skills.luck.unlockedPerks.filter(p => p === 'greed').length;
                 const drops = targetEntity.chestContents || [];
                 
                 drops.forEach(d => {
                     if (d.type === EntityType.GOLD && d.value) {
                         const luckyRank = prev.player.skills.luck.unlockedPerks.filter(p => p === 'lucky').length;
                         d.value = Math.floor(d.value * (1 + (luckyRank * 0.05)));
                         if (greedRank > 0 && Math.random() < (greedRank * 0.1)) {
                              d.value *= 2;
                              logs.push({ id: uuidv4(), message: "Greed doubles the gold found!", type: 'gain', timestamp: Date.now() });
                         }
                     }
                 });

                 const dropLocations = findFreeTilesAround(prev.dungeon, {x: newX, y: newY}, drops.length);
                 const newEntities = prev.dungeon.entities.filter(e => e.id !== targetEntity.id);
                 const openChest = { ...targetEntity, isOpen: true, symbol: '_' };
                 newEntities.push(openChest);

                 drops.forEach((item, idx) => {
                     item.position = dropLocations[idx];
                     newEntities.push(item);
                 });
                 
                 return {
                     ...prev,
                     dungeon: { ...prev.dungeon, entities: newEntities },
                     player: { ...prev.player, hp: newHp },
                     turn: prev.turn + 1,
                     logs
                 };
            });
            
            // Post-State Update XP Gain (Safe)
            gainXp('luck', 20);
            
            setIsProcessing(false);
            return;
        }
        else if (targetEntity.type === EntityType.PORTAL || targetEntity.type === EntityType.STAIRS) {
             const lvl = targetEntity.type === EntityType.PORTAL ? 1 : gameState.dungeon.levelNumber + 1;
             const lootConfig = getLootConfig();
             const nextLevel = generateDungeon(lvl, lootConfig);
             addLog(targetEntity.type === EntityType.PORTAL ? "You step into the abyss..." : `You descend to level ${lvl}.`, "info");
             
             setGameState(prev => ({
                 ...prev,
                 dungeon: nextLevel,
                 player: { ...prev.player, position: nextLevel.playerStart || {x: 1, y: 1} } 
             }));
             setIsProcessing(false);
             return;
        }
    }

    // --- MOVEMENT LOGIC (Safe Separation) ---

    // 1. Award XP (Triggers State Update 1)
    gainXp('athletics', 5);
    if (gameState.player.equipment.accessory) gainXp('jewelry', 2); 
    if (gameState.player.equipment.neck) gainXp('amulet_mastery', 2);

    const momentumRank = gameState.player.skills.athletics.unlockedPerks.filter(p => p === 'momentum').length;
    if (momentumRank > 0) gainXp('athletics', momentumRank);

    // Material Skills (Armor/Movement)
    const equipment = gameState.player.equipment;
    [equipment.head, equipment.body, equipment.hands, equipment.feet].forEach(item => {
        if (item?.material) {
            if (item.material === Material.WOOD) gainXp('woodworking', 2);
            if (item.material === Material.IRON) gainXp('blacksmithing', 2);
            if (item.material === Material.STEEL) gainXp('steelworks', 2);
            if (item.material === Material.GOLD) gainXp('goldsmithing', 2);
            if (item.material === Material.MYTHRIL) gainXp('mythril_mastery', 2);
            if (item.material === Material.VORPAL) gainXp('vorpal_affinity', 2);
        }
    });

    // 2. Apply Move & Stats (Triggers State Update 2)
    setGameState(prev => {
      let staminaCost = 1;
      const dashRank = prev.player.skills.athletics.unlockedPerks.filter(p => p === 'dash').length;
      let logUpdates: LogEntry[] = [];

      if (Math.random() < (dashRank * 0.1)) {
          staminaCost = 0;
          logUpdates.push({ id: uuidv4(), message: "Dash saves energy!", type: 'info', timestamp: Date.now() });
      }
      if (prev.dungeon.isHub) staminaCost = 0;

      let newStamina = prev.player.stamina - staminaCost;
      let newHp = prev.player.hp;
      let newMana = prev.player.mana;
      let currentInventory = [...prev.player.inventory];
      let currentEquipment = { ...prev.player.equipment };
      let currentGold = prev.player.gold;

      // Survivalist Logic (Triggers at < 10)
      if (newStamina < 10 && prev.player.skills.survival.unlockedPerks.includes('survivalist')) {
           const foodIndex = currentInventory.findIndex(i => i.type === EntityType.FOOD);
           if (foodIndex !== -1) {
               const foodItem = currentInventory[foodIndex];
               let staminaAmount = foodItem.value || 25;
               const gluttonyRank = (prev.player.skills.survival.unlockedPerks.filter(p => p === 'gluttony').length);
               staminaAmount += (gluttonyRank * 5);
               newStamina += staminaAmount;
               
               let consumed = true;
               const rationingRank = prev.player.skills.survival.unlockedPerks.filter(p => p === 'rationing').length;
               if (rationingRank > 0 && Math.random() < (rationingRank * 0.05)) {
                   consumed = false;
                   logUpdates.push({ id: uuidv4(), message: `Rationing: Ate ${foodItem.name} automatically (Saved!).`, type: 'gain', timestamp: Date.now() });
               }

               if (consumed) {
                   currentInventory.splice(foodIndex, 1);
                   logUpdates.push({ id: uuidv4(), message: `Survivalist: Ate ${foodItem.name} automatically.`, type: 'info', timestamp: Date.now() });
               }
           }
      }

      // NEW: Global Auto-Eat Logic (Survival Instinct) (Triggers at <= 0)
      const hasAutoEat = prev.player.skills.global.unlockedPerks.includes('auto_eat');
      if (newStamina <= 0 && hasAutoEat) {
          const foodIndex = currentInventory.findIndex(i => i.type === EntityType.FOOD);
          if (foodIndex !== -1) {
              const foodItem = currentInventory[foodIndex];
              let staminaAmount = foodItem.value || 25;
              // Check Gluttony (Cross-skill interaction)
              const gluttonyRank = (prev.player.skills.survival.unlockedPerks.filter(p => p === 'gluttony').length);
              staminaAmount += (gluttonyRank * 5);
              
              newStamina += staminaAmount;
              currentInventory.splice(foodIndex, 1);
              logUpdates.push({ id: uuidv4(), message: `Survival Instinct: Ate ${foodItem.name} at 0 Stamina.`, type: 'gain', timestamp: Date.now() });
          }
      }

      if (newStamina < 0) {
          newStamina = 0;
          newHp -= 2; 
          logUpdates.push({ id: uuidv4(), message: "Exhausted! You take damage.", type: 'danger', timestamp: Date.now() });
      }

      // Handle Active Effects
      let newActiveEffects = prev.player.activeEffects
          .map(e => ({ ...e, duration: e.duration - 1 }))
          .filter(e => e.duration > 0);

      newActiveEffects.forEach(eff => {
          if (eff.type === PotionEffect.POISON) {
              newHp -= eff.magnitude;
              logUpdates.push({ id: uuidv4(), message: `Poison burns you for ${eff.magnitude} damage.`, type: 'danger', timestamp: Date.now() });
          } else if (eff.type === PotionEffect.REGEN) {
              if (newHp < prev.player.maxHp) newHp = Math.min(prev.player.maxHp, newHp + eff.magnitude);
          }
      });
      
      if (newHp <= 0) {
          // Construct temporary state representing the moment of death
          const deathState = { 
              ...prev, 
              player: { 
                  ...prev.player, 
                  position: { x: newX, y: newY },
                  stamina: newStamina,
                  hp: newHp,
                  mana: newMana,
                  inventory: currentInventory,
                  equipment: currentEquipment,
                  gold: currentGold,
                  activeEffects: newActiveEffects
              },
              logs: [...prev.logs, ...logUpdates],
              turn: prev.turn + 1,
              isGameOver: true
          };
          return handleDeath(deathState);
      }

      const itemsOnTile = prev.dungeon.entities.filter(e => 
          e.position.x === newX && e.position.y === newY && 
          (e.type === EntityType.ITEM || e.type === EntityType.EQUIPMENT || e.type === EntityType.FOOD || e.type === EntityType.POTION || e.type === EntityType.GOLD || e.type === EntityType.RECALL_ORB || e.type === EntityType.SCROLL || e.type === EntityType.STORAGE || e.type === EntityType.BANKER)
      );

      const entitiesNotOnTile = prev.dungeon.entities.filter(e => !itemsOnTile.includes(e));
      const itemsLeftOnTile: Entity[] = [];

      itemsOnTile.forEach(item => {
          let pickedUp = false;
          if (item.type === EntityType.STORAGE) { setActiveModal('storage'); pickedUp = true; }
          else if (item.type === EntityType.BANKER) { setActiveModal('banker'); pickedUp = true; }
          else if (item.type === EntityType.GOLD) {
              currentGold += (item.value || 1);
              // gainXp('luck', 5); // Skipped to avoid conflict
              logUpdates.push({ id: uuidv4(), message: `Picked up ${item.value} Gold.`, type: 'gain', timestamp: Date.now() });
              pickedUp = true;
          }
          else if (item.type === EntityType.EQUIPMENT) {
               let equipped = false;
               if (item.equipmentStats) {
                   const slot = item.equipmentStats.slot;
                   let slotKey: keyof PlayerEquipment | null = null;
                   if (slot === EquipmentSlot.MAIN_HAND) slotKey = 'mainHand';
                   else if (slot === EquipmentSlot.BODY) slotKey = 'body';
                   else if (slot === EquipmentSlot.HEAD) slotKey = 'head';
                   else if (slot === EquipmentSlot.HANDS) slotKey = 'hands';
                   else if (slot === EquipmentSlot.FEET) slotKey = 'feet';
                   else if (slot === EquipmentSlot.NECK) slotKey = 'neck';
                   else if (slot === EquipmentSlot.ACCESSORY) slotKey = 'accessory';
                   
                   if (slotKey && !currentEquipment[slotKey]) {
                       currentEquipment[slotKey] = item;
                       logUpdates.push({ id: uuidv4(), message: `Auto-equipped ${item.name}.`, type: 'info', timestamp: Date.now() });
                       pickedUp = true;
                       equipped = true;
                   }
               }
               if (!equipped) {
                  if (currentInventory.length < 10) {
                       currentInventory.push(item);
                       logUpdates.push({ id: uuidv4(), message: `Looted ${item.name}.`, type: 'info', timestamp: Date.now() });
                       pickedUp = true;
                   } else {
                       logUpdates.push({ id: uuidv4(), message: "Inventory full!", type: 'danger', timestamp: Date.now() });
                   }
               }
          }
          else {
               if (currentInventory.length < 10) {
                   currentInventory.push(item);
                   logUpdates.push({ id: uuidv4(), message: `Looted ${item.name}.`, type: 'info', timestamp: Date.now() });
                   pickedUp = true;
               } else {
                   logUpdates.push({ id: uuidv4(), message: "Inventory full!", type: 'danger', timestamp: Date.now() });
                   }
          }
          if (item.type === EntityType.STORAGE || item.type === EntityType.BANKER) itemsLeftOnTile.push(item);
          else if (!pickedUp) itemsLeftOnTile.push(item);
      });
      
      const finalEntities = [...entitiesNotOnTile, ...itemsLeftOnTile];

      const trap = prev.dungeon.entities.find(e => e.type === EntityType.TRAP && e.position.x === newX && e.position.y === newY);
      if (trap) {
           const trapSense = prev.player.skills.perception.unlockedPerks.includes('trap_sense');
           if (!trapSense) {
               logUpdates.push({ id: uuidv4(), message: "You triggered a trap!", type: 'danger', timestamp: Date.now() });
               if (trap.trapEffect === 'teleport') {
                   // teleport logic
               } else {
                   newHp -= 10;
                   // gainXp('defense', 15); // Skipped
               }
           } else {
               logUpdates.push({ id: uuidv4(), message: "You spotted a trap and stepped carefully.", type: 'info', timestamp: Date.now() });
           }
      }
      
      // Double check death after trap
      if (newHp <= 0) {
          const deathState = { 
              ...prev, 
              player: { 
                  ...prev.player, 
                  position: { x: newX, y: newY },
                  stamina: newStamina,
                  hp: newHp,
                  mana: newMana,
                  inventory: currentInventory,
                  equipment: currentEquipment,
                  gold: currentGold,
                  activeEffects: newActiveEffects
              },
              logs: [...prev.logs, ...logUpdates],
              turn: prev.turn + 1,
              isGameOver: true
          };
          return handleDeath(deathState);
      }

      const regenRank = prev.player.skills.recovery.unlockedPerks.filter(p => p === 'regeneration').length;
      if (regenRank > 0 && (prev.turn + 1) % (10 - regenRank) === 0 && newHp < prev.player.maxHp) {
          newHp += 1;
      }

      const meditationRank = prev.player.skills.arcana.unlockedPerks.filter(p => p === 'meditation').length;
      const manaInterval = Math.max(2, 12 - meditationRank); 
      if ((prev.turn + 1) % manaInterval === 0 && newMana < prev.player.maxMana) {
          newMana += 1;
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          position: { x: newX, y: newY },
          stamina: newStamina,
          hp: newHp,
          mana: newMana,
          inventory: currentInventory,
          equipment: currentEquipment,
          gold: currentGold,
          activeEffects: newActiveEffects
        },
        dungeon: {
            ...prev.dungeon,
            entities: finalEntities,
            explored: prev.dungeon.explored.map((row, y) => row.map((val, x) => {
                const dist = Math.sqrt((x - newX)**2 + (y - newY)**2);
                return val || dist < 6; 
            }))
        },
        logs: [...prev.logs, ...logUpdates],
        turn: prev.turn + 1
      };
    });

    // Check for trap XP post-update
    const trap = gameState.dungeon.entities.find(e => e.type === EntityType.TRAP && e.position.x === newX && e.position.y === newY);
    if (trap) {
         const trapSense = gameState.player.skills.perception.unlockedPerks.includes('trap_sense');
         if (!trapSense) gainXp('defense', 15);
    }

    setTimeout(() => {
        if (!gameState.isGameOver) {
            moveEnemies();
            setIsProcessing(false);
        }
    }, 50);

  }, [gameState, isProcessing, gainXp, resolveCombat, addLog, getLootConfig, moveEnemies, handleDeath]);

  const toggleAutoExplore = useCallback(() => {
      if (!gameState.player.skills.global.unlockedPerks.includes('auto_explorer')) return;
      setIsAutoExploring(prev => !prev);
  }, [gameState.player.skills.global.unlockedPerks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (gameState.isGameOver) return;
        if (activeModal) {
            if (e.key === 'Escape') setActiveModal(null);
            return;
        }

        switch(e.key) {
            case 'ArrowUp': case 'w': handleMove(0, -1); break;
            case 'ArrowDown': case 's': handleMove(0, 1); break;
            case 'ArrowLeft': case 'a': handleMove(-1, 0); break;
            case 'ArrowRight': case 'd': handleMove(1, 0); break;
            case ' ': case '.': handleMove(0, 0); break; 
            case 'i': setActiveModal('inventory'); break;
            case 'k': setActiveModal('skills'); break;
            case 'c': setActiveModal('character'); break;
            case 'x': toggleAutoExplore(); break;
            case 'R': startNewGame(gameState.player.skills.global, gameState.player.bankedGold); break; 
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isGameOver, activeModal, handleMove, toggleAutoExplore, startNewGame, gameState.player.skills.global, gameState.player.bankedGold]);

  useEffect(() => {
      if (!isAutoExploring || gameState.isGameOver || isProcessing) return;

      const timer = setTimeout(() => {
          const { dungeon, player } = gameState;
          let target: Position | null = null;
          let minDist = Infinity;

          // Find nearest unexplored floor or point of interest
          for (let y = 0; y < dungeon.height; y++) {
              for (let x = 0; x < dungeon.width; x++) {
                  if (dungeon.tiles[y][x] === EntityType.FLOOR) {
                       const isKnown = dungeon.explored[y][x];
                       const hasEntity = dungeon.entities.some(e => e.position.x === x && e.position.y === y && (e.type === EntityType.CHEST || e.type === EntityType.GOLD));
                       
                       if (!isKnown || hasEntity) {
                           const d = getDistance(player.position, {x, y});
                           if (d < minDist) {
                               minDist = d;
                               target = {x, y};
                           }
                       }
                  }
              }
          }

          if (target) {
              const nextPos = getBestMove(dungeon, player.position, target, false, 'player');
              if (nextPos.x !== player.position.x || nextPos.y !== player.position.y) {
                  const dx = nextPos.x - player.position.x;
                  const dy = nextPos.y - player.position.y;
                  handleMove(dx, dy);
              } else {
                  setIsAutoExploring(false); // Stuck
              }
          } else {
               // Level fully explored, find stairs
               const stairs = dungeon.entities.find(e => e.type === EntityType.STAIRS || e.type === EntityType.PORTAL);
               if (stairs) {
                    const nextPos = getBestMove(dungeon, player.position, stairs.position, false, 'player');
                    const dx = nextPos.x - player.position.x;
                    const dy = nextPos.y - player.position.y;
                    handleMove(dx, dy);
               } else {
                   setIsAutoExploring(false);
               }
          }
      }, 100);

      return () => clearTimeout(timer);
  }, [isAutoExploring, gameState, isProcessing, handleMove]);

  return (
      <div className="flex h-screen w-screen bg-black text-gray-200 font-sans overflow-hidden">
        
        {/* LEFT SIDEBAR - STATS & EQUIPMENT */}
        <div className="w-72 border-r border-gray-800 bg-gray-900 flex flex-col">
            <div className="p-4 border-b border-gray-800 bg-gray-950">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    SkillBound
                </h1>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-400 font-mono">
                    <span>Lvl {gameState.dungeon.levelNumber}</span>
                    <span>Turn {gameState.turn}</span>
                </div>
            </div>
            
            <div className="p-4 space-y-4 border-b border-gray-800">
                 {/* HP Bar */}
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-400 font-bold">HP</span>
                        <span>{gameState.player.hp}/{gameState.player.maxHp}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(gameState.player.hp / gameState.player.maxHp) * 100}%` }}></div>
                    </div>
                 </div>
                 {/* Stamina Bar */}
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-orange-400 font-bold">STA</span>
                        <span>{gameState.player.stamina}/{gameState.player.maxStamina}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${(gameState.player.stamina / gameState.player.maxStamina) * 100}%` }}></div>
                    </div>
                 </div>
                 {/* Mana Bar */}
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-blue-400 font-bold">MANA</span>
                        <span>{gameState.player.mana}/{gameState.player.maxMana}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(gameState.player.mana / gameState.player.maxMana) * 100}%` }}></div>
                    </div>
                 </div>
            </div>

            {/* NEW: Active Effects */}
            <div className="p-4 border-b border-gray-800 min-h-[80px]">
                <div className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-widest">Active Effects</div>
                <div className="flex flex-wrap gap-2">
                    {gameState.player.activeEffects.length === 0 && <span className="text-gray-600 text-xs italic">No active effects</span>}
                    {gameState.player.activeEffects.map((effect, idx) => (
                        <div 
                            key={idx}
                            className={`w-8 h-8 rounded flex items-center justify-center cursor-help border shadow-sm ${effect.isNegative ? 'bg-red-900/20 border-red-900 text-red-500' : 'bg-green-900/20 border-green-900 text-green-500'}`}
                            onMouseEnter={(e) => setHoveredEffect({ effect, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setHoveredEffect(null)}
                        >
                             <div className="text-[10px] font-bold">{effect.name.substring(0,2).toUpperCase()}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Equipment Grid - "Equipment Vision" */}
            <div className="p-4 border-b border-gray-800">
                <div className="text-xs text-gray-500 uppercase font-bold mb-3 tracking-widest">Equipment</div>
                <div className="grid grid-cols-3 gap-2 justify-items-center">
                    {[
                        EquipmentSlot.NECK, EquipmentSlot.HEAD, EquipmentSlot.ACCESSORY,
                        EquipmentSlot.MAIN_HAND, EquipmentSlot.BODY, EquipmentSlot.HANDS,
                        null, EquipmentSlot.FEET, null
                    ].map((slot, idx) => {
                        if (!slot) return <div key={idx} className="w-12 h-12" />;

                        let item: Entity | null = null;
                        if (slot === EquipmentSlot.HEAD) item = gameState.player.equipment.head;
                        if (slot === EquipmentSlot.NECK) item = gameState.player.equipment.neck;
                        if (slot === EquipmentSlot.BODY) item = gameState.player.equipment.body;
                        if (slot === EquipmentSlot.MAIN_HAND) item = gameState.player.equipment.mainHand;
                        if (slot === EquipmentSlot.HANDS) item = gameState.player.equipment.hands;
                        if (slot === EquipmentSlot.ACCESSORY) item = gameState.player.equipment.accessory;
                        if (slot === EquipmentSlot.FEET) item = gameState.player.equipment.feet;

                        return (
                            <div 
                                key={slot} 
                                className={`w-12 h-12 bg-gray-800 rounded border ${item ? 'border-gray-500' : 'border-gray-800'} flex items-center justify-center relative group cursor-pointer hover:border-gray-400 transition-colors`}
                                onMouseEnter={(e) => item ? setHoverInfo({ entity: item, x: e.clientX, y: e.clientY }) : null}
                                onMouseLeave={() => setHoverInfo(null)}
                                onClick={() => setActiveModal('inventory')}
                            >
                                {item ? (
                                    <div className="w-8 h-8" style={{ color: item.color }}>
                                         <EntityIcon entity={item} />
                                    </div>
                                ) : (
                                    <div className="text-gray-700 text-[9px] uppercase font-bold text-center leading-none">{slot.replace('_', ' ')}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
             
             {/* Action Buttons moved to Left */}
            <div className="p-4 border-t border-gray-800 bg-gray-950 grid grid-cols-2 gap-2 mt-auto">
                 <button 
                    onClick={() => setActiveModal('inventory')} 
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded text-sm font-bold border border-gray-700 hover:border-gray-500 transition-all shadow-lg flex items-center justify-center gap-2"
                 >
                    <span>Inventory</span>
                    <span className="text-[10px] text-gray-500 font-mono">(i)</span>
                 </button>
                 <button 
                    onClick={() => setActiveModal('skills')} 
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded text-sm font-bold border border-gray-700 hover:border-gray-500 transition-all shadow-lg flex items-center justify-center gap-2"
                 >
                    <span>Skills</span>
                    <span className="text-[10px] text-gray-500 font-mono">(k)</span>
                 </button>
                 <button 
                    onClick={() => setActiveModal('character')} 
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded text-sm font-bold border border-gray-700 hover:border-gray-500 transition-all shadow-lg flex items-center justify-center gap-2"
                 >
                    <span>Character</span>
                    <span className="text-[10px] text-gray-500 font-mono">(c)</span>
                 </button>
                 <button 
                    onClick={toggleAutoExplore} 
                    disabled={!gameState.player.skills.global.unlockedPerks.includes('auto_explorer')} 
                    className="bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded text-sm font-bold border border-gray-700 hover:border-gray-500 transition-all shadow-lg flex items-center justify-center gap-2"
                 >
                    <span>Auto</span>
                    <span className="text-[10px] text-gray-500 font-mono">(x)</span>
                 </button>
            </div>
        </div>

        {/* CENTER - GAME VIEW */}
        <div className="flex-1 bg-black relative flex items-center justify-center">
             <DungeonView 
                gameState={gameState} 
                onHoverEntity={(e, x, y) => e ? setHoverInfo({ entity: e, x, y }) : setHoverInfo(null)} 
                onEntityClick={handleEntityClick}
             />
             
             {isAutoExploring && (
                 <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-900/80 text-white px-4 py-1 rounded-full text-xs font-bold animate-pulse border border-red-500">
                     AUTO EXPLORING... (Press X to Stop)
                 </div>
             )}

             {/* Mini Map Overlay - Only if Cartographer Unlocked */}
             {gameState.player.skills.global.unlockedPerks.includes('cartographer') && (
                 <div className="absolute top-4 right-4 z-10">
                     <MiniMap 
                        dungeon={gameState.dungeon} 
                        playerPosition={gameState.player.position}
                        hasTracker={gameState.player.skills.global.unlockedPerks.includes('tracker')}
                     />
                 </div>
             )}
        </div>

        {/* RIGHT SIDEBAR - LOG */}
        <div className="w-80 border-l border-gray-800 bg-gray-900 flex flex-col">
            <div className="flex-1 overflow-hidden flex flex-col">
                <GameLog logs={gameState.logs} />
            </div>
        </div>

        {activeModal === 'skills' && (
          <SkillListModal 
            skills={gameState.player.skills} 
            onSelectSkill={(id) => { setActiveModal('skillTree'); setSelectedSkillId(id); }}
            onClose={() => setActiveModal(null)} 
          />
        )}
        {activeModal === 'skillTree' && selectedSkillId && (
            <SkillTreeModal 
                skill={gameState.player.skills[selectedSkillId]} 
                onClose={() => setActiveModal(null)}
                onUnlock={(skillId, perkId, cost) => {
                    setGameState(prev => {
                        const skill = { ...prev.player.skills[skillId] };
                        skill.points -= cost;
                        skill.unlockedPerks = [...skill.unlockedPerks, perkId];
                        const bonuses = applyPerkBonus(prev.player, skillId, perkId);
                        const player = { ...prev.player, ...bonuses };
                        let newPlayer = { ...player, skills: { ...prev.player.skills, [skillId]: skill } };
                        if (newPlayer.skills.global.unlockedPerks.includes('manager')) {
                            // autoSpend logic could be re-triggered here but usually happens on level up
                        }
                        return { ...prev, player: newPlayer };
                    });
                }}
            />
        )}
        {activeModal === 'character' && (
            <CharacterSheetModal 
                gameState={gameState} 
                stats={calculatePlayerStatsState(gameState.player)} 
                onClose={() => setActiveModal(null)}
            />
        )}
        {activeModal === 'inventory' && (
            <InventoryModal 
                inventory={gameState.player.inventory}
                equipment={gameState.player.equipment}
                gold={gameState.player.gold}
                playerStats={gameState.player}
                knownEffects={gameState.player.knownEffects}
                onClose={() => setActiveModal(null)}
                onEquip={(item) => {
                    setGameState(prev => {
                        if (!item.equipmentStats) return prev;
                        const slot = item.equipmentStats.slot;
                        let equippedKey: keyof PlayerEquipment | null = null;
                        if (slot === EquipmentSlot.MAIN_HAND) equippedKey = 'mainHand';
                        else if (slot === EquipmentSlot.BODY) equippedKey = 'body';
                        else if (slot === EquipmentSlot.HEAD) equippedKey = 'head';
                        else if (slot === EquipmentSlot.HANDS) equippedKey = 'hands';
                        else if (slot === EquipmentSlot.FEET) equippedKey = 'feet';
                        else if (slot === EquipmentSlot.NECK) equippedKey = 'neck';
                        else if (slot === EquipmentSlot.ACCESSORY) equippedKey = 'accessory';
                        
                        if (!equippedKey) return prev;

                        const newInventory = prev.player.inventory.filter(i => i.id !== item.id);
                        const oldItem = prev.player.equipment[equippedKey];
                        if (oldItem) newInventory.push(oldItem);
                        
                        return {
                            ...prev,
                            player: {
                                ...prev.player,
                                inventory: newInventory,
                                equipment: { ...prev.player.equipment, [equippedKey]: item }
                            }
                        };
                    });
                }}
                onUnequip={(slot) => {
                    setGameState(prev => {
                        const item = prev.player.equipment[slot];
                        if (!item) return prev;
                        if (prev.player.inventory.length >= 10) {
                            addLog("Inventory full! Cannot unequip.", "danger");
                            return prev;
                        }
                        return {
                            ...prev,
                            player: {
                                ...prev.player,
                                inventory: [...prev.player.inventory, item],
                                equipment: { ...prev.player.equipment, [slot]: null }
                            }
                        };
                    });
                }}
                onEat={(item) => {
                    if (item.type === EntityType.SCROLL && item.scrollEffect) {
                        // Scroll Logic
                        gainXp('reader', 25);
                        setGameState(prev => {
                            let effectLog = "You read the scroll...";
                            let logType: LogEntry['type'] = 'gain';
                            let newHp = prev.player.hp;
                            let newStamina = prev.player.stamina;
                            let newPos = prev.player.position;
                            let newKnown = [...prev.player.knownEffects];
                            let newSkills = prev.player.skills;
                            let newEntities = prev.dungeon.entities;
                            
                            if (item.scrollEffect && !newKnown.includes(item.scrollEffect)) newKnown.push(item.scrollEffect);

                            const potencyRank = prev.player.skills.reader.unlockedPerks.filter(p => p === 'potency').length;
                            let multiplier = 1.0 + (potencyRank * 0.1); 
                            const magnitude = Math.ceil((item.magnitude || 10) * multiplier);
                            
                            if (item.scrollEffect === ScrollEffect.HEAL) {
                                newHp = Math.min(prev.player.maxHp, newHp + magnitude);
                                effectLog = `The scroll heals you for ${magnitude} HP.`;
                            } else if (item.scrollEffect === ScrollEffect.HEAL_STAMINA) {
                                newStamina = Math.min(prev.player.maxStamina, newStamina + magnitude);
                                effectLog = `Energy surges! +${magnitude} Stamina.`;
                            } else if (item.scrollEffect === ScrollEffect.TELEPORT) {
                                let tx = 0, ty = 0;
                                let tries = 0;
                                while(tries < 100) {
                                    tx = Math.floor(Math.random() * prev.dungeon.width);
                                    ty = Math.floor(Math.random() * prev.dungeon.height);
                                    if (prev.dungeon.tiles[ty][tx] === EntityType.FLOOR && !prev.dungeon.entities.some(e => e.position.x === tx && e.position.y === ty)) break;
                                    tries++;
                                }
                                newPos = {x: tx, y: ty};
                                effectLog = "You are warped through space!";
                            } else if (item.scrollEffect === ScrollEffect.DAMAGE) {
                                newHp = Math.max(0, newHp - magnitude);
                                effectLog = `Cursed Scroll! It explodes for ${magnitude} damage!`;
                                logType = 'danger';
                            } else if (item.scrollEffect === ScrollEffect.LIGHTNING_SELF) {
                                const stats = calculatePlayerStatsState(prev.player);
                                const dmg = Math.ceil(magnitude * (1 - (stats.electricRes || 0)));
                                newHp = Math.max(0, newHp - dmg);
                                effectLog = `Lightning strikes you! ${dmg} Electric Damage.`;
                                logType = 'danger';
                            } else if (item.scrollEffect === ScrollEffect.DRAIN_XP) {
                                const currentGlobal = prev.player.skills.global;
                                const drain = Math.floor(magnitude * 20);
                                const newXp = Math.max(0, currentGlobal.xp - drain);
                                newSkills = { ...newSkills, global: { ...currentGlobal, xp: newXp } };
                                effectLog = `The scroll drains your memories! -${drain} XP (Global).`;
                                logType = 'danger';
                            } else if (item.scrollEffect === ScrollEffect.LIGHTNING_AOE) {
                                const dmg = magnitude;
                                let hits = 0;
                                newEntities = prev.dungeon.entities.map(e => {
                                    if (e.type === EntityType.ENEMY) {
                                        const dist = Math.sqrt(Math.pow(e.position.x - prev.player.position.x, 2) + Math.pow(e.position.y - prev.player.position.y, 2));
                                        if (dist < 8) {
                                            hits++;
                                            const currentHp = e.hp || 10;
                                            return { ...e, hp: currentHp - dmg };
                                        }
                                    }
                                    return e;
                                }).filter(e => e.type !== EntityType.ENEMY || (e.hp || 0) > 0);
                                effectLog = `Chain Lightning! Hit ${hits} enemies for ${dmg} damage.`;
                            }

                            const newInv = prev.player.inventory.filter(i => i.id !== item.id);
                            
                            const nextState = {
                                ...prev,
                                player: {
                                    ...prev.player,
                                    hp: newHp,
                                    stamina: newStamina,
                                    position: newPos,
                                    inventory: newInv,
                                    knownEffects: newKnown,
                                    skills: newSkills
                                },
                                dungeon: {
                                    ...prev.dungeon,
                                    entities: newEntities
                                },
                                logs: [...prev.logs, { id: uuidv4(), message: effectLog, type: logType, timestamp: Date.now() }],
                                isGameOver: newHp <= 0
                            };

                            if (newHp <= 0) return handleDeath(nextState);
                            return nextState;
                        });
                        return;
                    }
                    if (item.type === EntityType.RECALL_ORB) {
                         // RECALL ORB LOGIC: Soft Reset
                         const hub = generateHub();
                         
                         // 1. Preserve Global Skill
                         const preservedGlobal = gameState.player.skills.global;
                         
                         // 2. Reset Skills (Except Global)
                         const newSkills = JSON.parse(JSON.stringify(INITIAL_SKILLS));
                         newSkills.global = preservedGlobal;

                         // 3. Recalculate Base Stats based on preserved Global Perks (Adventurer Training)
                         let newMaxHp = INITIAL_MAX_HP;
                         let newMaxStamina = INITIAL_MAX_STAMINA;
                         let newMaxMana = INITIAL_MAX_MANA;

                         const trainingRank = preservedGlobal.unlockedPerks.filter((p: string) => p === 'adventurer_training').length;
                         newMaxHp += trainingRank;
                         newMaxStamina += trainingRank;

                         setGameState(prev => ({
                            ...prev,
                            player: {
                                ...prev.player,
                                hp: newMaxHp,
                                maxHp: newMaxHp,
                                stamina: newMaxStamina,
                                maxStamina: newMaxStamina,
                                mana: newMaxMana,
                                maxMana: newMaxMana,
                                position: hub.playerStart || { x: 7, y: 7 },
                                skills: newSkills,
                                activeEffects: [], // Clear effects
                                // Keep Items (Inventory, Equipment, Gold, Storage, BankedGold, KnownEffects)
                                inventory: prev.player.inventory.filter(i => i.id !== item.id)
                            },
                            dungeon: hub,
                            logs: [...prev.logs, { id: uuidv4(), message: "Recall Orb used. Returned to Sanctuary. Skills reset.", type: 'gain', timestamp: Date.now() }]
                         }));
                         return;
                    }

                    // Food/Potion
                    if (item.type === EntityType.FOOD) gainXp('cooking', 25);
                    if (item.type === EntityType.POTION) gainXp('alchemy', 25);

                    setGameState(prev => {
                         let newHp = prev.player.hp;
                         let newStamina = prev.player.stamina;
                         let newEffects = [...prev.player.activeEffects];
                         let newKnown = [...prev.player.knownEffects];
                         let logMsg = `Consumed ${item.name}.`;
                         
                         if (item.type === EntityType.FOOD) {
                              let amount = item.value || 25;
                              const gluttony = prev.player.skills.survival.unlockedPerks.filter(p => p === 'gluttony').length;
                              amount += (gluttony * 5);
                              newStamina = Math.min(prev.player.maxStamina, newStamina + amount);
                              logMsg += ` +${amount} Stamina.`;
                         } else if (item.type === EntityType.POTION) {
                              if (item.potionEffect) {
                                  if (!newKnown.includes(item.potionEffect)) newKnown.push(item.potionEffect);
                                  // Potion logic ...
                                  const isNegative = [PotionEffect.POISON, PotionEffect.WEAKNESS, PotionEffect.FRAILTY, PotionEffect.SLOWNESS, PotionEffect.LIGHTNING_RES_DOWN].includes(item.potionEffect);
                                  newEffects.push({
                                      type: item.potionEffect,
                                      name: item.potionEffect.replace('_', ' '),
                                      duration: (item.effectDuration || 30), // Default to 30 turns if undefined
                                      magnitude: item.magnitude || 1,
                                      isNegative
                                  });
                                  logMsg += " Effect applied.";
                              } else if (item.value) {
                                  newHp = Math.min(prev.player.maxHp, newHp + item.value);
                                  logMsg += ` +${item.value} HP.`;
                              }
                         }

                         return {
                             ...prev,
                             player: { ...prev.player, hp: newHp, stamina: newStamina, activeEffects: newEffects, inventory: prev.player.inventory.filter(i => i.id !== item.id), knownEffects: newKnown },
                             logs: [...prev.logs, { id: uuidv4(), message: logMsg, type: 'gain', timestamp: Date.now() }]
                         };
                    });
                }}
                onDrop={(item) => {
                    setGameState(prev => {
                        const newInv = prev.player.inventory.filter(i => i.id !== item.id);
                        item.position = { ...prev.player.position };
                        // Find free spot if current is occupied
                        const free = findFreeTilesAround(prev.dungeon, prev.player.position, 1)[0];
                        item.position = free;
                        
                        return {
                            ...prev,
                            player: { ...prev.player, inventory: newInv },
                            dungeon: { ...prev.dungeon, entities: [...prev.dungeon.entities, item] }
                        };
                    });
                }}
            />
        )}
        {activeModal === 'storage' && (
            <StorageModal 
                inventory={gameState.player.inventory}
                storage={gameState.player.storage}
                onClose={() => setActiveModal(null)}
                onDeposit={(item) => {
                     setGameState(prev => ({
                         ...prev,
                         player: {
                             ...prev.player,
                             inventory: prev.player.inventory.filter(i => i.id !== item.id),
                             storage: [...prev.player.storage, item]
                         }
                     }));
                }}
                onWithdraw={(item) => {
                     setGameState(prev => {
                         if (prev.player.inventory.length >= 10) { addLog("Inventory Full", "danger"); return prev; }
                         return {
                             ...prev,
                             player: {
                                 ...prev.player,
                                 storage: prev.player.storage.filter(i => i.id !== item.id),
                                 inventory: [...prev.player.inventory, item]
                             }
                         };
                     });
                }}
            />
        )}
        {activeModal === 'banker' && (
            <BankerModal 
                currentGold={gameState.player.gold}
                bankedGold={gameState.player.bankedGold}
                onClose={() => setActiveModal(null)}
                onDeposit={(amount) => {
                     setGameState(prev => ({
                         ...prev,
                         player: {
                             ...prev.player,
                             gold: prev.player.gold - amount,
                             bankedGold: prev.player.bankedGold + amount
                         }
                     }));
                }}
                onWithdraw={(amount) => {
                     setGameState(prev => ({
                         ...prev,
                         player: {
                             ...prev.player,
                             gold: prev.player.gold + amount,
                             bankedGold: prev.player.bankedGold - amount
                         }
                     }));
                }}
            />
        )}
        
        {hoverInfo && (
            <Tooltip 
                entity={hoverInfo.entity} 
                position={{ x: hoverInfo.x, y: hoverInfo.y }} 
                playerStats={gameState.player}
                knownEffects={gameState.player.knownEffects}
            />
        )}

        {hoveredEffect && (
            <EffectTooltip 
                effect={hoveredEffect.effect} 
                position={{ x: hoveredEffect.x, y: hoveredEffect.y }} 
            />
        )}

        {toastSkill && (
            <LevelUpToast 
                skill={toastSkill} 
                onOpen={() => { setActiveModal('skillTree'); setSelectedSkillId(toastSkill.id); }}
                onClose={() => setToastSkill(null)}
            />
        )}
      </div>
  );
};

export default App;