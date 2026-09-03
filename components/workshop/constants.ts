
import { CardType, CardData } from './types';

// Categories for the dashboard
export enum CardCategory {
  COLLECTION = 'collection', // Was ARSENAL
  WORLD = 'world',
  HERO = 'hero'
}

export const CATEGORY_CONFIG: Record<CardCategory, { label: string; description: string }> = {
  [CardCategory.COLLECTION]: { label: "收集品", description: "装备、物品与珍奇材料" },
  [CardCategory.WORLD]: { label: "世界织造", description: "GM 工具、环境与生态" },
  [CardCategory.HERO]: { label: "英雄构筑", description: "角色核心数据与变身" }
};

// Reorganized tools based on user request
export const TOOL_CATEGORIES: Record<CardCategory, CardType[]> = {
  [CardCategory.COLLECTION]: [
    CardType.WEAPON, 
    CardType.SUB_WEAPON,
    CardType.ARMOR, 
    CardType.LOOT, 
    CardType.CONSUMABLE, 
    CardType.MATERIAL, 
    CardType.VEHICLE,
    CardType.WHEELCHAIR,
    CardType.ANOMALY,
    CardType.STRONGHOLD,
    CardType.INGREDIENT, 
    CardType.MEAL,
    CardType.CLUE,
    CardType.CYBERWARE,
    CardType.EXTERNAL_GEAR
  ],
  [CardCategory.WORLD]: [
    CardType.NPC, 
    CardType.ANCESTRY, 
    CardType.COMMUNITY, 
    CardType.CALAMITY, 
    CardType.MADNESS,
    CardType.PROPHECY,
    CardType.QUEST,
    CardType.ENVIRONMENT,
    CardType.LANDMARK,
    CardType.RUMOR,
    CardType.PRICELIST
  ],
  [CardCategory.HERO]: [
    CardType.CLASS, 
    CardType.SUBCLASS, 
    CardType.DOMAIN, 
    CardType.STORY, 
    CardType.TRANSFORMATION,
    CardType.QUESTION
  ]
};

// Canonical order of categories for dashboards and sidebars
export const CATEGORY_ORDER: CardCategory[] = [
  CardCategory.COLLECTION, 
  CardCategory.WORLD, 
  CardCategory.HERO
];

