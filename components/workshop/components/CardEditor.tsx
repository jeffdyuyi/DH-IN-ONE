
import React from 'react';
import { CardData, CardType, NpcData, NpcFeature, IngredientData, IngredientFlavor, MealComponent, MealData, SubclassData, TransformationData, TransformationFeature, MaterialData, MaterialFeature, VehicleData, VehicleArmament, VehicleFeature, MadnessData, ClassData, DomainData, CommunityData, ClueData, ProphecyData, QuestionData, QuestData, SubWeaponData, WheelchairData, AnomalyData, StrongholdData, EnvironmentData, EnvironmentFeature, LandmarkData, RumorData, PriceListItem, PriceListData, CyberwareData } from '../types';
import { TOOL_CONFIG } from '../constants';
import RichTextArea from './RichTextArea';
import { getLibrary } from '../utils';

interface Props {
  data: CardData;
  onChange: (data: CardData) => void;
}

// --- Helper Components ---

const Input = ({ label, value, onChange, placeholder, full = false }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string, full?: boolean }) => (
  <div className={`flex flex-col gap-1 ${full ? 'col-span-2' : ''}`}>
    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 dark:focus:border-amber-500 transition-colors"
      placeholder={placeholder}
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string }) => (
  <RichTextArea label={label} value={value} onChange={onChange} placeholder={placeholder} />
);

// Generic list editor component
function ListEditor<T>({
  title,
  items,
  onUpdate,
  onAdd,
  onRemove,
  renderItem
}: {
  title: string;
  items: T[];
  onUpdate: (index: number, key: keyof T, val: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number, update: (key: keyof T, val: any) => void) => React.ReactNode;
}) {
  return (
    <div className="col-span-2 space-y-3 border-t border-slate-200 dark:border-zinc-800 pt-4 mt-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-zinc-500 uppercase">{title}</label>
        <button onClick={onAdd} className="text-xs bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 px-2.5 py-1 rounded text-slate-700 dark:text-amber-500 transition-colors font-medium">
          ＋ 新增
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="relative group">
           {renderItem(item, i, (key, val) => onUpdate(i, key, val))}
           <button onClick={() => onRemove(i)} className="absolute right-2 top-2.5 text-[10px] font-bold text-slate-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors z-10">
              删除
           </button>
        </div>
      ))}
    </div>
  );
}

// --- Main Component ---

