/**
 * DH-IN-ONE Shared Card Vault (公共本地卡牌库) 核心数据契约
 * 统一标准: 规范 v1.0
 */

export const VAULT_SCHEMA_VERSION = 1;

export type VaultCardCategory =
  | 'weapon'          // 武器
  | 'armor'           // 护甲
  | 'loot'            // 战利品 (官方d60/自制)
  | 'consumable'      // 消耗品 (官方d60/自制)
  | 'cyberware'       // 赛博装备 (植入体/仿生件等)
  | 'external_gear'   // 外置装备 (主副武器/护甲/外置设备)
  | 'enemy'           // 敌人 (详版战斗数据)
  | 'environment'     // 环境 (详版险境机制)
  | 'npc'             // 非战斗NPC/剧情角色
  | 'domain'          // 领域法术/技能
  | 'class'           // 职业卡 (Profession)
  | 'subclass'        // 子职业卡 (Subclass)
  | 'ancestry'        // 种族卡 (Ancestry)
  | 'community'       // 社群卡 (Community)
  | 'vehicle'         // 载具
  | 'ingredient'      // 食材
  | 'meal'            // 料理
  | 'material'        // 材料
  | 'landmark'        // 地标
  | 'rumor'           // 谣言
  | 'quest'           // 任务
  | 'clue'            // 线索
  | 'story'           // 独特/独有
  | 'transformation'  // 变形
  | 'stronghold'      // 据点
  | 'anomaly'         // 异常
  | 'wheelchair'      // 战术轮椅
  | 'pricelist'       // 价目表
  | 'custom';         // 其他自定义类型

export type VaultSourceApp = 'workshop' | 'campaign' | 'character' | 'builtin';

// ===== 各分类结构化 Payload 定义 =====

export interface VaultWeaponData {
  trait: string;          // 关联属性 (力量/敏捷/灵巧/本能/风度/知识)
  range: string;          // 射程 (近战/邻近/近距/远距/极远距)
  damage: string;         // 伤害骰 (如 d8, d10+3)
  damageType: string;     // 伤害类型 (物理/魔法)
  burden: string;         // 单手 (oneHanded) / 双手 (twoHanded)
  feature?: string;       // 机制特性描述
  tier?: string;          // 位阶 (T1, T2, T3, T4)
}

export interface VaultArmorData {
  score: number;          // 基础护甲值
  majorThreshold: number; // 中伤阈值
  severeThreshold: number;// 重伤阈值
  feature?: string;       // 护甲特性 (如: 灵活/重型)
  tier?: string;          // 位阶
}

export interface VaultCyberwareData {
  tier: string;           // 位阶: T1, T2, T3, T4...
  cyberType: string;      // 植入体 / 仿生件 / 时尚件 / 外置设备 / 消耗品
  zone: 'head' | 'torso' | 'arms' | 'legs' | 'external' | string; // 身体部位 / 挂载位置
  slots: number;          // 占用插槽数 (默认1)
  restriction?: string;   // 限制/前置条件
  effect: string;         // 机制效果说明
  tag?: string;           // 特殊标签 (如: 【故障隐患】)
  compCost?: string;      // 元件费用
  surgCost?: string;      // 手术费用
  // 战术武器与护甲作战属性 (可选)
  trait?: string;
  damage?: string;
  range?: string;
  burden?: string;
  damageType?: string;
  armorScore?: number;
  majorThreshold?: number;
  severeThreshold?: number;
}

export interface VaultExternalGearData {
  tier?: string;
  gearType: string; // 主武器, 副武器, 护甲, 其他外置
  activeSlots: number; // 激活占用槽位 (0 代表免激活槽)
  feature?: string; // 普通特性 (常驻生效)
  activeFeature?: string; // 激活特性 (激活时生效)
  restriction?: string;
  tag?: string;
  cost?: string;
  // 基础作战属性
  trait?: string;
  damage?: string;
  range?: string;
  burden?: string;
  damageType?: string;
  armorScore?: number;
  thresholdBonus?: string;
  majorThreshold?: number;
  severeThreshold?: number;
  // 激活转置模板
  activeTransposition?: {
    damage?: string;
    range?: string;
    trait?: string;
    armorScore?: number;
    thresholdBonus?: string;
    majorThreshold?: number;
    severeThreshold?: number;
  };
}

