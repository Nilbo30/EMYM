

import { DungeonLevel, EntityType, Entity, Position, EquipmentSlot, Rarity, LootConfig, Material, Element, EquipmentStats, ScrollEffect, PotionEffect } from "../types";
import { v4 as uuidv4 } from 'uuid';

const DUNGEON_SIZE = 60;
const MIN_ROOM_SIZE = 6;
const MAX_ROOM_SIZE = 10;
const MAX_ROOMS = 25;

interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
  center: Position;
}

const RARITY_CONFIG = {
    [Rarity.COMMON]:   { color: '#94a3b8', multiplier: 1.0, prefix: '' },
    [Rarity.UNCOMMON]: { color: '#4ade80', multiplier: 1.2, prefix: 'Fine ' }, // Green
    [Rarity.RARE]:     { color: '#3b82f6', multiplier: 1.5, prefix: 'Rare ' }, // Blue
    [Rarity.EPIC]:     { color: '#a855f7', multiplier: 2.5, prefix: 'Epic ' }  // Purple
};

const MATERIAL_STATS = {
    [Material.WOOD]: { baseDmg: 2, baseArm: 1, color: '#7c2d12' },
    [Material.IRON]: { baseDmg: 4, baseArm: 3, color: '#525252' },
    [Material.STEEL]: { baseDmg: 7, baseArm: 5, color: '#60a5fa' },
    [Material.GOLD]: { baseDmg: 6, baseArm: 4, color: '#fbbf24' }, 
    [Material.MYTHRIL]: { baseDmg: 12, baseArm: 9, color: '#22d3ee' },
    [Material.VORPAL]: { baseDmg: 20, baseArm: 15, color: '#4c1d95' }
};

const getMaterial = (levelNum: number, adventurerLevel: number): Material => {
    const effectiveLevel = levelNum + (adventurerLevel * 0.5);
    const roll = Math.random() * effectiveLevel;

    if (roll > 18) return Material.VORPAL;
    if (roll > 12) return Material.MYTHRIL;
    if (roll > 8 && Math.random() < 0.3) return Material.GOLD; 
    if (roll > 6) return Material.STEEL;
    if (roll > 3) return Material.IRON;
    return Material.WOOD;
};

const getRarity = (levelNum: number, lootConfig: LootConfig): Rarity => {
    const roll = Math.random();
    
    // Base chances
    let epicChance = 0.01 + (levelNum * 0.002);
    let rareChance = 0.05 + (levelNum * 0.005);
    let uncommonChance = 0.15 + (levelNum * 0.01);

    if (lootConfig) {
        epicChance += (lootConfig.betterLootChance || 0);
        rareChance += (lootConfig.betterEquipmentChance || 0); 
        uncommonChance += (lootConfig.betterEquipmentChance || 0);
        
        epicChance += (lootConfig.luckLevel * 0.001);
        rareChance += (lootConfig.luckLevel * 0.003);
        uncommonChance += (lootConfig.luckLevel * 0.005);
    }

    if (roll < epicChance) return Rarity.EPIC;
    if (roll < epicChance + rareChance) return Rarity.RARE;
    if (roll < epicChance + rareChance + uncommonChance) return Rarity.UNCOMMON;
    return Rarity.COMMON;
};

