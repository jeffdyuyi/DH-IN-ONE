
export enum CardType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  LOOT = 'loot',
  CONSUMABLE = 'consumable',
  DOMAIN = 'domain',
  STORY = 'story', // Renamed label to Exclusive
  CLASS = 'class',
  SUBCLASS = 'subclass', // Renamed label to Subjob
  ANCESTRY = 'ancestry',
  COMMUNITY = 'community',
  NPC = 'npc',
  CALAMITY = 'calamity',
  INGREDIENT = 'ingredient',
  MEAL = 'meal',
  TRANSFORMATION = 'transformation',
  MATERIAL = 'material',
  VEHICLE = 'vehicle',
  MADNESS = 'madness',
  CLUE = 'clue',
  PROPHECY = 'prophecy',
  QUESTION = 'question',
  QUEST = 'quest',
  SUB_WEAPON = 'subweapon',
  WHEELCHAIR = 'wheelchair',
  ANOMALY = 'anomaly',
  STRONGHOLD = 'stronghold',
  ENVIRONMENT = 'environment',
  LANDMARK = 'landmark',
  RUMOR = 'rumor',
  PRICELIST = 'pricelist',
  CYBERWARE = 'cyberware',
  EXTERNAL_GEAR = 'external_gear'
}

export interface BaseCardData {
  id: string;
  type: CardType;
  name: string;
  description: string; // Flavor text or general description
  creator: string;
  owner: string; // "Belongs to"
}

export interface WeaponData extends BaseCardData {
  trait: string; // e.g. Agility
  range: string;
  damage: string; // e.g. d8
  damageType: string; // Physical/Magic
  burden: string; // One/Two hands
  feature: string;
}

export interface ArmorData extends BaseCardData {
  score: string;
  majorThreshold: string;
  severeThreshold: string;
  feature: string;
}

export interface LootData extends BaseCardData {
  feature: string;
}

export interface ConsumableData extends BaseCardData {
  effect: string;
}

export interface DomainData extends BaseCardData {
  domainName: string;
  level: string; 
  category: string; 
  recallCost: string;
  ability: string;
}

export interface StoryData extends BaseCardData {
  trigger: string;
  effect: string;
}

export interface ClassData extends BaseCardData {
  evasion: string;
  hp: string;
  spellcastingAttribute: string; 
  classFeature: string;
  hopeFeature: string;
  domain1: string;
  domain2: string;
  startingItems: string;
}

export interface SubclassData extends BaseCardData {
  baseClass: string;
  spellcastingAttribute: string; 
  foundationFeature?: string; // Made optional
  masteryFeature?: string;    // Made optional
  advancedFeature?: string;
}

export interface AncestryData extends BaseCardData {
  feature1Name: string;
  feature1Desc: string;
  feature2Name: string;
  feature2Desc: string;
}

export interface CommunityData extends BaseCardData {
  featureName: string;
  featureDesc: string;
  demeanor?: string; // New field: Usually Demeanor
}

export interface NpcFeature {
  name: string;
  choice: string;
  trigger: string;
  effect: string;
}

export interface NpcData extends BaseCardData {
  difficulty: string;
  motive: string;
  features: NpcFeature[];
}

export interface CalamityData extends BaseCardData {
  effect: string;
}

export interface IngredientFlavor {
  name: string; // e.g. Sweet
  die: string;  // e.g. d4
}

export interface IngredientData extends BaseCardData {
  flavors: IngredientFlavor[];
  feature: string;
}

export interface MealComponent {
  name: string; // Ingredient name
  flavor?: string; // Taste/flavor style, e.g. Sweet
  die: string;  // Die contribution
}

export interface MealData extends BaseCardData {
  components: MealComponent[];
  effect: string;
  die: string;
}

export interface TransformationFeature {
  name: string;
  description: string;
}

export interface TransformationData extends BaseCardData {
  features: TransformationFeature[];
}

export interface MaterialFeature {
  name: string;
  description: string;
}

export interface MaterialData extends BaseCardData {
  source: string; // e.g. Dragon
  part: string;   // e.g. Scale
  features: MaterialFeature[];
}

export interface VehicleArmament {
  name: string;
  damage: string;
}

export interface VehicleFeature {
  name: string;
  description: string;
}

export interface VehicleData extends BaseCardData {
  armaments: VehicleArmament[];
  features: VehicleFeature[];
}

export interface MadnessData extends BaseCardData {
  // name is the Symptom Name
  effect: string;
  cureCondition: string;
}

export interface ClueData extends BaseCardData {
  content: string;
  note?: string;
}

export interface ProphecyData extends BaseCardData {
  content: string;
  successEffect: string;
  failureEffect: string;
}

export interface QuestionData extends BaseCardData {
  questionType?: string;
  options: string[];
}

export interface QuestData extends BaseCardData {
  questGiver: string;
  dangerLevel: string;
  deadline: string;
  objectives: string;
  reward: string;
}

export interface SubWeaponData extends BaseCardData {
  trait: string;
  range: string;
  damage: string;
  damageType: string;
  burden: string;
  feature: string;
}

export interface WheelchairData extends BaseCardData {
  frameType: string;
  tier: string;
  trait: string;
  range: string;
  damage: string;
  burden: string;
  evasionMod: string;
  feature: string;
  actions: string;
  consequences: string;
}

