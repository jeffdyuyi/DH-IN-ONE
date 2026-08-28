import { CardData, CardType, WeaponData, LootData, ConsumableData, NpcData, SubWeaponData } from './types';

/**
 * Generate a random 16-character alphanumeric ID compatible with Foundry VTT database IDs.
 */
const generateFvttId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Maps standard workshop traits (in Chinese or English) to FVTT Daggerheart system attribute strings.
 */
const mapTraitToFvtt = (trait: string): string => {
  const t = (trait || '').trim().toLowerCase();
  if (t === '力量' || t === 'strength') return 'strength';
  if (t === '敏捷' || t === 'agility') return 'agility';
  if (t === '灵巧' || t === 'finesse' || t === '技巧') return 'finesse';
  if (t === '风度' || t === 'presence' || t === '魅力') return 'presence';
  if (t === '本能' || t === 'instinct' || t === '感知') return 'instinct';
  if (t === '知识' || t === 'knowledge' || t === '智力') return 'knowledge';
  return 'strength'; // Default fallback
};

/**
 * Maps standard workshop range strings to FVTT Daggerheart range system keys.
 */
const mapRangeToFvtt = (range: string): string => {
  const r = (range || '').trim().toLowerCase();
  if (r === '近战' || r === 'melee') return 'melee';
  if (r === '极近' || r === 'veryclose' || r === 'very close') return 'veryClose';
  if (r === '近距离' || r === 'close') return 'close';
  if (r === '远距离' || r === 'far') return 'far';
  if (r === '极远距离' || r === 'veryfar' || r === 'very far') return 'veryFar';
  return 'melee'; // Default fallback
};

/**
 * Parses damage dice formula like "d8", "d10+1", "1d8+熟练度", "2d6+3+prof"
 * to extract base dice, bonus integer, and whether it scales with proficiency.
 */
interface ParsedDamage {
  dice: string;
  bonus: number | null;
  multiplier: string;
}

const parseDamageDice = (damageStr: string): ParsedDamage => {
  const clean = (damageStr || '').trim().toLowerCase();
  
  // Detect if scaling with Daggerheart proficiency level
  const hasProf = clean.includes('熟练度') || clean.includes('prof');
  
  // Extract main dice component (e.g., "d8", "1d10", "3d6")
  const diceRegex = /(\d+)?d(\d+)/i;
  const match = clean.match(diceRegex);
  
  let dice = 'd8'; // Default fallback
  if (match) {
    const count = match[1] ? match[1] : '1';
    const sides = match[2];
    dice = `${count === '1' ? '' : count}d${sides}`;
  }
  
  // Remove "prof" or "熟练度" indicators to parsing the numeric bonus accurately
  const cleanNoProf = clean.replace(/熟练度/g, '').replace(/prof/g, '');
  const bonusRegex = /([+-])\s*(\d+)/;
  const bonusMatch = cleanNoProf.match(bonusRegex);
  
  let bonus: number | null = null;
  if (bonusMatch) {
    const sign = bonusMatch[1];
    const val = parseInt(bonusMatch[2], 10);
    if (!isNaN(val)) {
      bonus = sign === '-' ? -val : val;
    }
  }
  
  return {
    dice,
    bonus,
    multiplier: hasProf ? 'prof' : 'flat'
  };
};

/**
 * Maps workshop trigger types to FVTT Item system.featureForm (passive / action / reaction).
 */
const mapFeatureFormToFvtt = (trigger: string): string => {
  const t = (trigger || '').toLowerCase();
  if (t.includes('动作') || t.includes('action')) return 'action';
  if (t.includes('反应') || t.includes('reaction')) return 'reaction';
  if (t.includes('被动') || t.includes('passive')) return 'passive';
  return 'passive';
};

/**
 * Exports a Weapon or SubWeapon card to FVTT JSON structure.
 */