const applyAffixes = (stats: EquipmentStats, rarity: Rarity): EquipmentStats => {
    if (rarity === Rarity.COMMON) return stats;

    const newStats = { ...stats };
    
    // Logic: Uncommon = 1, Rare = 2, Epic = 3
    let numAffixes = 0;
    if (rarity === Rarity.UNCOMMON) numAffixes = 1;
    if (rarity === Rarity.RARE) numAffixes = 2;
    if (rarity === Rarity.EPIC) numAffixes = 3;

    const elements = [Element.FIRE, Element.ICE, Element.ELECTRIC, Element.EARTH, Element.WATER, Element.LIGHT, Element.DARK];

    for (let i = 0; i < numAffixes; i++) {
        const roll = Math.random();
        
        // Weapon Affixes (If item has base damage)
        if (stats.damage) {
            if (roll < 0.15) newStats.bonusCrit = (newStats.bonusCrit || 0) + 0.05;
            else if (roll < 0.30) newStats.bonusDoubleStrike = (newStats.bonusDoubleStrike || 0) + 0.05;
            // Added HP and Stamina to weapons to match Armor utility
            else if (roll < 0.40) newStats.bonusHp = (newStats.bonusHp || 0) + 10;
            else if (roll < 0.50) newStats.bonusStamina = (newStats.bonusStamina || 0) + 10;
            else if (roll < 0.75) {
                // Elemental Affix
                const el = elements[Math.floor(Math.random() * elements.length)];
                
                newStats.elementalAffixes = newStats.elementalAffixes || [];
                // Check if element already exists, if so add damage, otherwise push new
                const existing = newStats.elementalAffixes.find(a => a.element === el);
                if (existing) {
                    existing.minDmg += 1;
                    existing.maxDmg += 2;
                } else {
                    newStats.elementalAffixes.push({
                        element: el,
                        chance: 0.15,
                        minDmg: 1,
                        maxDmg: 3
                    });
                }
            } else {
                 newStats.damage = (newStats.damage || 0) + 1;
            }
        } 
        // Armor/Accessory Affixes
        else {
            if (roll < 0.15) newStats.bonusDodge = (newStats.bonusDodge || 0) + 0.02;
            // Added Crit chance to armor (lower probability and value than weapon)
            else if (roll < 0.20) newStats.bonusCrit = (newStats.bonusCrit || 0) + 0.03;
            else if (roll < 0.35) newStats.bonusHp = (newStats.bonusHp || 0) + 10;
            else if (roll < 0.50) newStats.bonusStamina = (newStats.bonusStamina || 0) + 10;
            else if (roll < 0.80) {
                // Resistances
                const rRoll = Math.random();
                if (rRoll < 0.14) newStats.fireRes = (newStats.fireRes || 0) + 0.10;
                else if (rRoll < 0.28) newStats.iceRes = (newStats.iceRes || 0) + 0.10;
                else if (rRoll < 0.42) newStats.electricRes = (newStats.electricRes || 0) + 0.10;
                else if (rRoll < 0.56) newStats.earthRes = (newStats.earthRes || 0) + 0.10;
                else if (rRoll < 0.70) newStats.waterRes = (newStats.waterRes || 0) + 0.10;
                else if (rRoll < 0.85) newStats.lightRes = (newStats.lightRes || 0) + 0.10;
                else newStats.darkRes = (newStats.darkRes || 0) + 0.10;
            }
            else newStats.armor = (newStats.armor || 0) + 1;
        }
    }
    return newStats;
};

export const generateRandomEquipment = (levelNum: number, lootConfig: LootConfig): Entity => {
  const typeRoll = Math.random();
  const rarity = getRarity(levelNum, lootConfig);
  const material = getMaterial(levelNum, lootConfig.adventurerLevel);
  const matStats = MATERIAL_STATS[material];
  
  const rarityInfo = RARITY_CONFIG[rarity];
  const matName = material.charAt(0) + material.slice(1).toLowerCase();
  
  let name = '';
  let slot = EquipmentSlot.MAIN_HAND;
  let stats: EquipmentStats = { slot: EquipmentSlot.MAIN_HAND };
  let symbol = '(';

  // 15% Chance for Wands (Magic)
  if (typeRoll < 0.15) {
      slot = EquipmentSlot.MAIN_HAND;
      symbol = '!';
      const elements = [Element.FIRE, Element.ICE, Element.ELECTRIC, Element.EARTH, Element.WATER, Element.LIGHT, Element.DARK];
      const el = elements[Math.floor(Math.random() * elements.length)];
      
      name = `${rarityInfo.prefix}${el.charAt(0) + el.slice(1).toLowerCase()} Wand`;
      stats = {
          slot,
          damage: Math.ceil((matStats.baseDmg * 0.8) * rarityInfo.multiplier), 
          element: el
      };
  }
  else if (typeRoll < 0.35) {
      slot = EquipmentSlot.MAIN_HAND;
      symbol = '/';
      name = `${rarityInfo.prefix}${matName} Sword`;
      stats = { slot, damage: Math.ceil(matStats.baseDmg * rarityInfo.multiplier) };
  } else if (typeRoll < 0.50) {
      slot = EquipmentSlot.BODY;
      symbol = '[';
      name = `${rarityInfo.prefix}${matName} Armor`;
      stats = { slot, armor: Math.ceil(matStats.baseArm * rarityInfo.multiplier) };
  } else if (typeRoll < 0.60) {
      slot = EquipmentSlot.HEAD;
      symbol = '^';
      name = `${rarityInfo.prefix}${matName} Helm`;
      stats = { slot, armor: Math.ceil((matStats.baseArm * 0.5) * rarityInfo.multiplier) };
  } else if (typeRoll < 0.70) {
      slot = EquipmentSlot.HANDS;
      symbol = ',';
      name = `${rarityInfo.prefix}${matName} Gauntlets`;
      stats = { slot, armor: Math.ceil((matStats.baseArm * 0.4) * rarityInfo.multiplier) };
  } else if (typeRoll < 0.80) {
      slot = EquipmentSlot.FEET;
      symbol = 'L';
      name = `${rarityInfo.prefix}${matName} Boots`;
      stats = { slot, armor: Math.ceil((matStats.baseArm * 0.4) * rarityInfo.multiplier) };
  } else if (typeRoll < 0.90) {
      slot = EquipmentSlot.ACCESSORY;
      symbol = '=';
      name = `${rarityInfo.prefix}Ring`;
      const isDmg = Math.random() > 0.5;
      stats = { 
          slot, 
          damage: isDmg ? Math.ceil(1 * rarityInfo.multiplier) : 0,
          armor: !isDmg ? Math.ceil(1 * rarityInfo.multiplier) : 0
      };
  } else {
      slot = EquipmentSlot.NECK;
      symbol = '"';
      name = `${rarityInfo.prefix}Amulet`;
      stats = { slot, damage: Math.ceil(1 * rarityInfo.multiplier) };
  }

  stats = applyAffixes(stats, rarity);

  return {
    id: uuidv4(),
    type: EntityType.EQUIPMENT,
    name,
    symbol,
    color: rarityInfo.color,
    position: { x: 0, y: 0 },
    equipmentStats: stats,
    rarity,
    material: typeRoll < 0.15 || typeRoll >= 0.8 ? undefined : material 
  };
};

