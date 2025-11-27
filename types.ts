

export type SkillType = 'athletics' | 'combat' | 'perception' | 'recovery' | 'arcana' | 'survival' | 'weaponry' | 'defense' | 'jewelry' | 'amulet_mastery' | 'luck' | 'cooking' | 'reader' | 'alchemy' | 'fist' | 'global' | 'woodworking' | 'blacksmithing' | 'steelworks' | 'goldsmithing' | 'mythril_mastery' | 'vorpal_affinity' | 'fire_magic' | 'ice_magic' | 'electric_magic' | 'earth_magic' | 'water_magic' | 'light_magic' | 'dark_magic';

export interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number; // Cost in skill points
  requiredLevel?: number;
  maxRanks?: number; // Optional: max times this perk can be upgraded
  prerequisites?: string[]; // IDs of required perks
}

export interface Skill {
  id: SkillType;
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  description: string;
  levelingInfo: string; // How to gain XP
  color: string;
  points: number; // Available points to spend
  unlockedPerks: string[]; // IDs of unlocked perks (can contain duplicates for ranked perks)
}

export interface Position {
  x: number;
  y: number;
  w?: number;
  h?: number;
}

export enum EntityType {
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY',
  ITEM = 'ITEM', // Generic/Quest items
  EQUIPMENT = 'EQUIPMENT',
  STAIRS = 'STAIRS',
  WALL = 'WALL',
  FLOOR = 'FLOOR',
  TRAP = 'TRAP',
  FOOD = 'FOOD',
  POTION = 'POTION',
  RECALL_ORB = 'RECALL_ORB',
  SCROLL = 'SCROLL', // New Type
  CHEST = 'CHEST',
  GOLD = 'GOLD',
  PORTAL = 'PORTAL',
  STORAGE = 'STORAGE',
  BANKER = 'BANKER',
}

export enum EquipmentSlot {
  HEAD = 'HEAD',
  BODY = 'BODY',
  HANDS = 'HANDS',
  FEET = 'FEET',
  MAIN_HAND = 'MAIN_HAND',
  NECK = 'NECK',
  ACCESSORY = 'ACCESSORY' // Ring
}

export enum Element {
    FIRE = 'FIRE',
    ICE = 'ICE',
    ELECTRIC = 'ELECTRIC',
    EARTH = 'EARTH',
    WATER = 'WATER',
    LIGHT = 'LIGHT',
    DARK = 'DARK'
}

export enum ScrollEffect {
    HEAL = 'HEAL',
    HEAL_STAMINA = 'HEAL_STAMINA',
    DAMAGE = 'DAMAGE',
    DRAIN_XP = 'DRAIN_XP',
    TELEPORT = 'TELEPORT',
    LIGHTNING_SELF = 'LIGHTNING_SELF', // New: Negative Lightning
    LIGHTNING_AOE = 'LIGHTNING_AOE',    // New: Positive Lightning
    LEVEL_UP = 'LEVEL_UP' // New: Instant Level Up
}

export enum PotionEffect {
    STRENGTH = 'STRENGTH',
    WEAKNESS = 'WEAKNESS',
    STONESKIN = 'STONESKIN',
    FRAILTY = 'FRAILTY',
    HASTE = 'HASTE',
    SLOWNESS = 'SLOWNESS',
    REGEN = 'REGEN',
    POISON = 'POISON',
    LIGHTNING_DMG_UP = 'LIGHTNING_DMG_UP',
    LIGHTNING_RES_DOWN = 'LIGHTNING_RES_DOWN',
    FIRE_DMG_UP = 'FIRE_DMG_UP',
    ICE_DMG_UP = 'ICE_DMG_UP',
    EARTH_DMG_UP = 'EARTH_DMG_UP',
    WATER_DMG_UP = 'WATER_DMG_UP',
    LIGHT_DMG_UP = 'LIGHT_DMG_UP',
    DARK_DMG_UP = 'DARK_DMG_UP'
}

