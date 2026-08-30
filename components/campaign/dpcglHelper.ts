import { DPCGLLogoType, DPCGLTemplateType, LogoPosition, LogoSize } from './types';

export interface DPCGLLogoOption {
  id: DPCGLLogoType;
  name: string;
  category: 'daggerheart' | 'compatible' | 'candela' | 'custom' | 'none';
  previewUrl: string;
  description: string;
  recommendedTheme?: 'dark' | 'light' | 'all';
}

export const DPCGL_LOGOS: DPCGLLogoOption[] = [
  {
    id: 'none',
    name: '不使用徽标',
    category: 'none',
    previewUrl: '',
    description: '非商业分享时可不使用徽标',
    recommendedTheme: 'all',
  },
  {
    id: 'dh_bottle_color',
    name: 'Daggerheart 全彩药瓶徽标',
    category: 'daggerheart',
    previewUrl: './logos/DH_CGL_logos_final_full_color.png',
    description: '官方推荐封面主徽标（带炼金药瓶，黑字全彩）',
    recommendedTheme: 'light',
  },
  {
    id: 'dh_bottle_white_color',
    name: 'Daggerheart 白字全彩药瓶徽标',
    category: 'daggerheart',
    previewUrl: './logos/DH_CGL_logos_final_white_full_color.png',
    description: '官方推荐封面主徽标（带炼金药瓶，白字全彩，适合深色背景）',
    recommendedTheme: 'dark',
  },
  {
    id: 'dh_bottle_white',
    name: 'Daggerheart 单色纯白药瓶',
    category: 'daggerheart',
    previewUrl: './logos/DH_CGL_logos_final_white.png',
    description: '简约单色反白设计，适合暗黑、奇幻与极简封面',
    recommendedTheme: 'dark',
  },
  {
    id: 'dh_bottle_black',
    name: 'Daggerheart 单色纯黑药瓶',
    category: 'daggerheart',
    previewUrl: './logos/DH_CGL_logos_final_black.png',
    description: '简约单色黑色设计，适合浅色封面或纯白打印页',
    recommendedTheme: 'light',
  },
  {
    id: 'dh_compatible_color',
    name: 'Compatible with DH (全彩徽章)',
    category: 'compatible',
    previewUrl: './logos/compatible_with_DH_logos-06.png',
    description: '横版 Compatible 兼容标志（全彩），适合页眉角标',
    recommendedTheme: 'light',
  },
  {
    id: 'dh_compatible_white',
    name: 'Compatible with DH (白色徽章)',
    category: 'compatible',
    previewUrl: './logos/compatible_with_DH_logos-07.png',
    description: '横版 Compatible 兼容标志（白色），适合深色背景角标',
    recommendedTheme: 'dark',
  },
  {
    id: 'dh_compatible_badge',
    name: 'Compatible with DH (黑金徽章)',
    category: 'compatible',
    previewUrl: './logos/compatible_with_DH_logos-08.png',
    description: '高级黑金色调兼容印章，适合典雅/哥特风格',
    recommendedTheme: 'all',
  },
  {
    id: 'candela_gold',
    name: 'Candela Obscura 社区徽标 (金黑)',
    category: 'candela',
    previewUrl: './logos/darrington_CC_logo_gold.png',
    description: '适用 CO 规则系统作品的官方黑金社区徽标',
    recommendedTheme: 'all',
  },
  {
    id: 'candela_white',
    name: 'Candela Obscura 社区徽标 (纯白)',
    category: 'candela',
    previewUrl: './logos/darrington_CC_logo_white.png',
    description: '适用 CO 规则系统作品的官方纯白社区徽标',
    recommendedTheme: 'dark',
  },
  {
    id: 'candela_black',
    name: 'Candela Obscura 社区徽标 (纯黑)',
    category: 'candela',
    previewUrl: './logos/darrington_CC_logo_black.png',
    description: '适用 CO 规则系统作品的官方纯黑社区徽标',
    recommendedTheme: 'light',
  },
];