export const generateRandomScroll = (levelNum: number): Entity => {
    const descriptors = ['Dusty', 'Ancient', 'Runed', 'Vibrating', 'Burnt', 'Singed', 'Golden', 'Dark', 'Bloody', 'Glowing', 'Electric', 'Static', 'Forbidden', 'Divine'];
    const name = `${descriptors[Math.floor(Math.random() * descriptors.length)]} Scroll`;
    
    // Weighted Effects
    const roll = Math.random();
    let effect = ScrollEffect.HEAL; // Default
    let magnitude = 10;
    
    // Level scaling for Scrolls
    const scaling = Math.ceil(levelNum * 2);

    if (roll < 0.25) { 
        effect = ScrollEffect.HEAL;
        magnitude = 20 + scaling * 2;
    }
    else if (roll < 0.45) { 
        effect = ScrollEffect.HEAL_STAMINA;
        magnitude = 40 + scaling * 3;
    }
    else if (roll < 0.55) {
        effect = ScrollEffect.DAMAGE; // Cursed!
        magnitude = 10 + scaling;
    }
    else if (roll < 0.65) {
        effect = ScrollEffect.DRAIN_XP; // Cursed!
        magnitude = 30 + scaling;
    }
    else if (roll < 0.75) {
        effect = ScrollEffect.LIGHTNING_SELF; // New Negative
        magnitude = 15 + scaling;
    }
    else if (roll < 0.85) {
        effect = ScrollEffect.LIGHTNING_AOE; // New Positive
        magnitude = 15 + scaling * 2;
    }
    else if (roll < 0.90) {
        // Rare: Level Up
        effect = ScrollEffect.LEVEL_UP;
        magnitude = 1; // 1 Level
    }
    else {
        effect = ScrollEffect.TELEPORT; // Neutral
        magnitude = 0;
    }

    return {
        id: uuidv4(),
        type: EntityType.SCROLL,
        name,
        symbol: '?',
        color: '#e2e8f0', // White/Paper color
        position: { x: 0, y: 0 },
        rarity: effect === ScrollEffect.LEVEL_UP ? Rarity.EPIC : Rarity.UNCOMMON,
        scrollEffect: effect,
        magnitude, // Store calculated magnitude
        flavor: "The runes shift when you look at them. Effect unknown until read."
    };
};

