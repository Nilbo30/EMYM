
import { GoogleGenAI } from "@google/genai";
import { GameState, Entity, SkillType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNarrative = async (
  gameState: GameState,
  trigger: string
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const { player, dungeon } = gameState;
    
    const visibleEntities = dungeon.entities.filter(e => {
        const dx = Math.abs(e.position.x - player.position.x);
        const dy = Math.abs(e.position.y - player.position.y);
        return dx <= 3 && dy <= 3; // Context of immediate surroundings
    });

    const entitiesDesc = visibleEntities.map(e => `${e.name} (${e.type})`).join(", ");
    
    const prompt = `
      You are the Dungeon Master for a roguelike game.
      Current Dungeon Level: ${dungeon.levelNumber}.
      Player HP: ${player.hp}/${player.maxHp}.
      Player Stamina: ${player.stamina}/${player.maxStamina}.
      Player Skills: 
      - Athletics Lvl ${player.skills.athletics.level}
      - Combat Lvl ${player.skills.combat.level}
      - Perception Lvl ${player.skills.perception.level}
      - Survival Lvl ${player.skills.survival?.level || 0}
      
      Immediate Surroundings: ${entitiesDesc || "Empty dark corridor"}.
      
      The player just performed this action: "${trigger}".
      
      Write a SINGLE sentence of atmospheric flavor text describing the result or the feeling of the dungeon. 
      Keep it mysterious, dark, and immersive. Do not describe game mechanics (like +5 XP), only the narrative result.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "The shadows deepen around you.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "";
  }
};

export const generateEnemyFlavor = async (enemyName: string, level: number): Promise<string> => {
    try {
        const model = "gemini-2.5-flash";
        const prompt = `Describe a ${enemyName} found on level ${level} of a mystery dungeon in 10 words or less. Make it sound dangerous.`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text || "A menacing presence.";
    } catch (e) {
        return "A generic enemy.";
    }
}