export interface ActiveEffect {
    type: PotionEffect;
    name: string;
    duration: number;
    magnitude: number;
    isNegative: boolean;
    durationUnit?: 'turn' | 'floor';
}

export interface ElementalAffix {
    element: Element;
    chance: number; // 0-1
    minDmg: number;
    maxDmg: number;
}

export interface EquipmentStats {
  slot: EquipmentSlot;
  damage?: number;
  armor?: number;
  effect?: string;
  // New Affixes
  bonusDodge?: number; // % chance
  bonusDoubleStrike?: number; // % chance
  bonusCrit?: number; // % chance
  bonusHp?: number; // Flat value
  bonusStamina?: number; // Flat value
  
  // Resistances (0.0 - 1.0)
  fireRes?: number;
  iceRes?: number;
  electricRes?: number;
  earthRes?: number;
  waterRes?: number;
  lightRes?: number;
  darkRes?: number;

  // Magic
  element?: Element; // If it's a wand
  elementalAffixes?: ElementalAffix[];
}

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC'
}

export enum Material {
  WOOD = 'WOOD',
  IRON = 'IRON',
  STEEL = 'STEEL',
  GOLD = 'GOLD',
  MYTHRIL = 'MYTHRIL',
  VORPAL = 'VORPAL'
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  position: Position;
  symbol: string;
  color: string;
  hp?: number;
  maxHp?: number;
  flavor?: string;
  isHidden?: boolean; // For traps
  equipmentStats?: EquipmentStats; // Only for EQUIPMENT type
  rarity?: Rarity;
  material?: Material; // New property
  magnitude?: number; // New: For scaling potion/scroll power based on dungeon level

  // Enemy Specific
  classId?: string; // warrior, archer, mage, thief
  aiState?: {
      thiefHasAttacked?: boolean;
      cooldown?: number;
  };

  // Chest specific
  isOpen?: boolean;
  isTrapped?: boolean;
  chestContents?: Entity[]; // Items inside the chest
  value?: number; // For Gold amount or Food/Potion potency
  
  // Scroll specific
  scrollEffect?: ScrollEffect;

  // Potion specific
  potionEffect?: PotionEffect;
  effectDuration?: number;

  // Enemy Scaling
  combatStats?: {
      damage: number;
      armor: number;
      xpReward: number;
      attackElement?: Element; // For resistance logic
  };

  // Trap Specific
  trapEffect?: 'damage' | 'teleport';
}

export interface DungeonLevel {
  levelNumber: number;
  width: number;
  height: number;
  tiles: EntityType[][]; // Grid of static types (Wall/Floor)
  entities: Entity[]; // Dynamic objects (Enemies, Items)
  explored: boolean[][]; // Fog of war
  isHub?: boolean;
  playerStart?: Position;
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'combat' | 'gain' | 'narrative' | 'danger';
  timestamp: number;
}

export interface PlayerEquipment {
  head: Entity | null;
  body: Entity | null;
  hands: Entity | null;
  feet: Entity | null;
  mainHand: Entity | null;
  neck: Entity | null;
  accessory: Entity | null;
}

export interface GameState {
  player: {
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    stamina: number;
    maxStamina: number;
    position: Position;
    skills: Record<SkillType, Skill>;
    equipment: PlayerEquipment;
    inventory: Entity[];
    storage: Entity[]; // Items in Hub Chest
    gold: number;
    bankedGold: number; // Gold stored in the bank (Safe from death, earns interest)
    activeEffects: ActiveEffect[]; 
    knownEffects: string[]; // New: List of discovered Potion/Scroll effects
  };
  dungeon: DungeonLevel;
  logs: LogEntry[];
  turn: number;
  isGameOver: boolean;
}

export interface LootConfig {
    luckLevel: number;
    adventurerLevel: number; // Global skill level affects material tier
    betterLootChance: number; // From Luck 'rare_finds'
    betterEquipmentChance: number; // From Jewelry 'appraiser'
}