// New specific generator for the Alchemy perk
export const generateRandomPotion = (levelNum: number, lootConfig: LootConfig): Entity => {
    const rarity = getRarity(levelNum, lootConfig);
    const multiplier = RARITY_CONFIG[rarity].multiplier;
    const potionRoll = Math.random();

    if (potionRoll < 0.4) {
        // Healing Potion
        const hp = Math.ceil((20 + (levelNum * 2)) * multiplier); // Scales with level now
        return {
            id: uuidv4(),
            type: EntityType.POTION,
            name: `${RARITY_CONFIG[rarity].prefix}Health Potion`,
            symbol: '!',
            color: '#ef4444',
            position: { x: 0, y: 0 },
            value: hp,
            rarity,
            flavor: `Restores ${hp} HP.`
        };
    } else {
         // Effect Potions
         const descriptors = ['Bubbling', 'Viscous', 'Fuming', 'Glowing', 'Murky', 'Clear', 'Syrupy', 'Chilly', 'Volatile', 'Oily', 'Sparking', 'Magnetic'];
         const name = `${descriptors[Math.floor(Math.random() * descriptors.length)]} Potion`;
         
         const effects = [
             PotionEffect.STRENGTH, PotionEffect.STONESKIN, PotionEffect.HASTE, PotionEffect.REGEN,
             PotionEffect.WEAKNESS, PotionEffect.FRAILTY, PotionEffect.SLOWNESS, PotionEffect.POISON,
             PotionEffect.LIGHTNING_DMG_UP, PotionEffect.LIGHTNING_RES_DOWN,
             // New Elements
             PotionEffect.FIRE_DMG_UP, PotionEffect.ICE_DMG_UP, PotionEffect.EARTH_DMG_UP,
             PotionEffect.WATER_DMG_UP, PotionEffect.LIGHT_DMG_UP, PotionEffect.DARK_DMG_UP
         ];
         const effect = effects[Math.floor(Math.random() * effects.length)];
         
         // Set duration based on type. Stats = Floor based (small number), DOT/HOT = Turn based (large number)
         const isTurnBased = effect === PotionEffect.REGEN || effect === PotionEffect.POISON;
         
         let duration = 0;
         if (isTurnBased) {
             duration = 30; // 30 Turns default
             if (Math.random() < 0.15) duration = 60; // Long lasting poison/regen
         } else {
             duration = 1; // 1 Floor default
             if (Math.random() < 0.10) duration = 2; // Rare 2 floors
         }
         
         // Scaling Magnitude based on Dungeon Level
         let magnitude = 1;
         
         switch(effect) {
             case PotionEffect.STRENGTH: magnitude = Math.floor(2 + (levelNum * 0.3)); break;
             case PotionEffect.STONESKIN: magnitude = Math.floor(2 + (levelNum * 0.3)); break;
             case PotionEffect.HASTE: magnitude = Math.floor(5 + (levelNum * 0.5)); break; // %
             case PotionEffect.REGEN: magnitude = Math.floor(1 + (levelNum * 0.1)); break;
             case PotionEffect.LIGHTNING_DMG_UP: 
             case PotionEffect.FIRE_DMG_UP:
             case PotionEffect.ICE_DMG_UP:
             case PotionEffect.EARTH_DMG_UP:
             case PotionEffect.WATER_DMG_UP:
             case PotionEffect.LIGHT_DMG_UP:
             case PotionEffect.DARK_DMG_UP:
                 magnitude = Math.floor(2 + (levelNum * 0.4)); break;
             
             // Negative
             case PotionEffect.WEAKNESS: magnitude = Math.floor(1 + (levelNum * 0.2)); break;
             case PotionEffect.FRAILTY: magnitude = Math.floor(1 + (levelNum * 0.2)); break;
             case PotionEffect.SLOWNESS: magnitude = Math.floor(5 + (levelNum * 0.5)); break;
             case PotionEffect.POISON: magnitude = Math.floor(1 + (levelNum * 0.1)); break;
             case PotionEffect.LIGHTNING_RES_DOWN: magnitude = Math.floor(10 + (levelNum)); break; // %
         }

         // Apply rarity multiplier to magnitude
         magnitude = Math.ceil(magnitude * multiplier);

         return {
             id: uuidv4(),
             type: EntityType.POTION,
             name,
             symbol: '!',
             color: '#14b8a6', // Teal
             position: { x: 0, y: 0 },
             rarity,
             potionEffect: effect,
             effectDuration: duration,
             magnitude, // Store for App usage
             flavor: "The liquid swirls unnaturally. Effect unknown."
         };
    }
};