const exportWeaponToFvtt = (card: WeaponData | SubWeaponData) => {
  const fvttId = generateFvttId();
  const parsedDamage = parseDamageDice(card.damage || '');
  const isSub = card.type === CardType.SUB_WEAPON;
  
  return {
    name: card.name,
    type: "weapon",
    img: "icons/weapons/daggers/dagger-straight-blue.webp",
    system: {
      description: `<p>${card.feature || ''}</p>${card.description ? `<p>${card.description}</p>` : ''}`,
      actions: {},
      attached: [],
      tier: 1,
      equipped: false,
      secondary: isSub,
      burden: card.burden?.includes('双') || card.burden?.toLowerCase().includes('two') ? 'twoHanded' : 'oneHanded',
      weaponFeatures: [],
      attack: {
        name: "Attack",
        img: "icons/skills/melee/blood-slash-foam-red.webp",
        _id: generateFvttId(),
        baseAction: true,
        systemPath: "attack",
        type: "attack",
        range: mapRangeToFvtt(card.range || 'melee'),
        target: {
          type: "any",
          amount: 1
        },
        roll: {
          trait: mapTraitToFvtt(card.trait || 'strength'),
          type: "attack",
          difficulty: null,
          bonus: null,
          advState: "neutral",
          diceRolling: {
            multiplier: "prof",
            flatMultiplier: 1,
            dice: "d6",
            compare: null,
            treshold: null
          },
          useDefault: false
        },
        damage: {
          parts: [
            {
              value: {
                dice: parsedDamage.dice,
                bonus: parsedDamage.bonus,
                multiplier: parsedDamage.multiplier,
                flatMultiplier: 1,
                custom: {
                  enabled: false,
                  formula: ""
                }
              },
              type: card.damageType?.includes('魔') || card.damageType?.toLowerCase().includes('magic') ? ["magical"] : ["physical"],
              applyTo: "hitPoints",
              resultBased: false,
              valueAlt: {
                multiplier: "prof",
                flatMultiplier: 1,
                dice: "d6",
                bonus: null,
                custom: {
                  enabled: false,
                  formula: ""
                }
              },
              base: false
            }
          ],
          includeBase: false,
          direct: false
        },
        description: "",
        chatDisplay: false,
        actionType: "action",
        cost: [],
        uses: {
          value: null,
          max: null,
          recovery: null,
          consumeOnSuccess: false
        },
        effects: [],
        save: {
          trait: null,
          difficulty: null,
          damageMod: "none"
        },
        originItem: {
          type: "itemCollection"
        },
        triggers: []
      },
      rules: {
        attack: {
          roll: {
            trait: null
          }
        }
      },
      attribution: {
        source: "Daggerheart Card Workshop",
        page: 0,
        artist: card.creator || ""
      }
    },
    effects: [],
    flags: {
      babele: {
        translated: true,
        hasTranslation: true,
        originalName: card.name
      }
    },
    _stats: {
      compendiumSource: null,
      duplicateSource: null,
      exportSource: {
        worldId: "daggerheart-card-workshop",
        uuid: `Item.${fvttId}`,
        coreVersion: "13.351",
        systemId: "daggerheart",
        systemVersion: "1.9.6"
      },
      coreVersion: "13.351",
      systemId: "daggerheart",
      systemVersion: "1.9.6",
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      lastModifiedBy: "daggerheart-card-workshop"
    },
    ownership: {
      default: 0
    }
  };
};

/**
 * Exports a Loot card to FVTT JSON structure.
 */
const exportLootToFvtt = (card: LootData) => {
  const fvttId = generateFvttId();
  return {
    name: card.name,
    type: "loot",
    img: "icons/equipment/hand/glove-ring-leather-green.webp",
    system: {
      description: `<p>${card.feature || ''}</p>${card.description ? `<p>${card.description}</p>` : ''}`,
      quantity: 1,
      actions: {},
      attribution: {
        source: "Daggerheart Card Workshop",
        page: 0,
        artist: card.creator || ""
      }
    },
    effects: [],
    folder: null,
    flags: {
      babele: {
        translated: true,
        hasTranslation: true,
        originalName: card.name
      }
    },
    _stats: {
      compendiumSource: null,
      duplicateSource: null,
      exportSource: {
        worldId: "daggerheart-card-workshop",
        uuid: `Item.${fvttId}`,
        coreVersion: "13.351",
        systemId: "daggerheart",
        systemVersion: "1.9.6"
      },
      coreVersion: "13.351",
      systemId: "daggerheart",
      systemVersion: "1.9.6",
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      lastModifiedBy: "daggerheart-card-workshop"
    },
    ownership: {
      default: 0
    }
  };
};

/**
 * Exports a Consumable card to FVTT JSON structure.
 */
