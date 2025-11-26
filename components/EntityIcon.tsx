

import React from 'react';
import { Entity, EntityType, EquipmentSlot, Element } from '../types';

interface EntityIconProps {
  entity?: Entity | null;
  type?: EntityType; // Fallback if entity not provided (for floor/wall)
  size?: string;
  className?: string;
}

const EntityIcon: React.FC<EntityIconProps> = ({ entity, type, size = "w-full h-full", className = "" }) => {
  const entityType = entity?.type || type;
  
  // Default Style
  const styles = `${size} fill-current ${className}`;

  if (entityType === EntityType.WALL) {
    return (
      <svg viewBox="0 0 24 24" className={styles}>
        <path d="M4 4h16v16H4V4zm2 2v4h4V6H6zm6 0v4h4V6h-4zm6 0v4h4V6h-4zM6 12v4h4v-4H6zm6 0v4h4v-4h-4zm6 0v4h4v-4h-4zM6 18v4h4v-4H6zm6 0v4h4v-4h-4zm6 0v4h4v-4h-4z" opacity="0.4" />
        <rect x="2" y="2" width="20" height="20" strokeWidth="2" stroke="currentColor" fill="none" />
      </svg>
    );
  }

  if (entityType === EntityType.FLOOR) {
    return (
      <svg viewBox="0 0 24 24" className={styles}>
         <circle cx="12" cy="12" r="2" opacity="0.3" />
      </svg>
    );
  }

  if (entityType === EntityType.PLAYER) {
      return (
        <svg viewBox="0 0 24 24" className={styles}>
            <path d="M12 2a5 5 0 0 0-5 5v2a2 2 0 0 0-2 2v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5a2 2 0 0 0-2-2V7a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v2H9V7a3 3 0 0 1 3-3zm-5 9h10v3a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-3z" />
        </svg>
      );
  }

  if (entityType === EntityType.ENEMY) {
      // Differentiate based on name if entity is provided
      const name = entity?.name?.toLowerCase() || '';

      if (name.includes('rat')) {
          return (
             <svg viewBox="0 0 24 24" className={styles}>
                 <path d="M12 4a4 4 0 0 0-4 4c0 .66.17 1.27.46 1.81L5 14v4h3v-2l2-2h4l2 2v2h3v-4l-3.46-4.19A3.99 3.99 0 0 0 12 4zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
             </svg>
          );
      }
      if (name.includes('skeleton') || name.includes('specter') || name.includes('wraith')) {
          return (
             <svg viewBox="0 0 24 24" className={styles}>
                 <path d="M12 2a7 7 0 0 0-7 7v6h2v6l3-2 2 2 2-2 3 2v-6h2V9a7 7 0 0 0-7-7zm0 2a5 5 0 0 1 5 5v2H7V9a5 5 0 0 1 5-5zm-3 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm6 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
             </svg>
          );
      }
      if (name.includes('goblin')) {
          // Pointy ears
          return (
             <svg viewBox="0 0 24 24" className={styles}>
                 <path d="M12 4a5 5 0 0 0-5 5v2H4l2 3h1l-1 4h2l1-2h6l1 2h2l-1-4h1l2-3h-3V9a5 5 0 0 0-5-5zm-3 5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm6 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0z" />
             </svg>
          );
      }
      if (name.includes('orc')) {
          // Bulkier, tusks
          return (
              <svg viewBox="0 0 24 24" className={styles}>
                  <path d="M4 8v8h2v2h2v2h8v-2h2v-2h2V8h-2V6h-2V4h-8v2H6v2H4zm6 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-6 3h4v2h-4v-2z" />
              </svg>
          );
      }
      if (name.includes('slime')) {
          return (
             <svg viewBox="0 0 24 24" className={styles}>
                 <path d="M12 8c-4 0-7 3-7 7 0 2 2 4 4 4h6c2 0 4-2 4-4 0-4-3-7-7-7zm-3 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
             </svg>
          );
      }
      if (name.includes('demon')) {
          // Horns
          return (
             <svg viewBox="0 0 24 24" className={styles}>
                 <path d="M6 3l2 4c2 0 4 1 4 3 0-2 2-3 4-3l2-4-2 6c0 4-3 7-6 7s-6-3-6-7l-2-6zm6 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
             </svg>
          );
      }
      if (name.includes('dragon')) {
          return (
             <svg viewBox="0 0 24 24" className={styles}>
                 <path d="M20 2c0 3-3 5-5 5 0 4 2 8 2 12-4 0-8-4-8-8 0-2 1-4 3-5-2 0-4 1-6 2l-2-2 4-4h12zm-8 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
             </svg>
          );
      }
      if (name.includes('imp') || name.includes('fire')) {
           return (
              <svg viewBox="0 0 24 24" className={styles}>
                   <path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 4 4 4 4 0 0 0 4-4c0-4-4-6-4-10zm0 14c-1.1 0-2-.9-2-2 0-1.5 1-2.5 1-3.5 0 2 2 2 2 3.5 0 1.1-.9 2-2 2z" />
              </svg>
           );
      }
      
      // Generic Enemy (Skull)
      return (
          <svg viewBox="0 0 24 24" className={styles}>
               <path d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0zm10-6a6 6 0 0 0-6 6v4h2v2h2v-2h4v2h2v-2h2v-4a6 6 0 0 0-6-6zm-3 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
      );
  }

  if (entityType === EntityType.GOLD) {
      return (
          <svg viewBox="0 0 24 24" className={styles}>
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M12 7v10M9 10l3-2 3 2M9 14l3 2 3-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
      );
  }
  
  if (entityType === EntityType.BANKER) {
      return (
          <svg viewBox="0 0 24 24" className={styles}>
              <path d="M4 10h16v12H4z" opacity="0.5"/>
              <path d="M12 2L2 7v2h20V7L12 2zm-5 7h2v6H7V9zm8 0h2v6h-2V9zM4 19h16v2H4v-2z" />
              <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
      );
  }

  if (entityType === EntityType.CHEST || entityType === EntityType.STORAGE) {
      const isOpen = entity?.isOpen;
      if (isOpen) {
          return (
              <svg viewBox="0 0 24 24" className={styles}>
                  <path d="M3 15h18v6H3v-6zm2 2v2h14v-2H5zm-2-6l2-4h14l2 4H3z" />
              </svg>
          );
      }
      return (
          <svg viewBox="0 0 24 24" className={styles}>
              <path d="M3 9h18v12H3V9zm2 2v8h14v-8H5zm7 1h2v2h-2v-2zM4 5h16v2H4V5z" />
          </svg>
      );
  }

  if (entityType === EntityType.STAIRS) {
      return (
          <svg viewBox="0 0 24 24" className={styles}>
              <path d="M19 5v4h-4v4h-4v4H7v4h12V5h-4zM5 19v-2h4v-4h4v-4h4V7h2v14H5z" />
          </svg>
      );
  }

  if (entityType === EntityType.PORTAL) {
      return (
          <svg viewBox="0 0 24 24" className={styles}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" opacity="0.5"/>
          </svg>
      );
  }

  if (entityType === EntityType.SCROLL) {
      return (
          <svg viewBox="0 0 24 24" className={styles}>
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              <path d="M8 12h8v1H8zM8 16h8v1H8z" fill="currentColor" opacity="0.5"/>
          </svg>
      );
  }

  if (entityType === EntityType.POTION || entityType === EntityType.RECALL_ORB) {
      if (entityType === EntityType.RECALL_ORB) {
          return (
            <svg viewBox="0 0 24 24" className={styles}>
                 <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                 <path d="M12 7l-5 8.5h10L12 7z" />
            </svg>
          );
      }
      return (
          <svg viewBox="0 0 24 24" className={styles}>
              <path d="M14 2h-4v3H8v2h2v13h4V7h2V5h-2V2zm0 5v11h-4V7h4z" />
              <path d="M11 11h2v2h-2v-2zm0 4h2v2h-2v-2z" opacity="0.6"/>
          </svg>
      );
  }

  if (entityType === EntityType.FOOD) {
      return (
          <svg viewBox="0 0 24 24" className={styles}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
      );
  }

  if (entityType === EntityType.EQUIPMENT && entity?.equipmentStats) {
      const slot = entity.equipmentStats.slot;
      const isWand = entity.symbol === '!';

      if (isWand) {
           return (
              <svg viewBox="0 0 24 24" className={styles}>
                  <path d="M18.5 2.5l3 3L7 20l-3-3L18.5 2.5z" />
                  <path d="M16 6l2 2" stroke="currentColor" strokeWidth="1" />
                  <path d="M4 20l3-3" opacity="0.5" />
                  <path d="M19 2l3 3M22 2l-3 3" stroke="currentColor" strokeWidth="1" />
              </svg>
           );
      }
      if (slot === EquipmentSlot.MAIN_HAND) {
          // Sword
          return (
              <svg viewBox="0 0 24 24" className={styles}>
                  <path d="M6 2l12 12-2 2-12-12 2-2z" />
                  <path d="M16 14l4 4" stroke="currentColor" strokeWidth="2" />
                  <path d="M4 18l2 2" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 21l3-3" stroke="currentColor" strokeWidth="1" />
              </svg>
          );
      }
      if (slot === EquipmentSlot.BODY) {
          // Armor
          return (
              <svg viewBox="0 0 24 24" className={styles}>
                  <path d="M5 4c0 4 2 6 2 10 0 4 5 8 5 8s5-4 5-8c0-4 2-6 2-10-3 0-5 2-7 2s-4-2-7-2z" />
              </svg>
          );
      }
      if (slot === EquipmentSlot.HEAD) {
          // Helm
          return (
              <svg viewBox="0 0 24 24" className={styles}>
                  <path d="M4 10v4h2v2h2v-2h8v2h2v-2h2v-4a8 8 0 0 0-16 0zm8-6a6 6 0 0 1 6 6h-12a6 6 0 0 1 6-6z" />
              </svg>
          );
      }
      if (slot === EquipmentSlot.HANDS) {
           return (
              <svg viewBox="0 0 24 24" className={styles}>
                  <path d="M6 4h12v6h-2v4h-2v4h-4v-4H8v-4H6V4zm2 2v2h2v-2H8zm6 0v2h2v-2h-2z" />
              </svg>
           );
      }
      if (slot === EquipmentSlot.FEET) {
           return (
              <svg viewBox="0 0 24 24" className={styles}>
                  <path d="M4 12h6v8H4v-8zm10 0h6v8h-6v-8zm2-4h2v4h-2V8z" />
                  <path d="M4 8h6v4H4V8z" opacity="0.5"/>
              </svg>
           );
      }
      if (slot === EquipmentSlot.NECK) {
          return (
              <svg viewBox="0 0 24 24" className={styles}>
                  <path d="M7 4h10v2h-2v2h-2v2h-2V8H9V6H7V4zm4 8h2v2h-2v-2z" />
                  <circle cx="12" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
          );
      }
      if (slot === EquipmentSlot.ACCESSORY) {
          return (
              <svg viewBox="0 0 24 24" className={styles}>
                  <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="3" fill="none" />
                  <circle cx="12" cy="7" r="2" fill="currentColor" />
              </svg>
          );
      }
  }

  // Fallback for generic Equipment or unknown
  if (entityType === EntityType.EQUIPMENT) {
       return (
          <svg viewBox="0 0 24 24" className={styles}>
              <path d="M12 2l4 4-2 2 4 4-2 2-4-4-4 4-2-2 4-4-2-2 4-4z" />
          </svg>
       );
  }

  // Default / Unknown
  return (
    <svg viewBox="0 0 24 24" className={styles}>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
};

export default EntityIcon;