export const generateRandomConsumable = (levelNum: number, lootConfig: LootConfig): Entity => {
    const roll = Math.random();
    const rarity = getRarity(levelNum, lootConfig);
    const multiplier = RARITY_CONFIG[rarity].multiplier;

    // 15% Chance for SCROLL
    if (roll < 0.15) {
        return generateRandomScroll(levelNum);
    }

    // 10% Chance for Recall Orb
    if (roll < 0.25) {
        return {
            id: uuidv4(),
            type: EntityType.RECALL_ORB,
            name: 'Recall Orb',
            symbol: '@',
            color: '#22d3ee',
            position: { x: 0, y: 0 },
            rarity: Rarity.COMMON, 
            flavor: "Shatter to return to Sanctuary."
        };
    }

    // Elixir of Life
    if (roll < 0.26) { 
         return {
            id: uuidv4(),
            type: EntityType.FOOD,
            name: 'Elixir of Life',
            symbol: '!',
            color: '#a855f7',
            position: { x: 0, y: 0 },
            rarity: Rarity.EPIC,
            value: 999,
            flavor: "Fully restores HP and Stamina."
        };
    }

    // Potions (Health, Stamina, Mystery)
    if (roll < 0.60) {
        return generateRandomPotion(levelNum, lootConfig);
    } 
    
    // Food
    else {
        const stam = Math.ceil(25 * multiplier);
        const foods = ['Apple', 'Bread', 'Steak', 'Cheese', 'Pie', 'Dried Meat', 'Stew', 'Grapes'];
        const name = foods[Math.floor(Math.random() * foods.length)];
        return {
            id: uuidv4(),
            type: EntityType.FOOD,
            name: `${RARITY_CONFIG[rarity].prefix}${name}`,
            symbol: '%',
            color: '#f97316',
            position: { x: 0, y: 0 },
            value: stam,
            rarity,
            flavor: `Restores ${stam} Stamina.`
        };
    }
};

// --- NEW ENEMY GENERATION SYSTEM ---

interface EnemyRace {
    id: string;
    name: string;
    symbol: string;
    color: string;
    baseHp: number;
    baseDmg: number;
    minLevel: number;
    baseElement?: Element;
}

interface EnemyClass {
    id: string;
    name: string;
    hpMult: number;
    dmgMult: number;
    armMult: number; // Flat additive
    elementChance: number; // Chance to inherit class element (like Mage)
}

const ENEMY_RACES: EnemyRace[] = [
    { id: 'goblin', name: 'Goblin', symbol: 'g', color: '#4ade80', baseHp: 15, baseDmg: 3, minLevel: 1 },
    { id: 'slime', name: 'Slime', symbol: 'o', color: '#22d3ee', baseHp: 20, baseDmg: 2, minLevel: 1, baseElement: Element.WATER },
    { id: 'skeleton', name: 'Skeleton', symbol: 's', color: '#e2e8f0', baseHp: 25, baseDmg: 5, minLevel: 2 },
    { id: 'orc', name: 'Orc', symbol: 'O', color: '#166534', baseHp: 45, baseDmg: 7, minLevel: 3 },
    { id: 'demon', name: 'Demon', symbol: 'D', color: '#dc2626', baseHp: 60, baseDmg: 9, minLevel: 5, baseElement: Element.FIRE },
    { id: 'dragon', name: 'Dragon', symbol: '🐉', color: '#f59e0b', baseHp: 120, baseDmg: 15, minLevel: 8, baseElement: Element.FIRE }
];

const ENEMY_CLASSES: EnemyClass[] = [
    { id: 'warrior', name: 'Warrior', hpMult: 1.3, dmgMult: 1.0, armMult: 2, elementChance: 0 },
    { id: 'archer', name: 'Archer', hpMult: 0.8, dmgMult: 1.3, armMult: 0, elementChance: 0 },
    { id: 'thief', name: 'Thief', hpMult: 0.9, dmgMult: 1.1, armMult: 1, elementChance: 0 }, // Slightly higher evasion implied by base system randoms
    { id: 'mage', name: 'Mage', hpMult: 0.7, dmgMult: 1.5, armMult: 0, elementChance: 1.0 },
    // New Classes
    { id: 'berserker', name: 'Berserker', hpMult: 1.5, dmgMult: 1.4, armMult: -2, elementChance: 0 }, // High Dmg/HP, Negative Armor
    { id: 'paladin', name: 'Paladin', hpMult: 1.2, dmgMult: 0.8, armMult: 5, elementChance: 0.2 }, // High Armor/Defense
    { id: 'sapper', name: 'Sapper', hpMult: 0.5, dmgMult: 0.5, armMult: 0, elementChance: 0 } // Kamikaze unit
];