export const DPCGL_TEMPLATES: {
  id: DPCGLTemplateType;
  title: string;
  badge: string;
  desc: string;
  generateText: (info: { workTitle: string; authorName: string; year: string; hasMod: boolean; modNote?: string; customNotice?: string }) => string;
}[] = [
  {
    id: 'dh_bilingual',
    title: '中英双语合规标准版 (推荐)',
    badge: '推荐',
    desc: '包含英文法定声明（原版法律效力）及中文参考译文，并附带作者原创权利说明',
    generateText: ({ workTitle, authorName, year, hasMod, modNote, customNotice }) => {
      const modStatement = hasMod 
        ? (modNote?.trim() ? `Modifications: ${modNote.trim()}` : `Modifications: Minor rules adaptations and custom stat blocks designed for this campaign.`)
        : `There are no previous modifications by others.`;
      
      const modStatementCn = hasMod
        ? (modNote?.trim() ? `修改说明：${modNote.trim()}` : `修改说明：为适配本战役框架对部分机制及属性栏进行了定制调整。`)
        : `此前无他人对此进行修改。`;

      return `### 版权与许可声明 / Copyright & Attribution Notice

**【英文法定声明 / Legal Notice】**
This product includes materials from the Daggerheart System Reference Document 2.0, © Critical Role, LLC. under the terms of the Darrington Press Community Gaming (DPCGL) License. More information can be found at https://www.daggerheart.com. ${modStatement}

Darrington Press™ and the Darrington Press authorized work logo are trademarks of Critical Role, LLC and used with permission.

**【中文对照参考 / Chinese Translation for Reference】**
本作品《${workTitle || '【作品名称】'}》包含来自《Daggerheart 系统参考文档 2.0》（Daggerheart System Reference Document 2.0）的材料，© Critical Role, LLC，根据 Darrington Press 社区游戏许可协议（DPCGL）获得许可使用。更多信息请访问 https://www.daggerheart.com 。${modStatementCn}

Darrington Press™ 及 Darrington Press 授权作品徽标系 Critical Role, LLC 的商标，经许可使用。

**【原创内容版权 / Creator Original Rights】**
《${workTitle || '【作品名称】'}》 © ${year || '2026'} ${authorName || '【作者/团队名】'}。${customNotice || '本战役框架为基于 DPCGL 协议创作的独立社区内容。除来自 DRP 公共游戏内容（DHSRD 2.0）的部分外，本作品中的原创剧情、世界观设定、NPC角色、任务及视觉元素版权均归作者所有。'}`;
    }
  },
  {
    id: 'dh_2_0',
    title: 'Daggerheart 2.0 官方标准英文版',
    badge: 'DPCGL 2.0',
    desc: '严格依据 DPCGL 2.0 第 4.1 a-e / 4.3 节合并样板生成的英文法律声明',
    generateText: ({ workTitle, authorName, year, hasMod, modNote }) => {
      const modStatement = hasMod 
        ? (modNote?.trim() ? `Modifications: ${modNote.trim()}` : `Modifications: Custom mechanics and campaign frames modifications.`)
        : `There are no previous modifications by others.`;

      return `### Copyright & Attribution Notice

**【Legal Statement】**
This product includes materials from the Daggerheart System Reference Document 2.0, © Critical Role, LLC. under the terms of the Darrington Press Community Gaming (DPCGL) License. More information can be found at https://www.daggerheart.com. ${modStatement}

**【Trademark Notice】**
Darrington Press™ and the Darrington Press authorized work logo are trademarks of Critical Role, LLC and used with permission.

**【Creator Rights】**
"${workTitle || 'This work'}" is copyright © ${year || '2026'} by ${authorName || 'the author'}. All rights reserved.`;
    }
  },
  {
    id: 'commercial',
    title: '商业出版与售卖完整声明版',
    badge: '商业出版',
    desc: '符合 DPCGL 4.2 节商业用途完整要求（含封面徽标授权、商标声明与独立创作免责）',
    generateText: ({ workTitle, authorName, year, hasMod, modNote, customNotice }) => {
      const modStatement = hasMod 
        ? (modNote?.trim() ? `Modifications made: ${modNote.trim()}` : `Modifications made: Adapted for specific campaign narrative and custom encounters.`)
        : `There are no previous modifications by others.`;

      return `### 商业出版与版权合规声明 / Commercial Publication Notice

**【1. DPCGL License & System Reference Attribution】**
This product includes materials from the Daggerheart System Reference Document 2.0, © Critical Role, LLC. under the terms of the Darrington Press Community Gaming (DPCGL) License. More information can be found at https://www.daggerheart.com. ${modStatement}

**【2. Trademark & Authorization】**
Darrington Press™ and the Darrington Press authorized work logo are trademarks of Critical Role, LLC and used with permission.

**【3. Compatibility & Non-Endorsement】**
"${workTitle || '【作品名称】'}" is an independent commercial supplement Compatible with Daggerheart. This work is not affiliated with, sponsored by, or endorsed by Darrington Press, LLC or Critical Role, LLC.

**【4. Creator Copyright】**
"${workTitle || '【作品名称】'}" © ${year || '2026'} ${authorName || '【作者名称】'}. ${customNotice || 'All original storyline, characters, lore, encounters, maps, and artwork are the intellectual property of the author.'}`;
    }
  },
  {
    id: 'dh_1_0',
    title: 'Daggerheart 1.0 兼容声明版',
    badge: 'DPCGL 1.0',
    desc: '适用于基于 DHSRD 1.0 原版规范创作的战役框架或既有模组',
    generateText: ({ workTitle, authorName, year, hasMod, modNote }) => {
      const modStatement = hasMod 
        ? (modNote?.trim() ? `Modifications: ${modNote.trim()}` : `Modifications: Custom adjustments made for this campaign.`)
        : `There are no previous modifications by others.`;

      return `### Copyright & Attribution Notice (DH 1.0)

**【Legal Statement】**
This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC. under the terms of the Darrington Press Community Gaming (DPCGL) License. More information can be found at https://www.daggerheart.com. ${modStatement}

**【Trademark Notice】**
Darrington Press™ and the Darrington Press authorized work logo are trademarks of Critical Role, LLC and used with permission.

**【Creator Rights】**
"${workTitle || 'This work'}" © ${year || '2025'} by ${authorName || 'the author'}.`;
    }
  },
  {
    id: 'candela',
    title: 'Candela Obscura 官方标准声明',
    badge: 'CO 规则',
    desc: '针对使用 Candela Obscura 调查类规则系统创作的战役框架与剧本',
    generateText: ({ workTitle, authorName, year, hasMod, modNote }) => {
      const modStatement = hasMod 
        ? (modNote?.trim() ? `Modifications: ${modNote.trim()}` : `Modifications: Custom assignments and circles created for this campaign.`)
        : `There are no previous modifications by others.`;

      return `### Candela Obscura Community License Notice

**【Legal Statement】**
This product includes materials from Candela Obscura, © Critical Role, LLC. under the terms of the Darrington Press Community Gaming (DPCGL) License. More information can be found at https://www.darringtonpress.com. ${modStatement}

**【Trademark Notice】**
Darrington Press™ and the Darrington Press authorized work logo are trademarks of Critical Role, LLC and used with permission.

**【Creator Rights】**
"${workTitle || 'This work'}" © ${year || '2026'} by ${authorName || 'the author'}.`;
    }
  },
  {
    id: 'non_commercial',
    title: '个人非商业分享简明版',
    badge: '免费分享',
    desc: '适用于跑团战报记录、同人社群免费模组分享的精简合规声明',
    generateText: ({ workTitle, authorName, year }) => {
      return `### 社区非商业分享声明

本作品《${workTitle || '【作品名称】'}》系依据 Darrington Press 社区游戏许可协议（DPCGL）创作的免费非商业战役框架。

**【License Attribution】**
This product includes materials from the Daggerheart System Reference Document 2.0, © Critical Role, LLC. under the terms of the Darrington Press Community Gaming (DPCGL) License. More information can be found at https://www.daggerheart.com.

**【原创版权】**
原创剧本内容 © ${year || '2026'} ${authorName || '作者'}。仅供爱好者交流游玩，请勿用于商业盈利用途。`;
    }
  },
  {
    id: 'custom',
    title: '完全自定义声明',
    badge: '自由定制',
    desc: '手动编写符合您发布平台和个性化需求的版权声明',
    generateText: () => '',
  }
];

