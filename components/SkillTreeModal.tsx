

import React, { useState } from 'react';
import { Skill, Perk, SkillType } from '../types';

// Extended Perk interface for manual positioning
export interface VisualPerk extends Perk {
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
}

// --- ORGANIC PERK TREES ---
// Total points target: ~50 per tree.

export const PERK_TREE: Record<string, VisualPerk[]> = {
  // Shape: Central Hub (Star) -> Modified for new request
  global: [
    { id: 'adventurer_training', name: 'Novice', cost: 1, maxRanks: 20, description: '+1 Max HP/Stamina per rank. The basics.', x: 50, y: 90 },
    
    // Center Branch: XP & Skill Points
    { id: 'fast_learner', name: 'Fast Learner', cost: 1, maxRanks: 5, description: '+10% XP Gain.', prerequisites: ['adventurer_training'], x: 50, y: 60 },
    { id: 'genius', name: 'Genius', cost: 1, maxRanks: 10, description: '1% Chance/Rank for extra Point on Level Up.', prerequisites: ['fast_learner'], x: 50, y: 30 },

    // Left Branch: Mapping & Automation
    { id: 'cartographer', name: 'Cartographer', cost: 1, maxRanks: 1, description: 'Enables Mini Map HUD.', prerequisites: ['adventurer_training'], x: 20, y: 70 },
    { id: 'tracker', name: 'Tracker', cost: 1, maxRanks: 1, description: 'Map shows Loot, Enemies & Stairs.', prerequisites: ['cartographer'], x: 20, y: 40 },
    { id: 'auto_explorer', name: 'Auto Explorer', cost: 1, maxRanks: 1, description: 'Enables Auto-Explore (X).', prerequisites: ['tracker'], x: 20, y: 15 },

    // Right Branch: Economy & Survival
    { id: 'wealthy', name: 'Deep Pockets', cost: 1, maxRanks: 10, description: 'Increases Gold drops.', prerequisites: ['adventurer_training'], x: 80, y: 70 },
    { id: 'manager', name: 'Manager', cost: 1, maxRanks: 1, description: 'Auto-spend points.', prerequisites: ['wealthy'], x: 80, y: 40 },

    // New Perk: Auto Eat
    { id: 'auto_eat', name: 'Survival Instinct', cost: 1, maxRanks: 1, description: 'Auto-eat food when Stamina hits 0.', prerequisites: ['adventurer_training'], x: 65, y: 75 },
  ],
  // Shape: Zig-Zag (Running path)
  athletics: [
    { id: 'conditioning', name: 'Conditioning', cost: 1, maxRanks: 20, description: '+2 Max Stamina per rank.', x: 50, y: 90 },
    { id: 'dash', name: 'Dash', cost: 1, maxRanks: 10, description: 'Chance to not consume Stamina on move.', prerequisites: ['conditioning'], x: 80, y: 70 },
    { id: 'evasion', name: 'Reflexes', cost: 1, maxRanks: 10, description: '+1% Dodge Chance per rank.', prerequisites: ['dash'], x: 20, y: 50 },
    { id: 'momentum', name: 'Momentum', cost: 1, maxRanks: 5, description: 'Gain XP when moving.', prerequisites: ['evasion'], x: 80, y: 30 },
    { id: 'fleet_footed', name: 'Fleet Footed', cost: 1, maxRanks: 5, description: 'Chance to not consume turn.', prerequisites: ['momentum'], x: 50, y: 10 },
  ],
  // Shape: Sword (Cross)
  combat: [
    { id: 'grip', name: 'Grip', cost: 1, maxRanks: 15, description: '+1 Damage per rank.', x: 50, y: 90 },
    { id: 'guard', name: 'Guard', cost: 1, maxRanks: 10, description: '+1 Armor per rank.', prerequisites: ['grip'], x: 20, y: 70 },
    { id: 'pommel', name: 'Pommel', cost: 1, maxRanks: 10, description: 'Stun chance on hit.', prerequisites: ['grip'], x: 80, y: 70 },
    { id: 'heavy_hitter', name: 'Heavy Hitter', cost: 1, maxRanks: 10, description: 'Significantly increases base damage.', prerequisites: ['grip'], x: 50, y: 50 },
    { id: 'execute', name: 'Decapitate', cost: 1, maxRanks: 5, description: 'Instant kill low HP enemies.', prerequisites: ['heavy_hitter'], x: 50, y: 10 },
  ],
  // Shape: Fist
  fist: [
    { id: 'knuckles', name: 'Knuckles', cost: 1, maxRanks: 20, description: '+1 Unarmed Damage per rank.', x: 50, y: 85 },
    { id: 'iron_fist', name: 'Iron Skin', cost: 1, maxRanks: 10, description: '+1 Armor while unarmed.', prerequisites: ['knuckles'], x: 30, y: 60 },
    { id: 'brawler', name: 'Brawler', cost: 1, maxRanks: 10, description: '+2% Crit Chance (Unarmed).', prerequisites: ['knuckles'], x: 70, y: 60 },
    { id: 'flurry', name: 'Flurry', cost: 1, maxRanks: 5, description: 'Chance to hit twice.', prerequisites: ['iron_fist', 'brawler'], x: 50, y: 40 },
    { id: 'chi_strike', name: 'Chi Strike', cost: 1, maxRanks: 5, description: 'Attacks bypass Armor.', prerequisites: ['flurry'], x: 50, y: 15 },
  ],
  // Shape: Wide Arc (Eye field of view)
  perception: [
    { id: 'keen_eye', name: 'Keen Eye', cost: 1, maxRanks: 20, description: '+0.2 Vision Radius per rank.', x: 50, y: 90 },
    { id: 'trap_sense', name: 'Trap Sense', cost: 1, maxRanks: 10, description: 'Spot and avoid traps.', prerequisites: ['keen_eye'], x: 30, y: 70 },
    { id: 'scavenger', name: 'Scavenger', cost: 1, maxRanks: 10, description: 'Better loot chance.', prerequisites: ['keen_eye'], x: 70, y: 70 },
    { id: 'night_eyes', name: 'Night Vision', cost: 1, maxRanks: 5, description: 'See clearly in dark themes.', prerequisites: ['trap_sense'], x: 10, y: 40 },
    { id: 'quick_loot', name: 'Vacuum', cost: 1, maxRanks: 5, description: 'Auto-pickup nearby items.', prerequisites: ['scavenger'], x: 90, y: 40 },
  ],
  // Shape: Heart / Cross
  recovery: [
    { id: 'vitality', name: 'Vitality', cost: 1, maxRanks: 20, description: '+2 Max HP per rank.', x: 50, y: 80 },
    { id: 'regeneration', name: 'Regen', cost: 1, maxRanks: 10, description: 'Passive HP regeneration.', prerequisites: ['vitality'], x: 30, y: 50 },
    { id: 'toughness', name: 'Toughness', cost: 1, maxRanks: 10, description: 'Reduces damage taken by 1.', prerequisites: ['vitality'], x: 70, y: 50 },
    { id: 'second_wind', name: 'Second Wind', cost: 1, maxRanks: 5, description: 'Survive lethal damage.', prerequisites: ['regeneration'], x: 50, y: 30 },
    { id: 'immortality', name: 'Immortal', cost: 1, maxRanks: 5, description: '+20 Max HP.', prerequisites: ['toughness'], x: 50, y: 10 },
  ],
  // Shape: Triangle
  arcana: [
    { id: 'mana_pool', name: 'Mana Pool', cost: 1, maxRanks: 20, description: '+1 Max Mana per rank.', x: 50, y: 90 },
    { id: 'meditation', name: 'Meditation', cost: 1, maxRanks: 15, description: 'Faster Mana Regen.', prerequisites: ['mana_pool'], x: 25, y: 50 },
    { id: 'mana_shield', name: 'Mana Shield', cost: 1, maxRanks: 15, description: 'Mana absorbs damage.', prerequisites: ['mana_pool'], x: 75, y: 50 },
    { id: 'wild_magic', name: 'Wild Magic', cost: 1, maxRanks: 5, description: 'Wand attacks explode.', prerequisites: ['meditation', 'mana_shield'], x: 50, y: 20 },
  ],
  // Shape: Branching Tree
  survival: [
    { id: 'forager', name: 'Forager', cost: 1, maxRanks: 20, description: '+2 Max Stamina per rank.', x: 50, y: 90 },
    { id: 'rationing', name: 'Rationing', cost: 1, maxRanks: 10, description: 'Chance to not consume food.', prerequisites: ['forager'], x: 30, y: 60 },
    { id: 'gluttony', name: 'Gluttony', cost: 1, maxRanks: 10, description: 'Food gives more stamina.', prerequisites: ['forager'], x: 70, y: 60 },
    { id: 'iron_stomach', name: 'Iron Stomach', cost: 1, maxRanks: 5, description: 'Eat anything (Heals HP).', prerequisites: ['gluttony'], x: 80, y: 30 },
    { id: 'survivalist', name: 'Survivalist', cost: 1, maxRanks: 5, description: 'Auto-eat when low stamina.', prerequisites: ['rationing'], x: 20, y: 30 },
  ],
  // Shape: Pot
  cooking: [
    { id: 'preparation', name: 'Prep', cost: 1, maxRanks: 20, description: 'Food value +5%.', x: 50, y: 90 },
    { id: 'seasoning', name: 'Seasoning', cost: 1, maxRanks: 10, description: 'Food buffs duration increased.', prerequisites: ['preparation'], x: 20, y: 70 },
    { id: 'harvest', name: 'Butcher', cost: 1, maxRanks: 10, description: 'Enemies drop food.', prerequisites: ['preparation'], x: 80, y: 70 },
    { id: 'gourmet', name: 'Gourmet', cost: 1, maxRanks: 5, description: 'Rare food gives XP.', prerequisites: ['seasoning'], x: 30, y: 40 },
    { id: 'feast', name: 'Feast', cost: 1, maxRanks: 5, description: 'Damage bonus when full.', prerequisites: ['harvest'], x: 70, y: 40 },
  ],
  // Shape: Scroll
  reader: [
    { id: 'literacy', name: 'Literacy', cost: 1, maxRanks: 20, description: '+5% XP from Scrolls.', x: 50, y: 85 },
    { id: 'scroll_hunter', name: 'Collector', cost: 1, maxRanks: 10, description: 'Find more scrolls.', prerequisites: ['literacy'], x: 50, y: 60 },
    { id: 'potency', name: 'Potency', cost: 1, maxRanks: 10, description: 'Scroll effects stronger.', prerequisites: ['scroll_hunter'], x: 20, y: 40 },
    { id: 'archivist', name: 'Archivist', cost: 1, maxRanks: 10, description: 'Keep scroll after use.', prerequisites: ['scroll_hunter'], x: 80, y: 40 },
  ],
  // Shape: Flask
  alchemy: [
    { id: 'chemistry', name: 'Chemistry', cost: 1, maxRanks: 20, description: '+5% XP from Potions.', x: 50, y: 90 },
    { id: 'brewer', name: 'Brewer', cost: 1, maxRanks: 10, description: 'Find more potions.', prerequisites: ['chemistry'], x: 50, y: 70 },
    { id: 'tolerance', name: 'Tolerance', cost: 1, maxRanks: 10, description: 'Resist negative effects.', prerequisites: ['brewer'], x: 30, y: 45 },
    { id: 'catalyst', name: 'Catalyst', cost: 1, maxRanks: 10, description: 'Extend positive effects.', prerequisites: ['brewer'], x: 70, y: 45 },
  ],
  // Shape: Axe
  weaponry: [
    { id: 'stance', name: 'Stance', cost: 1, maxRanks: 20, description: '+1 Damage.', x: 50, y: 90 },
    { id: 'technique', name: 'Technique', cost: 1, maxRanks: 10, description: '+XP Gain.', prerequisites: ['stance'], x: 50, y: 70 },
    { id: 'crit_master', name: 'Precision', cost: 1, maxRanks: 10, description: '+Crit Chance.', prerequisites: ['technique'], x: 20, y: 50 },
    { id: 'parry', name: 'Parry', cost: 1, maxRanks: 5, description: 'Block chance.', prerequisites: ['technique'], x: 80, y: 50 },
    { id: 'slayer', name: 'Slayer', cost: 1, maxRanks: 5, description: 'Boss Damage.', prerequisites: ['crit_master', 'parry'], x: 50, y: 30 },
  ],
  // Shape: Shield
  defense: [
    { id: 'thick_skin', name: 'Thick Skin', cost: 1, maxRanks: 20, description: '+1 Armor.', x: 50, y: 90 },
    { id: 'wards', name: 'Wards', cost: 1, maxRanks: 10, description: '+Resistances.', prerequisites: ['thick_skin'], x: 20, y: 60 },
    { id: 'thorns', name: 'Thorns', cost: 1, maxRanks: 10, description: 'Reflect damage.', prerequisites: ['thick_skin'], x: 80, y: 60 },
    { id: 'titan', name: 'Titan', cost: 1, maxRanks: 5, description: '+Max HP based on Armor.', prerequisites: ['wards'], x: 35, y: 30 },
    { id: 'bulwark', name: 'Bulwark', cost: 1, maxRanks: 5, description: 'Double armor when waiting.', prerequisites: ['thorns'], x: 65, y: 30 },
  ],
  // Shape: Ring
  jewelry: [
    { id: 'polish', name: 'Polish', cost: 1, maxRanks: 20, description: 'Ring stats +1.', x: 50, y: 80 },
    { id: 'appraiser', name: 'Appraiser', cost: 1, maxRanks: 10, description: 'Find better loot.', prerequisites: ['polish'], x: 20, y: 50 },
    { id: 'barrier', name: 'Barrier', cost: 1, maxRanks: 10, description: 'Rings give HP.', prerequisites: ['polish'], x: 80, y: 50 },
    { id: 'soul_bond', name: 'Soul Bond', cost: 1, maxRanks: 10, description: 'Prevent item loss.', prerequisites: ['appraiser', 'barrier'], x: 50, y: 20 },
  ],
  // Shape: Pendant
  amulet_mastery: [
    { id: 'attunement', name: 'Attunement', cost: 1, maxRanks: 20, description: 'Amulet stats +1.', x: 50, y: 90 },
    { id: 'mystic', name: 'Mystic', cost: 1, maxRanks: 10, description: 'Elemental Dmg +.', prerequisites: ['attunement'], x: 50, y: 70 },
    { id: 'channel', name: 'Channel', cost: 1, maxRanks: 10, description: 'Mana Regen.', prerequisites: ['mystic'], x: 30, y: 50 },
    { id: 'aegis', name: 'Aegis', cost: 1, maxRanks: 10, description: 'Stamina +.', prerequisites: ['mystic'], x: 70, y: 50 },
  ],
  // Shape: Clover
  luck: [
    { id: 'lucky', name: 'Lucky', cost: 1, maxRanks: 20, description: 'Find more Gold.', x: 50, y: 50 },
    { id: 'rare_finds', name: 'Treasure', cost: 1, maxRanks: 10, description: 'Rarity Chance +.', prerequisites: ['lucky'], x: 50, y: 20 },
    { id: 'dungeoneer', name: 'Dungeoneer', cost: 1, maxRanks: 10, description: 'Avoid Traps.', prerequisites: ['lucky'], x: 20, y: 70 },
    { id: 'serendipity', name: 'Fate', cost: 1, maxRanks: 5, description: 'Execute Chance.', prerequisites: ['lucky'], x: 80, y: 70 },
    { id: 'greed', name: 'Greed', cost: 1, maxRanks: 5, description: 'Double Gold Chance.', prerequisites: ['lucky'], x: 50, y: 80 },
  ],
  // Material Skills (Linear Progression for Simplicity)
  woodworking: [
    { id: 'whittle', name: 'Whittle', cost: 1, maxRanks: 20, description: 'Wood Dmg +.', x: 20, y: 80 },
    { id: 'carve', name: 'Carve', cost: 1, maxRanks: 15, description: 'Wood Armor +.', prerequisites: ['whittle'], x: 50, y: 50 },
    { id: 'nature', name: 'Nature', cost: 1, maxRanks: 15, description: 'Wood Regen HP.', prerequisites: ['carve'], x: 80, y: 20 },
  ],
  blacksmithing: [
    { id: 'tempering', name: 'Tempering', cost: 1, maxRanks: 20, description: 'Iron Dmg +.', x: 20, y: 80 },
    { id: 'reinforce', name: 'Reinforce', cost: 1, maxRanks: 15, description: 'Iron Armor +.', prerequisites: ['tempering'], x: 50, y: 50 },
    { id: 'masterwork', name: 'Master', cost: 1, maxRanks: 15, description: 'Iron Stats +20%.', prerequisites: ['reinforce'], x: 80, y: 20 },
  ],
  steelworks: [
    { id: 'harden', name: 'Harden', cost: 1, maxRanks: 20, description: 'Steel Dmg +.', x: 20, y: 80 },
    { id: 'plate', name: 'Plate', cost: 1, maxRanks: 15, description: 'Steel Armor +.', prerequisites: ['harden'], x: 50, y: 50 },
    { id: 'edge', name: 'Edge', cost: 1, maxRanks: 15, description: 'Steel Crit +.', prerequisites: ['plate'], x: 80, y: 20 },
  ],
  goldsmithing: [
    { id: 'polish', name: 'Polish', cost: 1, maxRanks: 20, description: 'Gold Dmg +.', x: 20, y: 80 },
    { id: 'gilded', name: 'Gilded', cost: 1, maxRanks: 15, description: 'Gold Armor +.', prerequisites: ['polish'], x: 50, y: 50 },
    { id: 'bling', name: 'Bling', cost: 1, maxRanks: 15, description: 'Gold Drop +.', prerequisites: ['gilded'], x: 80, y: 20 },
  ],
  mythril_mastery: [
    { id: 'lightweight', name: 'Feather', cost: 1, maxRanks: 20, description: 'Mythril Dmg +.', x: 20, y: 80 },
    { id: 'runed', name: 'Runed', cost: 1, maxRanks: 15, description: 'Mythril Armor +.', prerequisites: ['lightweight'], x: 50, y: 50 },
    { id: 'ancient', name: 'Ancient', cost: 1, maxRanks: 15, description: 'Mythril Mana +.', prerequisites: ['runed'], x: 80, y: 20 },
  ],
  vorpal_affinity: [
    { id: 'void_edge', name: 'Void', cost: 1, maxRanks: 20, description: 'Vorpal Dmg +.', x: 20, y: 80 },
    { id: 'null', name: 'Null', cost: 1, maxRanks: 15, description: 'Vorpal Armor +.', prerequisites: ['void_edge'], x: 50, y: 50 },
    { id: 'soul_eater', name: 'Eater', cost: 1, maxRanks: 15, description: 'Vorpal Lifesteal.', prerequisites: ['null'], x: 80, y: 20 },
  ],
  // Magic Skills (Constellations)
  fire_magic: [
    { id: 'ember', name: 'Ember', cost: 1, maxRanks: 20, description: 'Fire Dmg +.', x: 50, y: 90 },
    { id: 'burn', name: 'Burn', cost: 1, maxRanks: 10, description: 'Fire Res +.', prerequisites: ['ember'], x: 20, y: 60 },
    { id: 'inferno', name: 'Inferno', cost: 1, maxRanks: 10, description: 'Ignore Res.', prerequisites: ['ember'], x: 80, y: 60 },
    { id: 'combustion', name: 'Blast', cost: 1, maxRanks: 5, description: 'Explode.', prerequisites: ['burn', 'inferno'], x: 50, y: 30 },
    { id: 'phoenix', name: 'Phoenix', cost: 1, maxRanks: 5, description: 'Revive.', prerequisites: ['combustion'], x: 50, y: 10 },
  ],
  ice_magic: [
    { id: 'chill', name: 'Chill', cost: 1, maxRanks: 20, description: 'Ice Dmg +.', x: 50, y: 90 },
    { id: 'frost', name: 'Frost', cost: 1, maxRanks: 10, description: 'Ice Res +.', prerequisites: ['chill'], x: 20, y: 60 },
    { id: 'shatter', name: 'Shatter', cost: 1, maxRanks: 10, description: 'Dmg vs Full HP.', prerequisites: ['chill'], x: 80, y: 60 },
    { id: 'blizzard', name: 'Blizzard', cost: 1, maxRanks: 10, description: 'Slow enemies.', prerequisites: ['frost', 'shatter'], x: 50, y: 30 },
  ],
  electric_magic: [
    { id: 'shock', name: 'Shock', cost: 1, maxRanks: 20, description: 'Elec Dmg +.', x: 50, y: 90 },
    { id: 'ground', name: 'Ground', cost: 1, maxRanks: 10, description: 'Elec Res +.', prerequisites: ['shock'], x: 20, y: 60 },
    { id: 'overload', name: 'Overload', cost: 1, maxRanks: 10, description: 'Chain Lightning.', prerequisites: ['shock'], x: 80, y: 60 },
    { id: 'storm', name: 'Storm', cost: 1, maxRanks: 10, description: 'Random Strikes.', prerequisites: ['overload'], x: 50, y: 30 },
  ],
  earth_magic: [
    { id: 'stone_fist', name: 'Stone', cost: 1, maxRanks: 20, description: 'Earth Dmg +.', x: 50, y: 90 },
    { id: 'earth_ward', name: 'Ward', cost: 1, maxRanks: 10, description: 'Earth Res +.', prerequisites: ['stone_fist'], x: 20, y: 60 },
    { id: 'mountain', name: 'Mount', cost: 1, maxRanks: 10, description: 'Max HP +.', prerequisites: ['stone_fist'], x: 80, y: 60 },
    { id: 'quake', name: 'Quake', cost: 1, maxRanks: 10, description: 'Stun.', prerequisites: ['mountain'], x: 50, y: 30 },
  ],
  water_magic: [
    { id: 'tidal_wave', name: 'Tide', cost: 1, maxRanks: 20, description: 'Water Dmg +.', x: 50, y: 90 },
    { id: 'water_ward', name: 'Ward', cost: 1, maxRanks: 10, description: 'Water Res +.', prerequisites: ['tidal_wave'], x: 20, y: 60 },
    { id: 'drown', name: 'Drown', cost: 1, maxRanks: 10, description: 'Drain Stamina.', prerequisites: ['tidal_wave'], x: 80, y: 60 },
    { id: 'tsunami', name: 'Tsunami', cost: 1, maxRanks: 10, description: 'Knockback.', prerequisites: ['drown'], x: 50, y: 30 },
  ],
  light_magic: [
    { id: 'smite', name: 'Smite', cost: 1, maxRanks: 20, description: 'Light Dmg +.', x: 50, y: 90 },
    { id: 'light_ward', name: 'Ward', cost: 1, maxRanks: 10, description: 'Light Res +.', prerequisites: ['smite'], x: 20, y: 60 },
    { id: 'blind', name: 'Flash', cost: 1, maxRanks: 10, description: '-Accuracy.', prerequisites: ['smite'], x: 80, y: 60 },
    { id: 'dawn', name: 'Dawn', cost: 1, maxRanks: 10, description: 'Heal on hit.', prerequisites: ['light_ward'], x: 50, y: 30 },
  ],
  dark_magic: [
    { id: 'decay', name: 'Decay', cost: 1, maxRanks: 20, description: 'Dark Dmg +.', x: 50, y: 90 },
    { id: 'dark_ward', name: 'Ward', cost: 1, maxRanks: 10, description: 'Dark Res +.', prerequisites: ['decay'], x: 20, y: 60 },
    { id: 'fear', name: 'Terror', cost: 1, maxRanks: 10, description: 'Fear.', prerequisites: ['decay'], x: 80, y: 60 },
    { id: 'void', name: 'Void', cost: 1, maxRanks: 10, description: 'Mana steal.', prerequisites: ['fear'], x: 50, y: 30 },
  ],
};