const generateRandomEnemy = (level: number, x: number, y: number): Entity => {
    // 1. Filter Races by Level
    const availableRaces = ENEMY_RACES.filter(r => r.minLevel <= level + 1); // Allow slightly higher level spawning rarely? No, stick to limits.
    // If empty (shouldn't happen with Goblin lvl 1), fallback
    const race = availableRaces.length > 0 
        ? availableRaces[Math.floor(Math.random() * availableRaces.length)] 
        : ENEMY_RACES[0];

    // 2. Pick Class (Weighted)
    // Warrior > Archer > Mage/Berserker/Paladin > Thief/Sapper
    const roll = Math.random();
    let clsId = 'warrior';
    
    if (roll < 0.30) clsId = 'warrior';         // 30%
    else if (roll < 0.50) clsId = 'archer';     // 20%
    else if (roll < 0.65) clsId = 'mage';       // 15%
    else if (roll < 0.80) clsId = 'berserker';  // 15%
    else if (roll < 0.90) clsId = 'paladin';    // 10%
    else if (roll < 0.95) clsId = 'thief';      // 5%
    else clsId = 'sapper';                      // 5%

    const cls = ENEMY_CLASSES.find(c => c.id === clsId) || ENEMY_CLASSES[0];

    // 3. Stats Calculation
    const difficultyScale = 1 + (level * 0.2);
    
    const finalHp = Math.floor(race.baseHp * cls.hpMult * difficultyScale);
    const finalDmg = Math.floor(race.baseDmg * cls.dmgMult * difficultyScale);
    const finalArm = Math.floor((level * 0.5) + cls.armMult);
    
    // 4. Element Logic
    let element = race.baseElement;
    
    // Mages pick a random element if race doesn't force one (or even if they do, maybe mage overrides?)
    // Let's say Mage adds element if none exists, or overrides if it's generic
    if (cls.id === 'mage') {
        const elements = [Element.FIRE, Element.ICE, Element.ELECTRIC, Element.EARTH, Element.WATER, Element.LIGHT, Element.DARK];
        element = elements[Math.floor(Math.random() * elements.length)];
    }

    // 5. Name Construction
    const fullName = `${race.name} ${cls.name}`;

    return {
        id: uuidv4(),
        type: EntityType.ENEMY,
        name: fullName,
        symbol: race.symbol,
        color: race.color,
        position: { x, y },
        hp: finalHp,
        maxHp: finalHp,
        classId: cls.id,
        aiState: { thiefHasAttacked: false },
        combatStats: {
            damage: finalDmg,
            armor: finalArm,
            xpReward: Math.floor(10 * difficultyScale * (cls.id === 'mage' || cls.id === 'berserker' ? 1.3 : 1)),
            attackElement: element
        }
    };
};

export const generateHub = (): DungeonLevel => {
    const width = 15;
    const height = 15;
    const tiles: EntityType[][] = Array(height).fill(null).map(() => Array(width).fill(EntityType.FLOOR));
    const entities: Entity[] = [];
    const explored: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(true));

    for(let y=0; y<height; y++) {
        for(let x=0; x<width; x++) {
            if (x===0 || x===width-1 || y===0 || y===height-1) tiles[y][x] = EntityType.WALL;
        }
    }

    entities.push({
        id: uuidv4(),
        type: EntityType.PORTAL,
        name: 'Dungeon Portal',
        symbol: 'O',
        color: '#22d3ee',
        position: { x: Math.floor(width/2), y: 3 },
        flavor: "Enter the dungeon..."
    });

    entities.push({
        id: uuidv4(),
        type: EntityType.STORAGE,
        name: 'Storage Chest',
        symbol: 'C',
        color: '#f59e0b',
        position: { x: Math.floor(width/2) - 2, y: Math.floor(height/2) },
        flavor: "Store your goods here."
    });

    entities.push({
        id: uuidv4(),
        type: EntityType.BANKER,
        name: 'Royal Banker',
        symbol: '$',
        color: '#facc15', // Gold
        position: { x: Math.floor(width/2) + 2, y: Math.floor(height/2) },
        flavor: "Keep your gold safe and earn interest."
    });

    return {
        levelNumber: 0,
        width,
        height,
        tiles,
        entities,
        explored,
        isHub: true,
        playerStart: { x: Math.floor(width/2), y: Math.floor(height/2) }
    };
};

// --- ROBUST GROWTH ALGORITHM ---