const exportConsumableToFvtt = (card: ConsumableData) => {
  const fvttId = generateFvttId();
  return {
    name: card.name,
    type: "consumable",
    img: "icons/commodities/gems/gem-faceted-cushion-teal-black.webp",
    system: {
      description: `<p>${card.effect || ''}</p>${card.description ? `<p>${card.description}</p>` : ''}`,
      quantity: 1,
      actions: {},
      consumeOnUse: true,
      attribution: {
        source: "Daggerheart Card Workshop",
        page: 0,
        artist: card.creator || ""
      }
    },
    effects: [],
    folder: null,
    flags: {
      babele: {
        translated: true,
        hasTranslation: true,
        originalName: card.name
      }
    },
    _stats: {
      compendiumSource: null,
      duplicateSource: null,
      exportSource: {
        worldId: "daggerheart-card-workshop",
        uuid: `Item.${fvttId}`,
        coreVersion: "13.351",
        systemId: "daggerheart",
        systemVersion: "1.9.6"
      },
      coreVersion: "13.351",
      systemId: "daggerheart",
      systemVersion: "1.9.6",
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      lastModifiedBy: "daggerheart-card-workshop"
    },
    ownership: {
      default: 0
    }
  };
};

/**
 * Exports an NPC / Adversary card to FVTT JSON structure.
 */