const CardEditor: React.FC<Props> = ({ data, onChange }) => {
  
  const handleChange = (field: string, value: any) => {
    let newData = { ...data, [field]: value } as CardData;
    // Auto-update name for Material
    if (data.type === CardType.MATERIAL && (field === 'source' || field === 'part')) {
        const source = field === 'source' ? value : (data as MaterialData).source;
        const part = field === 'part' ? value : (data as MaterialData).part;
        newData = { ...newData, name: `${source} · ${part}` };
    }
    onChange(newData);
  };

  const renderFields = () => {
    switch (data.type) {
      case CardType.WEAPON:
      case CardType.SUB_WEAPON:
        return (
          <>
            <Input label="属性" value={(data as any).trait} onChange={v => handleChange('trait', v)} placeholder="例如: 敏捷" />
            <Input label="距离" value={(data as any).range} onChange={v => handleChange('range', v)} placeholder="例如: 近战" />
            <Input label="伤害骰" value={(data as any).damage} onChange={v => handleChange('damage', v)} placeholder="例如: d8" />
            <Input label="类型" value={(data as any).damageType} onChange={v => handleChange('damageType', v)} placeholder="物理/魔法" />
            <Input label="负荷" value={(data as any).burden} onChange={v => handleChange('burden', v)} placeholder="单手/双手" />
            <TextArea label="特性" value={(data as any).feature} onChange={v => handleChange('feature', v)} />
          </>
        );
      case CardType.ARMOR:
        return (
          <>
            <Input label="护甲值" value={(data as any).score} onChange={v => handleChange('score', v)} />
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <Input label="重度阈值" value={(data as any).majorThreshold} onChange={v => handleChange('majorThreshold', v)} />
              <Input label="严重阈值" value={(data as any).severeThreshold} onChange={v => handleChange('severeThreshold', v)} />
            </div>
            <TextArea label="特性" value={(data as any).feature} onChange={v => handleChange('feature', v)} />
          </>
        );
      case CardType.LOOT:
        return <TextArea label="战利品特性" value={(data as any).feature} onChange={v => handleChange('feature', v)} />;
      case CardType.CONSUMABLE:
        return <TextArea label="使用效果" value={(data as any).effect} onChange={v => handleChange('effect', v)} />;
      case CardType.DOMAIN:
        return (
          <>
            <div className="grid grid-cols-2 gap-4 col-span-2">
               <Input label="领域名称" value={(data as any).domainName} onChange={v => handleChange('domainName', v)} placeholder="如: 元素" />
               <Input label="等级" value={(data as DomainData).level} onChange={v => handleChange('level', v)} placeholder="1" />
            </div>
            <Input label="类别" value={(data as DomainData).category} onChange={v => handleChange('category', v)} placeholder="如: 法术/魔法书" full />
            <Input label="回想费用" value={(data as any).recallCost} onChange={v => handleChange('recallCost', v)} placeholder="1" full />
            <TextArea label="卡牌能力" value={(data as any).ability} onChange={v => handleChange('ability', v)} />
          </>
        );
      case CardType.STORY:
        return (
          <>
            <TextArea label="触发条件" value={(data as any).trigger} onChange={v => handleChange('trigger', v)} />
            <TextArea label="效果/收益" value={(data as any).effect} onChange={v => handleChange('effect', v)} />
          </>
        );
      case CardType.CLASS:
        const cls = data as ClassData;
        return (
          <>
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <Input label="基础闪避" value={cls.evasion} onChange={v => handleChange('evasion', v)} />
              <Input label="基础HP" value={cls.hp} onChange={v => handleChange('hp', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <Input label="领域 1" value={cls.domain1 || ''} onChange={v => handleChange('domain1', v)} placeholder="例如: 刀锋" />
              <Input label="领域 2" value={cls.domain2 || ''} onChange={v => handleChange('domain2', v)} placeholder="例如: 骨气" />
            </div>
            <Input label="起始物品" value={cls.startingItems || ''} onChange={v => handleChange('startingItems', v)} placeholder="例如: 一把长剑、一副胸甲、冒险者包袋" full />
            <Input label="施法属性 (可选)" value={cls.spellcastingAttribute} onChange={v => handleChange('spellcastingAttribute', v)} placeholder="例如: 智力" full />
            <TextArea label="职业特性" value={cls.classFeature} onChange={v => handleChange('classFeature', v)} />
            <TextArea label="希望特性" value={cls.hopeFeature} onChange={v => handleChange('hopeFeature', v)} />
          </>
        );
      case CardType.SUBCLASS:
        const sub = data as SubclassData;
        return (
          <>
            <Input label="基础职业" value={sub.baseClass} onChange={v => handleChange('baseClass', v)} />
            <Input label="施法属性 (可选)" value={sub.spellcastingAttribute} onChange={v => handleChange('spellcastingAttribute', v)} placeholder="例如: 魅力" />
            <TextArea label="基础特性 (可选)" value={sub.foundationFeature || ''} onChange={v => handleChange('foundationFeature', v)} />
            <TextArea label="进阶特性 (可选)" value={sub.advancedFeature || ''} onChange={v => handleChange('advancedFeature', v)} placeholder="高等级解锁的能力..." />
            <TextArea label="精通特性 (可选)" value={sub.masteryFeature || ''} onChange={v => handleChange('masteryFeature', v)} />
          </>
        );
      case CardType.ANCESTRY:
        return (
          <>
            <Input label="特性 1 名称" value={(data as any).feature1Name} onChange={v => handleChange('feature1Name', v)} full />
            <TextArea label="特性 1 描述" value={(data as any).feature1Desc} onChange={v => handleChange('feature1Desc', v)} />
            <Input label="特性 2 名称" value={(data as any).feature2Name} onChange={v => handleChange('feature2Name', v)} full />
            <TextArea label="特性 2 描述" value={(data as any).feature2Desc} onChange={v => handleChange('feature2Desc', v)} />
          </>
        );
      case CardType.COMMUNITY:
        return (
          <>
            <Input label="特性名称" value={(data as any).featureName} onChange={v => handleChange('featureName', v)} full />
            <TextArea label="特性描述" value={(data as any).featureDesc} onChange={v => handleChange('featureDesc', v)} />
            <TextArea label="通常表现 (可选)" value={(data as CommunityData).demeanor || ''} onChange={v => handleChange('demeanor', v)} placeholder="例如：警惕，团结，排外..." />
          </>
        );
      case CardType.NPC:
        return (
          <>
            <Input label="难度" value={(data as any).difficulty} onChange={v => handleChange('difficulty', v)} placeholder="12" />
            <Input label="动机" value={(data as any).motive} onChange={v => handleChange('motive', v)} placeholder="保卫巢穴" />
            <ListEditor<NpcFeature>
              title="NPC 特性"
              items={(data as NpcData).features || []}
              onAdd={() => handleChange('features', [...((data as NpcData).features || []), { name: '新特性', choice: '', trigger: '', effect: '' }])}
              onRemove={(i) => handleChange('features', (data as NpcData).features.filter((_, idx) => idx !== i))}
              onUpdate={(i, k, v) => {
                 const newFeatures = [...(data as NpcData).features];
                 newFeatures[i] = { ...newFeatures[i], [k]: v };
                 handleChange('features', newFeatures);
              }}
              renderItem={(f, i, update) => (
                <div className="bg-slate-50 dark:bg-zinc-900/50 p-3 rounded border border-slate-200 dark:border-zinc-800 space-y-2">
                   <input className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm w-full font-bold mb-2 mr-6" value={f.name} onChange={(e) => update('name', e.target.value)} placeholder="特性名称" />
                   <div className="space-y-2">
                      <input className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm" value={f.choice} onChange={(e) => update('choice', e.target.value)} placeholder="选择 (可选)" />
                      <input className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm" value={f.trigger} onChange={(e) => update('trigger', e.target.value)} placeholder="触发" />
                      <RichTextArea inline={true} minHeight="min-h-[60px]" value={f.effect} onChange={(v) => update('effect', v)} placeholder="效果描述..." />
                   </div>
                </div>
              )}
            />
          </>
        );
      case CardType.CALAMITY:
        return <TextArea label="灾厄效果" value={(data as any).effect} onChange={v => handleChange('effect', v)} />;
      case CardType.INGREDIENT:
        return (
          <>
            <ListEditor<IngredientFlavor>
              title="味型配置"
              items={(data as IngredientData).flavors || []}
              onAdd={() => handleChange('flavors', [...((data as IngredientData).flavors || []), { name: '甜味', die: 'd4' }])}
              onRemove={(i) => handleChange('flavors', (data as IngredientData).flavors.filter((_, idx) => idx !== i))}
              onUpdate={(i, k, v) => {
                  const list = [...(data as IngredientData).flavors];
                  list[i] = { ...list[i], [k]: v };
                  handleChange('flavors', list);
              }}
              renderItem={(f, i, update) => (
                <div className="flex gap-2 items-center bg-slate-50 dark:bg-zinc-900/50 p-2 rounded border border-slate-200 dark:border-zinc-800 mr-6">
                  <input
                      type="text"
                      value={f.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="味觉名称 (如: 甜味)"
                      className="flex-grow bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 dark:focus:border-amber-500 transition-colors"
                  />
                  <input
                      type="text"
                      value={f.die}
                      onChange={(e) => update('die', e.target.value)}
                      placeholder="骰子 (如: d4)"
                      className="w-28 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 dark:focus:border-amber-500 transition-colors font-bold text-center"
                  />
                </div>
              )}
            />
            <TextArea label="特性" value={(data as any).feature} onChange={v => handleChange('feature', v)} />
          </>
        );
      case CardType.MEAL:
        return (
          <>
            <ListEditor<MealComponent>
              title="所用食材"
              items={(data as MealData).components || []}
              onAdd={() => handleChange('components', [...((data as MealData).components || []), { name: '', flavor: '', die: '' }])}
              onRemove={(i) => handleChange('components', (data as MealData).components.filter((_, idx) => idx !== i))}
              onUpdate={(i, k, v) => {
                  const list = [...(data as MealData).components];
                  list[i] = { ...list[i], [k]: v };
                  handleChange('components', list);
              }}
              renderItem={(c, i, update) => (
                 <div className="flex gap-2 items-center bg-slate-50 dark:bg-zinc-900/50 p-2 rounded border border-slate-200 dark:border-zinc-800 mr-6">
                    <input type="text" value={c.name} onChange={(e) => update('name', e.target.value)} className="flex-grow bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-zinc-200" placeholder="食材名称" />
                    <input type="text" value={c.flavor || ''} onChange={(e) => update('flavor', e.target.value)} className="w-24 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm text-center text-slate-900 dark:text-zinc-200" placeholder="味型 (如: 甜味)" />
                    <input type="text" value={c.die} onChange={(e) => update('die', e.target.value)} className="w-20 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm text-center text-slate-900 dark:text-zinc-200" placeholder="d4" />
                 </div>
              )}
            />
            <Input label="总对应骰" value={(data as any).die} onChange={v => handleChange('die', v)} placeholder="例如: 1d20+4" full/>
            <TextArea label="额外效果" value={(data as any).effect} onChange={v => handleChange('effect', v)} />
          </>
        );
      case CardType.TRANSFORMATION:
        return (
          <>
            <ListEditor<TransformationFeature>
              title="转变特性"
              items={(data as TransformationData).features || []}
              onAdd={() => handleChange('features', [...((data as TransformationData).features || []), { name: '新特性', description: '' }])}
              onRemove={(i) => handleChange('features', (data as TransformationData).features.filter((_, idx) => idx !== i))}
              onUpdate={(i, k, v) => {
                  const list = [...(data as TransformationData).features];
                  list[i] = { ...list[i], [k]: v };
                  handleChange('features', list);
              }}
              renderItem={(f, i, update) => (
                <div className="bg-slate-50 dark:bg-zinc-900/50 p-3 rounded border border-slate-200 dark:border-zinc-800 space-y-2 relative">
                  <div className="flex justify-between mb-2 mr-6">
                      <input 
                        className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm w-full font-bold text-slate-900 dark:text-zinc-200" 
                        value={f.name} 
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="特性名称 (例如: 獠牙)"
                      />
                  </div>
                  <RichTextArea 
                    inline={true} 
                    minHeight="min-h-[60px]" 
                    value={f.description} 
                    onChange={(v) => update('description', v)} 
                    placeholder="特性描述..." 
                  />
                </div>
              )}
            />
          </>
        );
      case CardType.MATERIAL:
        return (
          <>
            <div className="grid grid-cols-2 gap-4 col-span-2">
               <Input label="出处" value={(data as MaterialData).source} onChange={v => handleChange('source', v)} placeholder="例如: 巨龙" />
               <Input label="部位" value={(data as MaterialData).part} onChange={v => handleChange('part', v)} placeholder="例如: 逆鳞" />
            </div>
            <ListEditor<MaterialFeature>
              title="附加特性"
              items={(data as MaterialData).features || []}
              onAdd={() => handleChange('features', [...((data as MaterialData).features || []), { name: '', description: '' }])}
              onRemove={(i) => handleChange('features', (data as MaterialData).features.filter((_, idx) => idx !== i))}
              onUpdate={(i, k, v) => {
                  const list = [...(data as MaterialData).features];
                  list[i] = { ...list[i], [k]: v };
                  handleChange('features', list);
              }}
              renderItem={(f, i, update) => (
                <div className="bg-slate-50 dark:bg-zinc-900/50 p-3 rounded border border-slate-200 dark:border-zinc-800 space-y-2 relative">
                  <div className="flex justify-between mb-2 mr-6">
                      <input 
                        className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm w-full font-bold text-slate-900 dark:text-zinc-200" 
                        value={f.name} 
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="特性名称"
                      />
                  </div>
                  <RichTextArea 
                    inline={true} 
                    minHeight="min-h-[60px]" 
                    value={f.description} 
                    onChange={(v) => update('description', v)} 
                    placeholder="描述..." 
                  />
                </div>
              )}
            />
          </>
        );
      case CardType.VEHICLE:
        return (
          <>
            <ListEditor<VehicleArmament>
              title="武装列表"
              items={(data as VehicleData).armaments || []}
              onAdd={() => handleChange('armaments', [...((data as VehicleData).armaments || []), { name: '', damage: '' }])}
              onRemove={(i) => handleChange('armaments', (data as VehicleData).armaments.filter((_, idx) => idx !== i))}
              onUpdate={(i, k, v) => {
                  const list = [...(data as VehicleData).armaments];
                  list[i] = { ...list[i], [k]: v };
                  handleChange('armaments', list);
              }}
              renderItem={(f, i, update) => (
                <div className="flex gap-2 items-center bg-slate-50 dark:bg-zinc-900/50 p-2 rounded border border-slate-200 dark:border-zinc-800 relative mr-6">
                   <input type="text" value={f.name} onChange={(e) => update('name', e.target.value)} className="flex-1 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm" placeholder="武装名称" />
                   <input type="text" value={f.damage} onChange={(e) => update('damage', e.target.value)} className="w-24 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm text-center" placeholder="伤害 (3d8)" />
                </div>
              )}
            />
            <ListEditor<VehicleFeature>
              title="载具特性"
              items={(data as VehicleData).features || []}
              onAdd={() => handleChange('features', [...((data as VehicleData).features || []), { name: '', description: '' }])}
              onRemove={(i) => handleChange('features', (data as VehicleData).features.filter((_, idx) => idx !== i))}
              onUpdate={(i, k, v) => {
                  const list = [...(data as VehicleData).features];
                  list[i] = { ...list[i], [k]: v };
                  handleChange('features', list);
              }}
              renderItem={(f, i, update) => (
                <div className="bg-slate-50 dark:bg-zinc-900/50 p-3 rounded border border-slate-200 dark:border-zinc-800 space-y-2 relative">
                  <div className="flex justify-between mb-2 mr-6">
                      <input 
                        className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm w-full font-bold text-slate-900 dark:text-zinc-200" 
                        value={f.name} 
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="特性名称"
                      />
                  </div>
                  <RichTextArea 
                    inline={true} 
                    minHeight="min-h-[60px]" 
                    value={f.description} 
                    onChange={(v) => update('description', v)} 
                    placeholder="描述..." 
                  />
                </div>
              )}
            />
          </>
        );
      case CardType.MADNESS:
        return (
          <>
             <div className="col-span-2 space-y-4">
                <TextArea label="效果" value={(data as MadnessData).effect} onChange={v => handleChange('effect', v)} placeholder="对玩家造成的负面影响..." />
                <TextArea label="失效条件" value={(data as MadnessData).cureCondition} onChange={v => handleChange('cureCondition', v)} placeholder="如何治愈..." />
             </div>
          </>
        );
      case CardType.CLUE:
        return (
           <>
              <TextArea label="内容" value={(data as ClueData).content} onChange={v => handleChange('content', v)} placeholder="线索的具体内容..." />
              <Input label="备注 (可选)" value={(data as ClueData).note || ''} onChange={v => handleChange('note', v)} full />
           </>
        );
      case CardType.PROPHECY:
        return (
           <>
              <TextArea label="预言内容" value={(data as ProphecyData).content} onChange={v => handleChange('content', v)} placeholder="命运的启示..." />
              <TextArea label="应验效果" value={(data as ProphecyData).successEffect} onChange={v => handleChange('successEffect', v)} />
              <TextArea label="失败效果" value={(data as ProphecyData).failureEffect} onChange={v => handleChange('failureEffect', v)} />
           </>
        );
      case CardType.QUESTION:
        return (
           <>
              <Input label="类型 (可选)" value={(data as QuestionData).questionType || ''} onChange={v => handleChange('questionType', v)} full />
              <div className="col-span-2 space-y-3 border-t border-slate-200 dark:border-zinc-800 pt-4 mt-2">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-500 uppercase">填写内容</label>
                    <button onClick={() => {
                        const currentOpts = (data as QuestionData).options || [];
                        handleChange('options', [...currentOpts, '']);
                    }} className="text-xs bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 px-2.5 py-1 rounded text-slate-700 dark:text-amber-500 transition-colors font-medium">
                      ＋ 新增
                    </button>
                 </div>
                 {((data as QuestionData).options || []).map((opt, i) => (
                    <div key={i} className="relative group">
                       <RichTextArea 
                           inline={true} 
                           minHeight="min-h-[50px]" 
                           value={opt} 
                           onChange={(v) => {
                              const newOpts = [...(data as QuestionData).options];
                              newOpts[i] = v;
                              handleChange('options', newOpts);
                           }}
                           placeholder={`内容 ${i+1}...`}
                        />
                       {((data as QuestionData).options || []).length > 3 && (
                           <button onClick={() => {
                               const currentOpts = (data as QuestionData).options || [];
                               const newOpts = currentOpts.filter((_, idx) => idx !== i);
                               handleChange('options', newOpts);
                           }} className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                              删除
                           </button>
                       )}
                    </div>
                 ))}
                 {/* Ensure at least 3 items exist */}
                 {((data as QuestionData).options || []).length < 3 && (
                    <div className="text-xs text-amber-600 dark:text-amber-500 italic">至少需要保留3个内容项。</div>
                 )}
              </div>
           </>
        );
      case CardType.QUEST: {
        const q = data as QuestData;
        return (
          <>
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <Input label="委托方" value={q.questGiver || ''} onChange={v => handleChange('questGiver', v)} placeholder="例如: 银叶村村长" />
              <Input label="时限" value={q.deadline || ''} onChange={v => handleChange('deadline', v)} placeholder="例如: 长休之前" />
            </div>
            <Input label="危险等级" value={q.dangerLevel || ''} onChange={v => handleChange('dangerLevel', v)} placeholder="例如: 中等 (危险骰 d8)" full />
            <TextArea label="任务目标" value={q.objectives || ''} onChange={v => handleChange('objectives', v)} placeholder="填写任务的具体目标，可分行描述..." />
            <TextArea label="任务奖励" value={q.reward || ''} onChange={v => handleChange('reward', v)} placeholder="任务完成后可获得的奖励..." />
          </>
        );
      }
      case CardType.WHEELCHAIR: {
        const w = data as WheelchairData;
        return (
          <>
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <Input label="框架型号" value={w.frameType || ''} onChange={v => handleChange('frameType', v)} placeholder="例如: 轻型框架" />
              <Input label="位阶" value={w.tier || ''} onChange={v => handleChange('tier', v)} placeholder="例如: 2" />
              <Input label="使用属性" value={w.trait || ''} onChange={v => handleChange('trait', v)} placeholder="例如: 敏捷" />
              <Input label="射程距离" value={w.range || ''} onChange={v => handleChange('range', v)} placeholder="例如: 近战" />
              <Input label="伤害骰" value={w.damage || ''} onChange={v => handleChange('damage', v)} placeholder="例如: d8+3 物理" />
              <Input label="操控负荷" value={w.burden || ''} onChange={v => handleChange('burden', v)} placeholder="例如: 单手操控" />
              <Input label="闪避值修正" value={w.evasionMod || ''} onChange={v => handleChange('evasionMod', v)} placeholder="例如: 无 / -1" full />
            </div>
            <TextArea label="核心特性" value={w.feature || ''} onChange={v => handleChange('feature', v)} placeholder="例如: 快速：当你进行攻击时..." />
            <TextArea label="动作与移动" value={w.actions || ''} onChange={v => handleChange('actions', v)} placeholder="动作示例描述..." />
            <TextArea label="判定后果" value={w.consequences || ''} onChange={v => handleChange('consequences', v)} placeholder="判定后果示例描述..." />
          </>
        );
      }
      case CardType.ANOMALY: {
        const a = data as AnomalyData;
        return (
          <>
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <Input label="收容等级" value={a.containmentClass || ''} onChange={v => handleChange('containmentClass', v)} placeholder="例如: 欧几里得" />
              <Input label="发生源头" value={a.source || ''} onChange={v => handleChange('source', v)} placeholder="例如: 深渊裂隙" />
            </div>
            <TextArea label="收容措施" value={a.procedures || ''} onChange={v => handleChange('procedures', v)} placeholder="必须放置在完全不透光的黑曜石匣中..." />
            <TextArea label="异常效应 (可选)" value={a.effects || ''} onChange={v => handleChange('effects', v)} placeholder="折射：当被激活时，可以投射出一个与目标完全相同的幻影..." />
            <TextArea label="代价与负面后果 (可选)" value={a.drawback || ''} onChange={v => handleChange('drawback', v)} placeholder="吸魂：每次激活，使用者必须标记 1 点压力..." />
          </>
        );
      }
      case CardType.STRONGHOLD: {
        const s = data as StrongholdData;
        return (
          <>
            <TextArea label="据点功能" value={s.functions || ''} onChange={v => handleChange('functions', v)} placeholder="据点所能提供的休息、制造或防御加成描述..." />
            <TextArea label="特殊限制 (可选)" value={s.restrictions || ''} onChange={v => handleChange('restrictions', v)} placeholder="据点的负面效果或限制，例如：位置固定，无法移动..." />
          </>
        );
      }
      case CardType.LANDMARK: {
        const lm = data as LandmarkData;
        return (
          <>
            <TextArea label="外观" value={lm.appearance || ''} onChange={v => handleChange('appearance', v)} placeholder="这个地点看起来是什么模样？建筑、地形、地貌、规模..." />
            <TextArea label="功能" value={lm.functions || ''} onChange={v => handleChange('functions', v)} placeholder="这个地点具有哪些实用功能或加成？" />
            <TextArea label="特殊备注 (可选)" value={lm.notes || ''} onChange={v => handleChange('notes', v)} placeholder="例如：传说、秘密、居民警告、GM备忘..." />
          </>
        );
      }
      case CardType.RUMOR: {
        const r = data as RumorData;
        return (
          <>
            <TextArea label="内容" value={r.content || ''} onChange={v => handleChange('content', v)} placeholder="传闻的具体内容..." />
            <Input label="来源 (可选)" value={r.source || ''} onChange={v => handleChange('source', v)} placeholder="例如: 猎人阿尔维斯，古老文献" full />
            <TextArea label="备注 (可选)" value={r.notes || ''} onChange={v => handleChange('notes', v)} placeholder="例如: 传闻背后的真实背景或GM备忘..." />
          </>
        );
      }
      case CardType.PRICELIST: {
        const pl = data as PriceListData;
        // Get valid goods from local library
        const libGoods = getLibrary().filter(item => 
          [CardType.WEAPON, CardType.SUB_WEAPON, CardType.ARMOR, CardType.LOOT, CardType.CONSUMABLE].includes(item.data.type)
        );

        return (
          <>
            <div className="col-span-2 text-sm text-zinc-500 mb-2">
              您可以在价目表中列出商品。商品可以从本地库中已有的武器、护甲、副武器、战利品和消耗品中选择填充，或完全自定义输入。
            </div>
            
            <ListEditor<PriceListItem>
              title="商品列表"
              items={pl.items || []}
              onAdd={() => handleChange('items', [...(pl.items || []), {
                name: '新商品',
                type: '自定义',
                rarity: '普通',
                price: '10银币',
                description: ''
              }])}
              onRemove={i => handleChange('items', (pl.items || []).filter((_, idx) => idx !== i))}
              onUpdate={(i, k, v) => {
                const list = [...(pl.items || [])];
                list[i] = { ...list[i], [k]: v };
                handleChange('items', list);
              }}
              renderItem={(item, i, update) => (
                <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded border border-slate-200 dark:border-zinc-800 space-y-3">
                  {/* Select from Library */}
                  {libGoods.length > 0 && (
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">从本地库导入:</span>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const selected = libGoods.find(g => g.id === val);
                          if (selected) {
                            const list = [...(pl.items || [])];
                            const typeLabels: Record<string, string> = {
                              [CardType.WEAPON]: '武器',
                              [CardType.SUB_WEAPON]: '副武器',
                              [CardType.ARMOR]: '护甲',
                              [CardType.LOOT]: '战利品',
                              [CardType.CONSUMABLE]: '消耗品'
                            };
                            list[i] = {
                              ...list[i],
                              name: selected.data.name,
                              type: typeLabels[selected.data.type] || '自定义',
                              description: selected.data.description || ''
                            };
                            handleChange('items', list);
                            e.target.value = '';
                          }
                        }}
                        className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-zinc-200 flex-grow"
                        defaultValue=""
                      >
                        <option value="">-- 选择库中已有卡牌以自动填充 --</option>
                        {libGoods.map(g => (
                          <option key={g.id} value={g.id}>
                            [{TOOL_CONFIG[g.data.type].label}] {g.data.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">商品名称</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => update('name', e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 dark:focus:border-amber-500"
                        placeholder="商品名称"
                      />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">类型</label>
                      <input
                        type="text"
                        value={item.type}
                        onChange={e => update('type', e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 dark:focus:border-amber-500"
                        placeholder="例如: 武器 / 消耗品 / 自定义"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">稀有度</label>
                      <input
                        type="text"
                        value={item.rarity}
                        onChange={e => update('rarity', e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 dark:focus:border-amber-500"
                        placeholder="例如: 普通 / 罕见 / 珍贵"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">价格</label>
                      <input
                        type="text"
                        value={item.price}
                        onChange={e => update('price', e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 dark:focus:border-amber-500"
                        placeholder="例如: 10金币 / 5银币"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 pt-1">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">商品描述 (可选，输入才显示)</label>
                    <textarea
                      value={item.description || ''}
                      onChange={e => update('description', e.target.value)}
                      rows={2}
                      className="bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-200 font-sans resize-y focus:outline-none focus:border-blue-500 dark:focus:border-amber-500"
                      placeholder="介绍商品的外观或特殊效果描述..."
                    />
                  </div>
                </div>
              )}
            />
          </>
        );
      }
      case CardType.CYBERWARE: {
        const cw = data as CyberwareData;
        const presetTypes = ["外置设备", "植入体", "仿生件", "时尚件", "消耗品"];
        const presetZones = ["主武器", "副武器", "护甲", "头部", "躯干", "上肢", "下肢", "外置设备", ""];

        return (
          <>
            <div className="grid grid-cols-3 gap-3 col-span-2">
              <div className="flex flex-col gap-1 col-span-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">位阶 (Tier, 可留空)</label>
                <div className="flex gap-2">
                  <select
                    value={["T1", "T2", "T3", "T4", ""].includes(cw.tier || '') ? (cw.tier || '') : '__custom__'}
                    onChange={e => {
                      if (e.target.value !== '__custom__') {
                        handleChange('tier', e.target.value);
                      }
                    }}
                    className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2 py-2 text-xs text-slate-900 dark:text-zinc-200"
                  >
                    <option value="T1">T1</option>
                    <option value="T2">T2</option>
                    <option value="T3">T3</option>
                    <option value="T4">T4</option>
                    <option value="">无 (留空)</option>
                    <option value="__custom__">自定义...</option>
                  </select>
                  <input
                    type="text"
                    value={cw.tier || ''}
                    onChange={e => handleChange('tier', e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-2 text-slate-900 dark:text-zinc-200 text-xs focus:outline-none focus:border-blue-500 dark:focus:border-amber-500"
                    placeholder="如 T1 或留空"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">类型 (Type)</label>
                <div className="flex gap-2">
                  <select
                    value={presetTypes.includes(cw.cyberType || '') ? cw.cyberType : '__custom__'}
                    onChange={e => {
                      if (e.target.value !== '__custom__') {
                        handleChange('cyberType', e.target.value);
                      }
                    }}
                    className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2 py-2 text-xs text-slate-900 dark:text-zinc-200"
                  >
                    <optgroup label="外置装备">
                      <option value="外置设备">外置设备</option>
                    </optgroup>
                    <optgroup label="身体义体改造">
                      <option value="植入体">植入体</option>
                      <option value="仿生件">仿生件</option>
                      <option value="时尚件">时尚件</option>
                    </optgroup>
                    <optgroup label="消耗品">
                      <option value="消耗品">消耗品</option>
                    </optgroup>
                    <option value="__custom__">自定义...</option>
                  </select>
                  <input
                    type="text"
                    value={cw.cyberType || ''}
                    onChange={e => handleChange('cyberType', e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-slate-900 dark:text-zinc-200 text-xs focus:outline-none focus:border-blue-500 dark:focus:border-amber-500"
                    placeholder="如: 外置设备 / 植入体"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 col-span-2">
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">部位 / 分类 (Zone / Category)</label>
                <div className="flex gap-2">
                  <select
                    value={presetZones.includes(cw.zone || '') ? (cw.zone || '') : '__custom__'}
                    onChange={e => {
                      if (e.target.value !== '__custom__') {
                        handleChange('zone', e.target.value);
                      }
                    }}
                    className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2 py-2 text-xs text-slate-900 dark:text-zinc-200"
                  >
                    <optgroup label="外置装备挂载">
                      <option value="主武器">主武器</option>
                      <option value="副武器">副武器</option>
                      <option value="护甲">护甲</option>
                      <option value="外置设备">外置设备</option>
                    </optgroup>
                    <optgroup label="身体义体插槽">
                      <option value="头部">头部</option>
                      <option value="躯干">躯干</option>
                      <option value="上肢">上肢</option>
                      <option value="下肢">下肢</option>
                    </optgroup>
                    <option value="">无 (留空)</option>
                    <option value="__custom__">自定义...</option>
                  </select>
                  <input
                    type="text"
                    value={cw.zone || ''}
                    onChange={e => handleChange('zone', e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-slate-900 dark:text-zinc-200 text-xs focus:outline-none focus:border-blue-500 dark:focus:border-amber-500"
                    placeholder="主武器 / 副武器 / 护甲 / 部位"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 col-span-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">占用槽位</label>
                <input
                  type="text"
                  value={cw.slots || ''}
                  onChange={e => handleChange('slots', e.target.value)}
                  className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-slate-900 dark:text-zinc-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-amber-500"
                  placeholder="例如: 1"
                />
              </div>
            </div>

            {/* 作战/外置武器护甲扩展属性 */}
            <div className="col-span-2 p-3 bg-zinc-100 dark:bg-zinc-800/60 rounded border border-zinc-200 dark:border-zinc-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  作战参数 (主武器 / 副武器 / 护甲 - 可选)
                </span>
                <span className="text-[11px] text-zinc-500">填写或正文包含对应词条时自动识别</span>
              </div>

              {/* 武器属性 */}
              <div className="grid grid-cols-4 gap-2">
                <Input label="主属性要求" value={cw.trait || ''} onChange={v => handleChange('trait', v)} placeholder="如: 敏捷/力量" />
                <Input label="伤害骰" value={cw.damage || ''} onChange={v => handleChange('damage', v)} placeholder="如: d10+6" />
                <Input label="射程" value={cw.range || ''} onChange={v => handleChange('range', v)} placeholder="如: 近战/近距离" />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">占用形式</label>
                  <select
                    value={cw.burden || ''}
                    onChange={e => handleChange('burden', e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2 py-2 text-xs text-slate-900 dark:text-zinc-200"
                  >
                    <option value="">自动识别</option>
                    <option value="单手">单手</option>
                    <option value="双手">双手</option>
                    <option value="副手">副手</option>
                  </select>
                </div>
              </div>

              {/* 护甲属性 */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
                <Input label="护甲值 (Score)" value={cw.armorScore !== undefined ? String(cw.armorScore) : ''} onChange={v => handleChange('armorScore', v)} placeholder="如: 3" />
                <Input label="重度阈值加成 (+Major)" value={cw.majorThreshold !== undefined ? String(cw.majorThreshold) : ''} onChange={v => handleChange('majorThreshold', v)} placeholder="如: 2" />
                <Input label="严重阈值加成 (+Severe)" value={cw.severeThreshold !== undefined ? String(cw.severeThreshold) : ''} onChange={v => handleChange('severeThreshold', v)} placeholder="如: 4" />
              </div>
            </div>

            <Input label="限制与前置条件 (Restrictions)" value={cw.restriction || ''} onChange={v => handleChange('restriction', v)} placeholder="例如: 需要灵巧 +1 以上" full />
            
            <TextArea label="机制效果说明 (Effect)" value={cw.effect || ''} onChange={v => handleChange('effect', v)} placeholder="卡牌的核心效果机制..." />
            
            <Input label="特殊标签 (可选，如【故障隐患】或【军规级】)" value={cw.tag || ''} onChange={v => handleChange('tag', v)} placeholder="例如: 【故障隐患】" full />

            <div className="grid grid-cols-2 gap-4 col-span-2">
              <Input label="元件基础价 (Component Cost)" value={cw.compCost || ''} onChange={v => handleChange('compCost', v)} placeholder="例如: 1.5w 信用点" />
              <Input label="安装手术费 (Surgery Cost)" value={cw.surgCost || ''} onChange={v => handleChange('surgCost', v)} placeholder="例如: 5000 信用点" />
            </div>
          </>
        );
      }
      default:
        return <TextArea label="详细内容" value={(data as any).description} onChange={v => handleChange('description', v)} />;
    }
  };

  // Environment card editor case — inserted before the default
  const renderEnvironmentEditor = () => {
    const env = data as EnvironmentData;
    return (
      <>
        <div className="grid grid-cols-2 gap-4 col-span-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">位阶</label>
            <input
              type="text"
              value={env.tier || ''}
              onChange={e => handleChange('tier', e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="例如: 2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">环境类型</label>
            <select
              value={env.envType || '险境型'}
              onChange={e => handleChange('envType', e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="探索型">探索型</option>
              <option value="社交型">社交型</option>
              <option value="险境型">险境型</option>
              <option value="事件型">事件型</option>
            </select>
          </div>
        </div>
        <TextArea label="趋向" value={env.tendency || ''} onChange={v => handleChange('tendency', v)} placeholder="例如：将你冲走或溺毙" />
        <div className="grid grid-cols-2 gap-4 col-span-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">难度</label>
            <input
              type="text"
              value={env.difficulty || ''}
              onChange={e => handleChange('difficulty', e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="例如: 10"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">潜在敌人</label>
            <input
              type="text"
              value={env.potentialEnemies || ''}
              onChange={e => handleChange('potentialEnemies', e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="例如: 河妖、巨型鳄鱼"
            />
          </div>
        </div>
        <ListEditor<EnvironmentFeature>
          title="环境特性"
          items={env.features || []}
          onAdd={() => handleChange('features', [...(env.features || []), {
            name: '新特性',
            type: '动作',
            isFear: false,
            fearCost: '1',
            description: '',
            guidingQuestion: ''
          }])}
          onRemove={i => handleChange('features', (env.features || []).filter((_, idx) => idx !== i))}
          onUpdate={(i, k, v) => {
            const list = [...(env.features || [])];
            list[i] = { ...list[i], [k]: v };
            handleChange('features', list);
          }}
          renderItem={(f, i, update) => (
            <div className="bg-slate-50 dark:bg-zinc-900/50 p-3 rounded border border-slate-200 dark:border-zinc-800 space-y-2">
              {/* Feature name and type row */}
              <div className="flex gap-2 items-center mr-6">
                <input
                  className="flex-grow bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-sm font-bold text-slate-900 dark:text-zinc-200"
                  value={f.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="特性名称 (例如: 暗流)"
                />
                <select
                  value={f.type}
                  onChange={e => update('type', e.target.value)}
                  className="w-20 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded px-1 py-1 text-xs text-slate-900 dark:text-zinc-200"
                >
                  <option value="动作">动作</option>
                  <option value="反应">反应</option>
                  <option value="被动">被动</option>
                </select>
              </div>
              {/* Fear toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={!!f.isFear}
                    onChange={e => update('isFear', e.target.checked)}
                    className="accent-red-600"
                  />
                  <span className="font-bold text-red-700 dark:text-red-400">恐惧特性</span>
                </label>
                {f.isFear && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500 dark:text-zinc-500">花费</span>
                    <input
                      type="text"
                      value={f.fearCost || '1'}
                      onChange={e => update('fearCost', e.target.value)}
                      className="w-10 bg-white dark:bg-zinc-950 border border-red-300 dark:border-red-800 rounded px-1 py-0.5 text-xs text-center text-red-800 dark:text-red-300 font-bold"
                      placeholder="1"
                    />
                    <span className="text-xs text-slate-500 dark:text-zinc-500">恐惧点</span>
                  </div>
                )}
              </div>
              {/* Description */}
              <RichTextArea
                inline={true}
                minHeight="min-h-[70px]"
                value={f.description}
                onChange={v => update('description', v)}
                placeholder="特性效果描述..."
              />
              {/* Guiding question */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-teal-600 dark:text-teal-500 uppercase tracking-wider">引导问题 (斜体显示)</label>
                <input
                  className="w-full bg-white dark:bg-zinc-950 border border-teal-300 dark:border-teal-800 rounded px-2 py-1 text-xs text-slate-600 dark:text-zinc-400 italic"
                  value={f.guidingQuestion || ''}
                  onChange={e => update('guidingQuestion', e.target.value)}
                  placeholder="此地点曾发生过什么？留下了哪些痕迹？"
                />
              </div>
            </div>
          )}
        />
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
        <h3 className="text-lg font-serif text-blue-800 dark:text-amber-500 mb-1">{TOOL_CONFIG[data.type].label} 编辑器</h3>
        <p className="text-slate-500 dark:text-zinc-500 text-sm">填写下方信息以生成卡牌。</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {data.type === CardType.MATERIAL ? (
           <div className="col-span-2 p-2 bg-slate-100 dark:bg-zinc-800 rounded text-center text-sm text-slate-500 dark:text-zinc-400">
              名称将自动生成: {data.name}
           </div>
        ) : data.type === CardType.MADNESS ? (
           <Input label="症状名称" value={data.name} onChange={v => handleChange('name', v)} full />
        ) : data.type === CardType.PRICELIST ? (
           <Input label="商店名称" value={data.name} onChange={v => handleChange('name', v)} full />
        ) : (
           <Input label="名称" value={data.name} onChange={v => handleChange('name', v)} full />
        )}

        {data.type === CardType.TRANSFORMATION && (
           <TextArea label="风味描述" value={data.description} onChange={v => handleChange('description', v)} placeholder="关于此生物的描述..." />
        )}
        
        {data.type === CardType.ENVIRONMENT ? renderEnvironmentEditor() : renderFields()}
        
        {data.type !== CardType.TRANSFORMATION && data.type !== CardType.MADNESS && data.type !== CardType.CLUE && data.type !== CardType.ENVIRONMENT && (
          <TextArea label="描述/风味文字" value={data.description} onChange={v => handleChange('description', v)} />
        )}

        {data.type === CardType.ENVIRONMENT && (
          <TextArea label="描述/风味文字" value={data.description} onChange={v => handleChange('description', v)} placeholder="一行富有画面感的文字描述此环境..." />
        )}

        <div className="col-span-2 grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <Input label="创作者" value={data.creator} onChange={v => handleChange('creator', v)} />
          <Input label="所属角色" value={data.owner} onChange={v => handleChange('owner', v)} />
        </div>
      </div>
    </div>
  );
};

export default CardEditor;