export const TOOL_CONFIG: Record<CardType, { label: string; color: string; description: string }> = {
  [CardType.WEAPON]: { label: "武器", color: "text-red-500", description: "创建致命的武器卡牌" },
  [CardType.SUB_WEAPON]: { label: "副武器", color: "text-rose-400", description: "设计辅助战斗的副武器" },
  [CardType.ARMOR]: { label: "护甲", color: "text-blue-500", description: "设计防御装备" },
  [CardType.LOOT]: { label: "战利品", color: "text-yellow-500", description: "特殊的物品与宝藏" },
  [CardType.CONSUMABLE]: { label: "消耗品", color: "text-green-500", description: "药水、卷轴与食物" },
  [CardType.DOMAIN]: { label: "领域卡", color: "text-purple-500", description: "特殊能力与法术" },
  [CardType.STORY]: { label: "专属", color: "text-pink-500", description: "角色的背景与使命" },
  [CardType.CLASS]: { label: "职业", color: "text-indigo-500", description: "核心职业基础面板" },
  [CardType.SUBCLASS]: { label: "子职", color: "text-cyan-500", description: "专精与进阶能力" },
  [CardType.ANCESTRY]: { label: "种族", color: "text-emerald-500", description: "血统与天赋" },
  [CardType.COMMUNITY]: { label: "社群", color: "text-orange-500", description: "文化背景与出身" },
  [CardType.NPC]: { label: "NPC", color: "text-rose-500", description: "非敌对的非玩家角色" },
  [CardType.CALAMITY]: { label: "灾厄", color: "text-gray-400", description: "世界性的危机" },
  [CardType.INGREDIENT]: { label: "食材", color: "text-lime-500", description: "烹饪材料与味型骰" },
  [CardType.MEAL]: { label: "料理", color: "text-orange-600", description: "烹饪成品与效果" },
  [CardType.TRANSFORMATION]: { label: "转变卡", color: "text-rose-700", description: "变身与特殊形态" },
  [CardType.MATERIAL]: { label: "材料", color: "text-stone-400", description: "怪物掉落与制作素材" },
  [CardType.VEHICLE]: { label: "载具", color: "text-sky-600", description: "交通工具与移动堡垒" },
  [CardType.WHEELCHAIR]: { label: "战斗轮椅", color: "text-blue-400", description: "设计极富战术机动性的战斗轮椅装备" },
  [CardType.ANOMALY]: { label: "异常", color: "text-violet-400", description: "诡异收容物与超自然奇异现象" },
  [CardType.STRONGHOLD]: { label: "据点", color: "text-amber-800", description: "营地、要塞等特殊功能建筑与安全区" },
  [CardType.MADNESS]: { label: "异化", color: "text-fuchsia-500", description: "理智丧失与精神症状" },
  [CardType.CLUE]: { label: "线索", color: "text-teal-600", description: "重要的调查信息" },
  [CardType.PROPHECY]: { label: "预言", color: "text-violet-600", description: "命运的启示与后果" },
  [CardType.QUESTION]: { label: "问题", color: "text-indigo-600", description: "建立世界观的引导性问题" },
  [CardType.QUEST]: { label: "任务", color: "text-amber-600", description: "设计冒险任务与赏金合约" },
  [CardType.ENVIRONMENT]: { label: "环境", color: "text-teal-500", description: "设计场景环境与地形江山" },
  [CardType.LANDMARK]: { label: "地标", color: "text-emerald-600", description: "设计与记录地标建筑、地点或区域" },
  [CardType.RUMOR]: { label: "传闻", color: "text-rose-400", description: "设计和记录世界中的传闻、流言与来源备注" },
  [CardType.PRICELIST]: { label: "价目表", color: "text-amber-500", description: "设计商店价目表，选择已有商品或完全自定义商品信息" },
  [CardType.CYBERWARE]: { label: "赛博义体", color: "text-yellow-400", description: "赛博朋克风格义体、仿生件与植入体卡片" },
  [CardType.EXTERNAL_GEAR]: { label: "外置装备", color: "text-amber-500", description: "外置武器、护甲及战术外挂，支持普通特性与激活转置" },
};