interface SkillTreeModalProps {
  skill: Skill;
  onClose: () => void;
  onUnlock: (skillId: string, perkId: string, cost: number) => void;
  onBack?: () => void;
}

const SkillTreeModal: React.FC<SkillTreeModalProps> = ({ skill, onClose, onUnlock, onBack }) => {
  const perks = PERK_TREE[skill.id] || [];
  const [hoveredPerkId, setHoveredPerkId] = useState<string | null>(null);

  const getPerkStatus = (perk: Perk) => {
    const currentRank = skill.unlockedPerks.filter(id => id === perk.id).length;
    const maxRanks = perk.maxRanks || 1;
    const isUnlocked = currentRank > 0;
    const isMaxed = currentRank >= maxRanks;
    const canAfford = skill.points >= perk.cost;
    
    let dependencyMet = true;
    if (perk.prerequisites) {
        dependencyMet = perk.prerequisites.every(reqId => {
             return skill.unlockedPerks.includes(reqId);
        });
    }

    return { currentRank, maxRanks, isUnlocked, isMaxed, canAfford, dependencyMet };
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col h-[80vh] overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-950 to-gray-900 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            {onBack && (
                <button 
                    onClick={onBack}
                    className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors group"
                    title="Back to Skills List"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                     </svg>
                </button>
            )}
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: skill.color }}>
                {skill.name} Tree
                </h2>
                <p className="text-gray-400 text-xs">Mastery Level {skill.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <div className="text-xl font-mono font-bold text-white">{skill.points}</div>
                <div className="text-[10px] text-gray-500 uppercase">Points</div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
                ✕
             </button>
          </div>
        </div>

        {/* Tree Visualization Area */}
        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/50 to-gray-950">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {perks.map(perk => {
                    if (!perk.prerequisites) return null;
                    return perk.prerequisites.map(reqId => {
                        const reqPerk = perks.find(p => p.id === reqId);
                        if (!reqPerk) return null;

                        const isUnlocked = skill.unlockedPerks.includes(perk.id) || (skill.unlockedPerks.includes(reqId) && skill.points >= perk.cost);
                        
                        return (
                             <line 
                                key={`${perk.id}-${reqId}`}
                                x1={`${reqPerk.x}%`} 
                                y1={`${reqPerk.y}%`} 
                                x2={`${perk.x}%`} 
                                y2={`${perk.y}%`} 
                                stroke={isUnlocked ? skill.color : '#4b5563'} 
                                strokeWidth="2" 
                                strokeOpacity={isUnlocked ? "0.8" : "0.3"} 
                            />
                        );
                    });
                })}
            </svg>

            {/* Nodes */}
            {perks.map((perk) => {
                const { isUnlocked, isMaxed, canAfford, dependencyMet, currentRank, maxRanks } = getPerkStatus(perk);
                const isInteractable = !isMaxed && canAfford && dependencyMet;
                const isRightSide = perk.x > 60;

                return (
                    <div key={perk.id}>
                        <button
                            onClick={() => {
                                if(isInteractable) onUnlock(skill.id, perk.id, perk.cost);
                            }}
                            onMouseEnter={() => setHoveredPerkId(perk.id)}
                            onMouseLeave={() => setHoveredPerkId(null)}
                            className={`
                                absolute w-16 h-16 -ml-8 -mt-8 rounded-full border-2 flex items-center justify-center
                                transition-all duration-300 z-10 group
                                ${isInteractable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
                                ${isInteractable ? 'animate-pulse-slow shadow-[0_0_10px_rgba(255,255,255,0.1)]' : ''}
                            `}
                            style={{ 
                                left: `${perk.x}%`, 
                                top: `${perk.y}%`,
                                borderColor: isUnlocked ? skill.color : '#374151',
                                backgroundColor: isUnlocked ? '#1f2937' : '#111827',
                                boxShadow: isUnlocked ? `0 0 15px ${skill.color}40` : 'none'
                            }}
                        >
                            <span className="font-bold text-[10px] text-center leading-none px-1 overflow-hidden" style={{ color: isUnlocked || canAfford ? '#fff' : '#6b7280' }}>
                                {perk.name}
                            </span>
                            
                            {/* Rank Badge */}
                            {maxRanks > 1 && (
                                 <div className="absolute -bottom-2 bg-gray-900 text-[9px] px-1.5 rounded border border-gray-700 text-gray-300 font-mono z-20">
                                     {currentRank}/{maxRanks}
                                 </div>
                            )}
                        </button>

                        {/* Hover Popup (Tooltip) */}
                        {hoveredPerkId === perk.id && (
                            <div 
                                className="absolute z-50 w-64 p-4 bg-gray-950 border border-gray-600 rounded shadow-xl pointer-events-none animate-fade-in backdrop-blur-md"
                                style={{
                                    left: isRightSide ? 'auto' : `calc(${perk.x}% + 40px)`,
                                    right: isRightSide ? `calc(${100 - perk.x}% + 40px)` : 'auto',
                                    top: `calc(${perk.y}% - 40px)`,
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-bold text-white">{perk.name}</h4>
                                    {maxRanks > 1 && <span className="text-xs text-gray-500">{currentRank}/{maxRanks}</span>}
                                </div>
                                <p className="text-xs text-gray-300 mb-3">{perk.description}</p>
                                
                                <div className="flex justify-between items-center border-t border-gray-800 pt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-xs font-mono ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {perk.cost} Pt{perk.cost > 1 ? 's' : ''}
                                        </span>
                                        {!dependencyMet && (
                                            <span className="text-[10px] text-red-500">
                                                Requires {perks.find(p => p.id === perk.prerequisites?.[0])?.name}
                                            </span>
                                        )}
                                    </div>
                                    {isInteractable ? (
                                        <span className="text-[10px] uppercase font-bold text-green-400">Click to Unlock</span>
                                    ) : isMaxed ? (
                                        <span className="text-[10px] uppercase font-bold text-gray-500">Maxed</span>
                                    ) : (
                                        <span className="text-[10px] uppercase font-bold text-gray-600">Locked</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Description Footer */}
        <div className="bg-gray-900 p-4 border-t border-gray-800 text-center text-gray-500 text-xs italic">
            Paths require unlocking previous nodes. Organic growth leads to mastery.
        </div>

      </div>
    </div>
  );
};

export default SkillTreeModal;