export const generateDungeon = (levelNum: number, lootConfig: LootConfig): DungeonLevel => {
  const width = DUNGEON_SIZE;
  const height = DUNGEON_SIZE;
  
  // 1. Initialize with WALLS
  const tiles: EntityType[][] = Array(height).fill(null).map(() => Array(width).fill(EntityType.WALL));
  const rooms: Room[] = [];
  const entities: Entity[] = [];
  
  // Helper to carve a rectangle
  const carve = (x: number, y: number, w: number, h: number) => {
      for (let cy = y; cy < y + h; cy++) {
          for (let cx = x; cx < x + w; cx++) {
              tiles[cy][cx] = EntityType.FLOOR;
          }
      }
  };

  // Helper to check if an area is fully WALL
  // We add a buffer of 1 around checks to prevent rooms from touching without a corridor
  const isAreaFree = (x: number, y: number, w: number, h: number): boolean => {
      // Check bounds (leaving 1 tile border)
      if (x < 1 || y < 1 || x + w >= width - 1 || y + h >= height - 1) return false;
      
      // Check tile content (area + 1 tile buffer must be WALL)
      for (let cy = y - 1; cy <= y + h; cy++) {
          for (let cx = x - 1; cx <= x + w; cx++) {
              if (tiles[cy][cx] !== EntityType.WALL) return false;
          }
      }
      return true;
  };

  // 2. Place Initial Room at Center
  const startW = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
  const startH = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
  const startX = Math.floor(width / 2) - Math.floor(startW / 2);
  const startY = Math.floor(height / 2) - Math.floor(startH / 2);

  carve(startX, startY, startW, startH);
  rooms.push({ x: startX, y: startY, w: startW, h: startH, center: { x: startX + Math.floor(startW/2), y: startY + Math.floor(startH/2) } });

  // 3. Growth Loop
  let failures = 0;
  while (rooms.length < MAX_ROOMS && failures < 200) {
      // Pick a random existing room to grow from
      const sourceRoom = rooms[Math.floor(Math.random() * rooms.length)];
      
      // Pick a direction (0: N, 1: S, 2: W, 3: E)
      const dir = Math.floor(Math.random() * 4);
      
      // Dimensions for new room
      const newW = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
      const newH = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
      
      // Corridor length
      const corridorLen = Math.floor(Math.random() * 4) + 3; // 3 to 6

      let roomX = 0, roomY = 0;
      let corrX = 0, corrY = 0, corrW = 0, corrH = 0;
      
      // Variables to check validity of corridor (excluding connection point)
      let checkCorrX = 0, checkCorrY = 0, checkCorrW = 0, checkCorrH = 0;

      if (dir === 0) { // North
          // Connection connects to sourceRoom.y (Top Edge)
          const connectionX = sourceRoom.x + Math.floor(Math.random() * (sourceRoom.w - 2)) + 1;
          
          corrX = connectionX;
          corrY = sourceRoom.y - corridorLen;
          corrW = 1;
          corrH = corridorLen;
          
          // Room is above corridor
          roomX = connectionX - Math.floor(newW / 2);
          roomY = corrY - newH;

          // Check Corridor: Exclude the bottom tile (which touches source room) from "isAreaFree" check
          checkCorrX = corrX;
          checkCorrY = corrY;
          checkCorrW = corrW;
          checkCorrH = corrH - 1;

      } else if (dir === 1) { // South
          // Connection connects to sourceRoom.y + h (Bottom Edge)
          const connectionX = sourceRoom.x + Math.floor(Math.random() * (sourceRoom.w - 2)) + 1;
          
          corrX = connectionX;
          corrY = sourceRoom.y + sourceRoom.h;
          corrW = 1;
          corrH = corridorLen;
          
          // Room is below corridor
          roomX = connectionX - Math.floor(newW / 2);
          roomY = corrY + corrH;

          // Check Corridor: Exclude the top tile (which touches source room)
          checkCorrX = corrX;
          checkCorrY = corrY + 1;
          checkCorrW = corrW;
          checkCorrH = corrH - 1;

      } else if (dir === 2) { // West
          // Connection connects to sourceRoom.x (Left Edge)
          const connectionY = sourceRoom.y + Math.floor(Math.random() * (sourceRoom.h - 2)) + 1;
          
          corrX = sourceRoom.x - corridorLen;
          corrY = connectionY;
          corrW = corridorLen;
          corrH = 1;
          
          // Room is left of corridor
          roomX = corrX - newW;
          roomY = connectionY - Math.floor(newH / 2);

          // Check Corridor: Exclude rightmost tile
          checkCorrX = corrX;
          checkCorrY = corrY;
          checkCorrW = corrW - 1;
          checkCorrH = corrH;

      } else { // East
          // Connection connects to sourceRoom.x + w (Right Edge)
          const connectionY = sourceRoom.y + Math.floor(Math.random() * (sourceRoom.h - 2)) + 1;
          
          corrX = sourceRoom.x + sourceRoom.w;
          corrY = connectionY;
          corrW = corridorLen;
          corrH = 1;
          
          // Room is right of corridor
          roomX = corrX + newW;
          roomY = connectionY - Math.floor(newH / 2);

          // Check Corridor: Exclude leftmost tile
          checkCorrX = corrX + 1;
          checkCorrY = corrY;
          checkCorrW = corrW - 1;
          checkCorrH = corrH;
      }

      // 4. Validate Space
      // We check if the NEW Room area is free.
      // We check if the Corridor area is free (using modified bounds to ignore connection to source).
      
      const isRoomValid = isAreaFree(roomX, roomY, newW, newH);
      const isCorridorValid = isAreaFree(checkCorrX, checkCorrY, checkCorrW, checkCorrH);

      if (isRoomValid && isCorridorValid) {
          // Success! Carve everything (using full dimensions).
          carve(roomX, roomY, newW, newH);
          carve(corrX, corrY, corrW, corrH);
          
          rooms.push({ 
              x: roomX, y: roomY, w: newW, h: newH, 
              center: { x: roomX + Math.floor(newW/2), y: roomY + Math.floor(newH/2) } 
          });
      } else {
          failures++;
      }
  }

  // 5. Populate Entities in Rooms
  rooms.forEach((room, index) => {
      // Index 0 is Start Room
      if (index === 0) return; 

      const getRandomRoomPos = (): Position => ({
          x: room.x + Math.floor(Math.random() * room.w),
          y: room.y + Math.floor(Math.random() * room.h)
      });
      
      const isOccupied = (x: number, y: number) => {
          return entities.some(e => e.position.x === x && e.position.y === y);
      };

      const getFreeRoomPos = (): Position | null => {
         for(let i=0; i<15; i++) { // Try multiple times to find an empty spot
             const pos = getRandomRoomPos();
             if (tiles[pos.y][pos.x] === EntityType.FLOOR && !isOccupied(pos.x, pos.y)) {
                 return pos;
             }
         }
         return null;
      };

      // Enemies
      if (Math.random() < 0.6) {
          const pos = getFreeRoomPos();
          if (pos) {
             entities.push(generateRandomEnemy(levelNum, pos.x, pos.y));
          }
      }
      
      // Traps
      if (Math.random() < 0.2) {
          const pos = getFreeRoomPos();
          if (pos) {
              const isTeleport = Math.random() < 0.3;
              entities.push({
                  id: uuidv4(),
                  type: EntityType.TRAP,
                  name: isTeleport ? 'Teleport Trap' : 'Spike Trap',
                  symbol: '^',
                  color: isTeleport ? '#a855f7' : '#ef4444',
                  position: pos,
                  isHidden: true,
                  trapEffect: isTeleport ? 'teleport' : 'damage'
              });
          }
      }

      // Loot - Increased Chance (0.6 -> 0.75)
      if (Math.random() < 0.75) { 
          const pos = getFreeRoomPos();
          if (pos) {
               if (Math.random() < 0.25) { 
                   // Chest
                   const contents: Entity[] = [];
                   const numItems = 1 + Math.floor(Math.random() * 3);
                   for(let i=0; i<numItems; i++) {
                       // 40% Equip, 60% Consumable (inc. Scrolls)
                       if (Math.random() < 0.4) contents.push(generateRandomEquipment(levelNum, lootConfig));
                       else contents.push(generateRandomConsumable(levelNum, lootConfig));
                   }
                   contents.push({
                       id: uuidv4(),
                       type: EntityType.GOLD,
                       name: 'Gold Coins',
                       symbol: '$',
                       color: '#facc15',
                       position: {x:0, y:0},
                       value: 10 + Math.floor(Math.random() * 50 * levelNum)
                   });

                   entities.push({
                       id: uuidv4(),
                       type: EntityType.CHEST,
                       name: 'Treasure Chest',
                       symbol: 'T',
                       color: '#f59e0b',
                       position: pos,
                       chestContents: contents,
                       isOpen: false,
                       isTrapped: Math.random() < 0.3
                   });
               } else {
                   // Loose Item
                   const roll = Math.random();
                   let item: Entity;
                   
                   // 35% Equip, 65% Consumable (inc. Scrolls)
                   if (roll < 0.35) item = generateRandomEquipment(levelNum, lootConfig);
                   else item = generateRandomConsumable(levelNum, lootConfig);

                   item.position = pos;
                   entities.push(item);
               }
          }
      }
  });

  // Guarantee Stairs in the Last Room (or start room if it's the only one)
  // We place this outside the loop to ensure it always runs.
  const lastRoom = rooms[rooms.length - 1];
  entities.push({
      id: uuidv4(),
      type: EntityType.STAIRS,
      name: 'Stairs Down',
      symbol: '>',
      color: '#e2e8f0',
      position: lastRoom.center
  });

  return {
    levelNumber: levelNum,
    width,
    height,
    tiles,
    entities,
    explored: Array(height).fill(null).map(() => Array(width).fill(false)),
    playerStart: rooms[0].center
  };
};