export const DEFAULT_VALUES: Record<CardType, Partial<CardData>> = {
  [CardType.WEAPON]: {
    name: "古旧长剑", trait: "敏捷", range: "近战", damage: "d8", damageType: "物理", burden: "单手", feature: "可靠：你的攻击检定+1。", description: "一把久经沙场的利刃。", creator: "GM", owner: "战士"
  },
  [CardType.SUB_WEAPON]: {
    name: "古旧匕首", trait: "敏捷", range: "近战/投掷", damage: "d6", damageType: "物理", burden: "轻型", feature: "精准：投掷攻击时，暴击阈值-1。", description: "易于隐藏的防身副手武器。", creator: "GM", owner: "盗贼"
  },
  [CardType.ARMOR]: {
    name: "皮甲", score: "3", majorThreshold: "6", severeThreshold: "12", feature: "无声：潜行检定获得优势。", description: "轻便且坚韧。", creator: "GM", owner: "游侠"
  },
  [CardType.LOOT]: {
    name: "神秘护符", feature: "每日一次，你可以重投任意一颗骰子。", description: "散发着微弱的光芒。", creator: "GM", owner: "-"
  },
  [CardType.CONSUMABLE]: {
    name: "治疗药水", effect: "花费一个动作饮用，回复 1d4 HP。", description: "红色的液体，尝起来像草莓。", creator: "GM", owner: "-"
  },
  [CardType.DOMAIN]: {
    name: "火球术", domainName: "元素", level: "1", category: "法术", recallCost: "2", ability: "对远距离内所有生物造成 d20 魔法伤害。", description: "经典的毁灭性法术。", creator: "GM", owner: "法师"
  },
  [CardType.STORY]: {
    name: "复仇誓言", trigger: "当你对仇敌造成伤害时", effect: "标记1点压力，伤害+2。", description: "你不会忘记那一天。", creator: "GM", owner: "-"
  },
  [CardType.CLASS]: {
    name: "战士", evasion: "8", hp: "6", spellcastingAttribute: "", classFeature: "战斗风格：选择一种武器类型获得专精。", hopeFeature: "花费2希望，回复1d4 HP。", domain1: "刀锋", domain2: "骨气", startingItems: "一把长剑、一副胸甲、冒险者包袋", description: "战场上的大师。", creator: "GM", owner: "-"
  },
  [CardType.SUBCLASS]: {
    name: "狂战士", baseClass: "战士", spellcastingAttribute: "", foundationFeature: "狂暴：伤害+2，但受到伤害+1。", masteryFeature: "不灭：HP归零时，掷d20，若>10则保留1HP。", description: "怒火是你的力量源泉。", creator: "GM", owner: "-"
  },
  [CardType.ANCESTRY]: {
    name: "精灵", feature1Name: "敏锐感官", feature1Desc: "察觉检定获得优势。", feature2Name: "精类血统", feature2Desc: "对魅惑效果免疫。", description: "古老而优雅的种族。", creator: "GM", owner: "-"
  },
  [CardType.COMMUNITY]: {
    name: "流浪者", featureName: "街头智慧", featureDesc: "在城市中搜集情报获得优势。", demeanor: "警惕，团结，排外。", description: "四海为家。", creator: "GM", owner: "-"
  },
  [CardType.NPC]: {
    name: "奥术导师", difficulty: "12", motive: "传授知识，保护学徒", description: "一位博学但有些古怪的法师，总是随身带着厚厚的典籍。", 
    features: [{ 
      name: "奥术束缚", 
      choice: "战斗开始时，选择一个偏爱的玩家角色。",
      trigger: "战斗中，位于近距离范围内、受到偏爱的玩家角色第一次受到攻击命中时。",
      effect: "对该敌人进行一次带有 +6 调整值的攻击掷骰。成功时，强大的魔法触须使目标暂时处于 束缚 状态。"
    }], 
    creator: "GM", 
    owner: "-"
  },
  [CardType.CALAMITY]: {
    name: "永夜降临", effect: "所有依赖视力的检定处于劣势。每回合结束时，若不在光源附近，承受1点压力。", description: "太阳不再升起。", creator: "GM", owner: "-"
  },
  [CardType.INGREDIENT]: {
    name: "发光蘑菇", 
    flavors: [{ name: "怪味", die: "d20" }], 
    feature: "发光：食用后身体会发出微弱的光芒，持续1小时。", 
    description: "生长在幽暗地域的奇特真菌。", 
    creator: "GM", 
    owner: "-"
  },
  [CardType.MEAL]: {
    name: "蘑菇炖汤", 
    components: [
      { name: "发光蘑菇", flavor: "怪味", die: "d20" },
      { name: "岩盐", flavor: "咸味", die: "d6" }
    ], 
    die: "d20 + d6",
    effect: "恢复 1d4 HP，并且在黑暗中获得优势，持续至下一次长休。", 
    description: "虽然颜色很奇怪，但味道意外不错。", 
    creator: "GM", 
    owner: "-"
  },
  [CardType.TRANSFORMATION]: {
    name: "吸血鬼",
    description: "吸血鬼是拥有尖牙的不死生物，以活物之血为食。",
    features: [
      {
        name: "獠牙",
        description: "进行一次力量掷骰以啃咬一个近战范围内的目标，造成使用你熟练值的d8物理伤害。"
      },
      {
        name: "饱餐",
        description: "当使用獠牙对一个活着的生物攻击成功时，你可以标记1压力点以饱餐。放置数量等同于你使目标标记的生命点数的指示物于此卡上。你可以同时储存至多5个指示物。在进行动作掷骰前，你可以花费1指示物将恐惧骰替换为d20。当你进行长休时，移除一个指示物。若此卡上没有指示物，你的所有动作掷骰和反应掷骰都具有劣势。"
      }
    ],
    creator: "GM",
    owner: "-"
  },
  [CardType.MATERIAL]: {
    name: "红龙·逆鳞",
    source: "红龙",
    part: "逆鳞",
    description: "一片散发着惊人热量的鳞片，坚硬无比。",
    features: [
      { name: "火焰抗性", description: "以此材料制作的护甲提供火焰伤害减免。" }
    ],
    creator: "GM",
    owner: "-"
  },
  [CardType.VEHICLE]: {
    name: "沙海游艇",
    description: "依靠风力在沙漠中疾驰的轻型船只。",
    armaments: [
      { name: "侧舷弩炮", damage: "3d8 物理" }
    ],
    features: [
      { name: "沙漠适应", description: "在沙地地形移动速度加倍。" }
    ],
    creator: "GM",
    owner: "-"
  },
  [CardType.WHEELCHAIR]: {
    name: "改进型轻型框架轮椅",
    frameType: "轻型框架",
    tier: "2",
    trait: "敏捷",
    range: "近战",
    damage: "d8+3 物理",
    burden: "单手操控",
    evasionMod: "无",
    feature: "快速：当你进行攻击时，你可以标记 1 压力点，以射程内下一生物为目标。",
    actions: "• 我推到门边，看看门是不是开着的。\n• 我把轮椅推到人群中，问问发生了什么。\n• 我拉下刹车，急停，然后在座位上转身，用弓对准入侵者。",
    consequences: "• 我拉下刹车，但没想到地面上碎石的影响。\n• 我小心撞上了一块坚冰，结果整个滑了出去，超出了目标位置。\n• 我想要发力追击，但前轮卡在路面裂缝中，让我稍微停顿了一下。",
    description: "在《匕首之心》中为行动受限的角色量身定制的轻型机动战斗轮椅，在保证高机动性的同时具备防卫性物理杀伤力。",
    creator: "Mark Thompson",
    owner: "-"
  },
  [CardType.ANOMALY]: {
    name: "无光之镜",
    containmentClass: "欧几里得",
    source: "深渊裂隙",
    procedures: "必须放置在完全不透光的黑曜石匣中，任何时候不得用肉眼直接注视镜面。",
    effects: "折射：当被激活时，可以投射出一个与目标完全相同的幻影，持续1分钟。",
    drawback: "吸魂：每次激活，使用者必须标记 1 点压力，否则将永久失去 1点最大生命值。",
    description: "一面边缘饰有古老符文的黑框铜镜，镜中照出的景象总是比现实慢半拍。",
    creator: "GM",
    owner: "-"
  },
  [CardType.STRONGHOLD]: {
    name: "红枫避难所",
    functions: "• 休憩点：在此进行长休时，全员额外恢复 1点压力点。\n• 简易工坊：可在此制作普通等级的药剂与消耗品。",
    restrictions: "位置固定：据点无法移动。若暴露在敌人视野中可能遭遇突袭。",
    description: "坐落在红枫谷峭壁上的半隐藏式要塞，地势险要，易守难攻。",
    creator: "GM",
    owner: "冒险者公会"
  },
  [CardType.MADNESS]: {
    name: "偏执狂", // Symptom name
    effect: "你不再信任任何盟友。无法接受由于“帮助”动作带来的优势骰。",
    cureCondition: "当你被一名盟友从濒死状态救回时。",
    description: "他们在看着我...他们都想害我...",
    creator: "GM",
    owner: "-"
  },
  [CardType.CLUE]: {
    name: "加密信件",
    content: "信中提到了'苍白之塔'和'午夜仪式'，落款是一个奇怪的眼睛符号。",
    note: "似乎需要特殊的透镜才能阅读全文。",
    creator: "GM",
    owner: "-"
  },
  [CardType.PROPHECY]: {
    name: "双星陨落",
    content: "当两颗红色的星辰在夜空中交汇之时，旧王将陨，新王加冕。",
    successEffect: "所有玩家恢复所有希望，并获得一次自动成功的判定。",
    failureEffect: "所有玩家受到 1d10 精神伤害，世界进入动荡状态。",
    description: "古老的卷轴上记载的预言。",
    creator: "GM",
    owner: "-"
  },
  [CardType.QUESTION]: {
    name: "建立羁绊",
    questionType: "破冰问题",
    options: [
      "你的角色最害怕什么？",
      "你曾欠过谁一个巨大的人情？",
      "在这个队伍中，你最信任谁，为什么？"
    ],
    creator: "GM",
    owner: "-"
  },
  [CardType.QUEST]: {
    name: "低语森林的林地救援",
    questGiver: "银叶村村长",
    dangerLevel: "中等 (危险骰 d8)",
    deadline: "长休之前",
    objectives: "1. 在低语森林深处搜寻失踪的伐木工队。\n2. 击败盘踞在森林边缘的邪恶林妖。\n3. 护送幸存的村民安全返回银叶村。",
    reward: "100枚金币，银叶村声望值提高",
    description: "低语森林最近变得十分不安分，有传言称见到了怪物的踪迹，被派出的伐木工已经三天没有音讯了。",
    creator: "GM",
    owner: "冒险者小队"
  },
  [CardType.ENVIRONMENT]: {
    name: "汹涌河流",
    tier: "2",
    envType: "险境型",
    tendency: "将你冲走或溺毙",
    difficulty: "10",
    potentialEnemies: "河妖、巨型鳄鱼、水元素",
    description: "湍急的河水在乱石间奔腾怒吼，白色的泡沫翻涌不息。",
    features: [
      {
        name: "暗流",
        type: "被动",
        isFear: false,
        fearCost: "",
        description: "在河流中移动时，须通过一次难度为该环境的力量或敏捷检定，否则被水流冲离原位至远距离外的随机方向。",
        guidingQuestion: "河床上散落着哪些小物件和饰品？这片水域是否存在掠食者？"
      }
    ],
    creator: "GM",
    owner: "-"
  },
  [CardType.LANDMARK]: {
    name: "风鸣尖塔",
    appearance: "一座五层塔楼，唐期风格建筑，湖绿色的琪岩遗址被屨萤草包围。塔顶层毫无掩诚地立于平原之上，易于远望识别。",
    functions: "导航地标：背袭者在五公里内可看到塔顶，远射程内当作定位参照点。",
    notes: "居民传言尖塔里住着小哭鬼，夜长可能听到妖异的筛嫃声。",
    description: "尖塔屋榖挂着漂空的鸣帖，在广阔空旷的原野上发出忧郁的低迟回响。",
    creator: "GM",
    owner: "-"
  },
  [CardType.RUMOR]: {
    name: "低语森林的红衣人",
    content: "有人在深夜的低语森林深处看到一个身穿红衣的身影，伴随着微弱的歌声出现，随后消失在迷雾中。",
    source: "猎人阿尔维斯",
    notes: "多名村民也声称听到了歌声，可能与最近的失踪事件有关。",
    description: "在林地间流传的诡异流言。",
    creator: "GM",
    owner: "-"
  },
  [CardType.PRICELIST]: {
    name: "橡木盾酒馆与商铺",
    items: [
      { name: "钢制长剑", type: "武器", rarity: "普通", price: "15金币", description: "精工打造的双刃钢剑，刻有白桦花纹。" },
      { name: "轻型皮甲", type: "护甲", rarity: "普通", price: "10金币", description: "经过熟化处理的坚韧牛皮甲，便于潜行。" },
      { name: "治疗药水", type: "消耗品", rarity: "罕见", price: "25金币", description: "可恢复1d4点生命值的红色药剂。" }
    ],
    description: "位于边境小镇的集市商店，由老矮人托尔迪恩经营。",
    creator: "GM",
    owner: "托尔迪恩"
  },
  [CardType.CYBERWARE]: {
    name: "微型皮下线圈",
    tier: "T1",
    cyberType: "植入体 (Implant)",
    zone: "上肢 (Arms)",
    slots: "1",
    restriction: "需要灵巧 +1 以上",
    effect: "你的徒手近战攻击视为具有【迅捷】特性（标记 1 压力点可额外攻击一个射程内的目标）。",
    tag: "",
    compCost: "1.5w 信用点",
    surgCost: "5000 信用点",
    description: "",
    creator: "GM",
    owner: "-"
  },
  [CardType.EXTERNAL_GEAR]: {
    name: "破甲刀",
    tier: "T1",
    gearType: "主武器",
    activeSlots: "1",
    trait: "敏捷",
    range: "近战",
    damage: "d10+3",
    damageType: "物理",
    burden: "双手",
    feature: "",
    activeFeature: "强力：额外掷一个伤害骰并去掉其中最小的一个。",
    restriction: "——",
    tag: "",
    cost: "20,000 信用点",
    description: "",
    creator: "GM",
    owner: "-"
  }
};