export function getLogoUrl(logoType?: DPCGLLogoType, customUrl?: string): string {
  if (!logoType || logoType === 'none') return '';
  if (logoType === 'custom') return customUrl || '';
  const item = DPCGL_LOGOS.find(l => l.id === logoType);
  if (!item || !item.previewUrl) return '';
  const bp = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_PATH) || '';
  const cleanUrl = item.previewUrl.replace(/^\.?\//, '');
  return `${bp}/${cleanUrl}`;
}

export function getPositionClass(position?: LogoPosition): string {
  switch (position) {
    case 'top-left':
      return 'top-6 left-6';
    case 'center-top':
      return 'top-6 left-1/2 -translate-x-1/2';
    case 'bottom-left':
      return 'bottom-6 left-6';
    case 'bottom-right':
      return 'bottom-6 right-6';
    case 'center-bottom':
      return 'bottom-6 left-1/2 -translate-x-1/2';
    case 'top-right':
    default:
      return 'top-6 right-6';
  }
}

export function getSizeClass(size?: LogoSize): { width: string; height: string; styleWidth: number } {
  switch (size) {
    case 'sm':
      return { width: 'w-16 sm:w-20', height: 'h-auto', styleWidth: 70 };
    case 'lg':
      return { width: 'w-28 sm:w-36', height: 'h-auto', styleWidth: 140 };
    case 'md':
    default:
      return { width: 'w-20 sm:w-24', height: 'h-auto', styleWidth: 95 };
  }
}