export interface VaultEnemyTrait {
  id: string;
  name: string;
  type: 'passive' | 'action' | 'reaction' | 'spotlight';
  description: string;
  flavor?: string;
  isSpecial?: boolean;
}

export interface VaultEnemyData {
  tier: number;
  enemyType: string;
  isNpcMode?: boolean;
  avatarUrl?: string;
  flavor?: string;
  tactics: string;
  experiences?: string;
  stats: {
    difficulty: number;
    thresholdMinor: number;
    thresholdMajor: number;
    hp: number;
    stress: number;
  };
  attack: {
    name: string;
    modifier: string;
    damage: string;
    damageType?: 'physical' | 'magical';
    range: string;
  };
  traits: VaultEnemyTrait[];
}

export interface VaultEnvironmentFeature {
  id: string;
  name: string;
  type: 'passive' | 'action' | 'reaction' | 'spotlight';
  isFear?: boolean;
  fearCost?: string;
  description: string;
  questions?: string;
}

export interface VaultEnvironmentData {
  tier: number;
  envType: string;
  imageUrl?: string;
  trend: string;          // 趋向 (原工坊 tendency)
  difficulty: number;
  potentialEnemies?: string;
  countdown?: number;     // 倒计时
  countdownDescription?: string;
  features: VaultEnvironmentFeature[];
}

export interface VaultLootData {
  rollIndex?: number;     // 对应官方 d60 编号 (01~60)
  effect: string;         // 官方效果文案
  rarity?: string;
  suggestedZone?: string; // 跨界转义体时的推荐部位 (如: 上肢/头部)
  statBonus?: {           // 遗宝类属性加成
    target: string;       // 如 "agility", "strength", "evasion"
    value: number;
  };
}

export interface VaultConsumableData {
  rollIndex?: number;     // 对应官方 d60 编号 (01~60)
  effect: string;         // 官方效果文案
  categoryTag?: 'heal' | 'buff' | 'damage' | 'utility' | string; // 分类标签
  dieExpression?: string; // 掷骰表达式 (如 1d4, 1d20, 2d20)
}

// 通用或自定义 Payload
export type VaultCardPayload =
  | VaultWeaponData
  | VaultArmorData
  | VaultCyberwareData
  | VaultEnemyData
  | VaultEnvironmentData
  | VaultLootData
  | VaultConsumableData
  | Record<string, any>;

// ===== VaultCard 主契约 =====

export interface VaultCard {
  id: string;                     // 全局唯一ID (如 vault_loot_01 或 uuid)
  name: string;                   // 卡牌中文名
  englishName?: string;           // 英文名 (可选)
  category: VaultCardCategory;    // 卡牌分类
  description?: string;           // 通用风味描述/简介
  sourceApp: VaultSourceApp;      // 来源应用 (workshop | campaign | character | builtin)
  sourceId?: string;              // 原始应用内部ID
  
  imageId?: string;               // 关联的 VaultImageStore 图片ID (IndexedDB)
  imageUrl?: string;              // 图片临时URL或外链 (可选)
  
  author?: string;                // 作者 (默认: "官方规则书" 或 用户名)
  tags?: string[];                // 自定义检索标签
  isBuiltin?: boolean;            // 是否为官方内置种子卡牌 (内置卡默认只读或支持另存为魔改)
  
  schemaVersion: number;          // 数据架构版本号 (当前: 1)
  createdAt: number;              // 创建时间戳
  updatedAt: number;              // 更新时间戳

  data: VaultCardPayload;         // 具体分类载荷
}

// 查询过滤条件
export interface VaultQueryFilter {
  category?: VaultCardCategory | VaultCardCategory[];
  sourceApp?: VaultSourceApp;
  isBuiltin?: boolean;
  keyword?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}