const exportNpcToFvtt = (card: NpcData) => {
  const fvttId = generateFvttId();
  
  const adversaryFeatures = (card.features || []).map((feat, index) => {
    const featId = generateFvttId();
    return {
      name: feat.name,
      type: "feature",
      _id: featId,
      img: "icons/skills/melee/strike-slashes-orange.webp",
      system: {
        description: `<p>${feat.effect || ''}</p>`,
        resource: null,
        actions: {},
        originItemType: null,
        attribution: {},
        multiclassOrigin: false,
        featureForm: mapFeatureFormToFvtt(feat.trigger || '')
      },
      effects: [],
      folder: null,
      sort: index * 100,
      flags: {},
      _stats: {
        compendiumSource: null,
        duplicateSource: null,
        exportSource: null,
        coreVersion: "13.351",
        systemId: "daggerheart",
        systemVersion: "1.9.6",
        lastModifiedBy: null
      },
      ownership: {
        default: 0
      }
    };
  });

  return {
    name: card.name,
    img: "icons/svg/mystery-man.svg",
    type: "adversary",
    folder: null,
    system: {
      difficulty: parseInt(card.difficulty, 10) || 10,
      damageThresholds: {
        major: 9,
        severe: 17
      },
      resources: {
        hitPoints: {
          value: 0,
          max: 6
        },
        stress: {
          value: 0,
          max: 2
        }
      },
      motivesAndTactics: card.motive || "",
      resistance: {
        physical: { resistance: false, immunity: false, reduction: 0 },
        magical: { resistance: false, immunity: false, reduction: 0 }
      },
      type: "bruiser",
      notes: "",
      hordeHp: 1,
      experiences: {},
      bonuses: {
        roll: {
          attack: { bonus: 0, dice: [] },
          action: { bonus: 0, dice: [] },
          reaction: { bonus: 0, dice: [] }
        },
        damage: {
          physical: { bonus: 0, dice: [] },
          magical: { bonus: 0, dice: [] }
        }
      },
      tier: 1,
      description: `<p>${card.description || ''}</p>`,
      attack: {
        name: "Standard Attack / 爪击",
        roll: {
          bonus: 1,
          type: "attack",
          trait: null,
          difficulty: null,
          advState: "neutral",
          diceRolling: {
            multiplier: "prof",
            flatMultiplier: 1,
            dice: "d6",
            compare: null,
            treshold: null
          },
          useDefault: false
        },
        damage: {
          parts: [
            {
              value: {
                custom: { enabled: false, formula: "" },
                dice: "d8",
                bonus: 0,
                multiplier: "flat",
                flatMultiplier: 1
              },
              applyTo: "hitPoints",
              type: ["physical"],
              resultBased: false,
              valueAlt: {
                multiplier: "prof",
                flatMultiplier: 1,
                dice: "d6",
                bonus: null,
                custom: { enabled: false, formula: "" }
              },
              base: false
            }
          ],
          includeBase: false,
          direct: false
        },
        img: "icons/creatures/claws/claw-straight-brown.webp",
        type: "attack",
        range: "melee",
        chatDisplay: false,
        _id: generateFvttId(),
        systemPath: "actions",
        baseAction: false,
        description: "",
        originItem: {
          type: "itemCollection"
        },
        actionType: "action",
        triggers: [],
        cost: [],
        uses: {
          value: null,
          max: null,
          recovery: null,
          consumeOnSuccess: false
        },
        target: {
          type: "any",
          amount: null
        },
        effects: [],
        save: {
          trait: null,
          difficulty: null,
          damageMod: "none"
        }
      },
      attribution: {
        source: "Daggerheart Card Workshop",
        page: 0,
        artist: card.creator || ""
      },
      size: "medium",
      advantageSources: [],
      disadvantageSources: [],
      criticalThreshold: 20,
      rules: {
        conditionImmunities: { hidden: false, restrained: false, vulnerable: false },
        damageReduction: {
          thresholdImmunities: { minor: false },
          reduceSeverity: { magical: 0, physical: 0 }
        },
        attack: { damage: { hpDamageMultiplier: 1, hpDamageTakenMultiplier: 1 } }
      }
    },
    flags: {
      babele: {
        translated: true,
        hasTranslation: true,
        originalName: card.name
      }
    },
    prototypeToken: {
      name: card.name,
      displayName: 0,
      actorLink: false,
      width: 1,
      height: 1,
      texture: {
        src: "icons/svg/mystery-man.svg",
        anchorX: 0.5,
        anchorY: 0.5,
        offsetX: 0,
        offsetY: 0,
        fit: "contain",
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        tint: "#ffffff",
        alphaThreshold: 0.75
      },
      lockRotation: false,
      rotation: 0,
      alpha: 1,
      disposition: -1,
      displayBars: 0,
      bar1: { attribute: "resources.hitPoints" },
      bar2: { attribute: "resources.stress" },
      light: {
        negative: false,
        priority: 0,
        alpha: 0.5,
        angle: 360,
        bright: 0,
        color: null,
        coloration: 1,
        dim: 0,
        attenuation: 0.5,
        luminosity: 0.5,
        saturation: 0,
        contrast: 0,
        shadows: 0,
        animation: { type: null, speed: 5, intensity: 5, reverse: false },
        darkness: { min: 0, max: 1 }
      },
      sight: {
        enabled: false,
        range: 0,
        angle: 360,
        visionMode: "basic",
        color: null,
        attenuation: 0.1,
        brightness: 0,
        saturation: 0,
        contrast: 0
      },
      detectionModes: [],
      occludable: { radius: 0 },
      ring: {
        enabled: true,
        colors: { ring: "#8f0000", background: null },
        effects: 1,
        subject: { scale: 0.8, texture: null }
      },
      turnMarker: { mode: 1, animation: null, src: null, disposition: false },
      movementAction: null,
      flags: {},
      randomImg: true,
      appendNumber: false,
      prependAdjective: false
    },
    items: adversaryFeatures,
    effects: [],
    _stats: {
      compendiumSource: null,
      duplicateSource: null,
      exportSource: {
        worldId: "daggerheart-card-workshop",
        uuid: `Actor.${fvttId}`,
        coreVersion: "13.351",
        systemId: "daggerheart",
        systemVersion: "1.9.6"
      },
      coreVersion: "13.351",
      systemId: "daggerheart",
      systemVersion: "1.9.6",
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      lastModifiedBy: "daggerheart-card-workshop"
    },
    ownership: {
      default: 0
    }
  };
};

/**
 * Helper to check if a card type is compatible with FVTT JSON export.
 */
export const isFvttCompatible = (type: CardType): boolean => {
  return [
    CardType.WEAPON,
    CardType.SUB_WEAPON,
    CardType.LOOT,
    CardType.CONSUMABLE,
    CardType.NPC
  ].includes(type);
};

/**
 * Converts a compatible CardData object into a Foundry VTT Daggerheart system JSON representation.
 */
export const convertToFvttJson = (card: CardData): any => {
  switch (card.type) {
    case CardType.WEAPON:
    case CardType.SUB_WEAPON:
      return exportWeaponToFvtt(card as WeaponData | SubWeaponData);
    case CardType.LOOT:
      return exportLootToFvtt(card as LootData);
    case CardType.CONSUMABLE:
      return exportConsumableToFvtt(card as ConsumableData);
    case CardType.NPC:
      return exportNpcToFvtt(card as NpcData);
    default:
      throw new Error(`卡牌类型 "${card.type}" 暂不支持导出为 FVTT 兼容格式。`);
  }
};