export interface AnomalyData extends BaseCardData {
  containmentClass: string;
  source: string;
  procedures: string;
  effects: string;
  drawback: string;
}

export interface StrongholdData extends BaseCardData {
  functions: string;
  restrictions: string;
}

export interface EnvironmentFeature {
  name: string;
  type: string;     // 动作 / 反应 / 被动
  isFear: boolean;  // 是否为恐惧特性
  fearCost: string; // 恐惧点花费 (仅 isFear 时有效)
  description: string;
  guidingQuestion: string; // 引导问题
}

export interface EnvironmentData extends BaseCardData {
  tier: string;           // 位阶
  envType: string;        // 探索型 / 社交型 / 险境型 / 事件型
  tendency: string;       // 趋向
  difficulty: string;     // 难度
  potentialEnemies: string; // 潜在敌人
  features: EnvironmentFeature[];
}

export interface LandmarkData extends BaseCardData {
  appearance: string; // 外观
  functions: string;  // 功能
  notes: string;      // 特殊备注
}

export interface RumorData extends BaseCardData {
  content: string; // 内容
  source?: string; // 来源
  notes?: string;  // 备注
}

export interface PriceListItem {
  name: string;        // 商品名称
  type: string;        // 商品类型
  rarity: string;      // 稀有度
  price: string;       // 价格
  description?: string;// 描述
}

export interface PriceListData extends BaseCardData {
  items: PriceListItem[];
}

export interface CyberwareData extends BaseCardData {
  icon?: string;         // 正方形图标 (Base64/URL，留空则自动提取4字汉字)
  tier: string;          // 位阶: T1, T2, T3...
  cyberType: string;     // 类型: 植入体, 仿生件, 时尚件, 外置设备, 消耗品, 自定义...
  zone: string;          // 安装部位: 上肢, 下肢, 躯干, 头部, 自定义 (可留空)
  slots: string;         // 占用槽位
  restriction: string;   // 限制与前置条件
  effect: string;        // 机制效果说明
  tag: string;           // 特殊标签 (如【故障隐患】)
  compCost: string;      // 元件费用
  surgCost: string;      // 手术费用
  // 战术与作战属性 (外置武器/护甲扩展)
  trait?: string;        // 属性要求 (敏捷/力量/灵巧/本能/风度/知识)
  damage?: string;       // 伤害骰 (如 d10+6)
  range?: string;        // 射程 (近战/邻近/近距离/远距离/极远)
  burden?: string;       // 占用 (单手/双手)
  damageType?: string;   // 伤害类型 (物理/魔法/能量)
  armorScore?: string | number; // 护甲值
  majorThreshold?: string | number; // 重度阈值加成
  severeThreshold?: string | number; // 严重阈值加成
}

export interface ExternalGearData extends BaseCardData {
  tier: string;              // 位阶: T1, T2, T3... (可留空)
  gearType: string;          // 主武器, 副武器, 护甲, 其他外置
  activeSlots: string;       // 激活占用槽位 (如 1, 2, 0, -, 空白)
  feature: string;           // 普通特性 (常驻生效，无需激活)
  activeFeature: string;     // 激活特性 (激活时生效)
  restriction: string;       // 限制与前置条件 (可选)
  tag: string;               // 特殊标签 (如【军规级】)
  cost: string;              // 费用/价格
  icon?: string;             // 装备专属正方形图标数据/URL
  // 基础作战属性 (无需激活直接生效)
  trait?: string;            // 关联属性: 敏捷/力量/灵巧/本能/风度/知识
  range?: string;            // 攻击距离: 近战/邻近/近距离/远距离/极远
  damage?: string;           // 基础伤害: 如 d10+3 物理
  damageType?: string;       // 物理/魔法/能量
  burden?: string;           // 负荷: 单手/双手
  armorScore?: string | number; // 基础护甲值: 如 3
  thresholdBonus?: string;   // 护甲阈值加成: 如 +1/+2
  majorThreshold?: string | number;
  severeThreshold?: string | number;
  // 激活转置属性 (激活后生效，可选)
  hasTransposition?: boolean;
  transDamage?: string;      // 激活转置伤害: 如从 d8+1 变为 d10+1
  transRange?: string;       // 激活转置攻击距离
  transTrait?: string;       // 激活转置属性
  transArmorScore?: string | number; // 激活转置护甲值: 如从 3 变为 4
  transThresholdBonus?: string; // 激活转置护甲阈值: 如从 +1/+2 变为 +2/+3
  transMajorThreshold?: string | number;
  transSevereThreshold?: string | number;
}

// Union type for all card data
export type CardData = 
  | WeaponData 
  | ArmorData 
  | LootData 
  | ConsumableData 
  | DomainData 
  | StoryData 
  | ClassData 
  | SubclassData 
  | AncestryData 
  | CommunityData 
  | NpcData 
  | CalamityData
  | IngredientData
  | MealData
  | TransformationData
  | MaterialData
  | VehicleData
  | MadnessData
  | ClueData
  | ProphecyData
  | QuestionData
  | QuestData
  | SubWeaponData
  | WheelchairData
  | AnomalyData
  | StrongholdData
  | EnvironmentData
  | LandmarkData
  | RumorData
  | PriceListData
  | CyberwareData
  | ExternalGearData;

export interface LibraryItem {
  id: string;
  data: CardData;
  updatedAt: number;
}
