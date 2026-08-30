import { ProjectData, DynamicSection, ContentBlock } from '../types';

/**
 * Clean long Base64 payload into clean semantic tag for human readability
 */
function cleanImageUrl(url: string | undefined, tag: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.length > 250) {
    return `[${tag}]`;
  }
  return url;
}

/**
 * Serialize a full ProjectData object into clean, human-readable Homebrewery V3 Markdown
 */
export function serializeProjectDataToV3Markdown(project: ProjectData): string {
  if (!project) return '';

  const chunks: string[] = [];

  // 1. Cover Page
  if (project.coverPage?.enabled) {
    const coverImgTag = project.coverPage.coverImage
      ? `\n![封面插画](${cleanImageUrl(project.coverPage.coverImage, '战役封面')}){position:cover}\n`
      : '';

    chunks.push(`{{frontCover}}
# ${project.coverPage.title || project.title || '战役名称'}
## ${project.coverPage.subtitle || '战役副标题与简介'}

**作者：** ${project.coverPage.authorLine || project.author || '匿名'}
${project.coverPage.footerText ? `*${project.coverPage.footerText}*` : ''}
${coverImgTag}\\page
`);
  }

  // 2. Overview / Concept
  const showIntro = project.settings?.showConcept || project.settings?.showIntroduction || project.settings?.showToneThemes;
  if (showIntro) {
    chunks.push(`{{Intro}}
# ${project.title || '战役概述'}

${project.concept ? `**核心概念：** ${project.concept}\n` : ''}
${project.settings?.showComplexity ? `**复杂度评级：** ${'⏺ '.repeat(project.complexity || 3)} (${project.complexity || 3}/5)\n` : ''}
${project.levelRange ? `**适用等级：** ${project.levelRange}\n` : ''}
${project.tone || project.themes ? `**基调与主题：** ${project.tone || ''} ${project.themes ? `· ${project.themes}` : ''}\n` : ''}
${project.inspiration ? `**参考灵感：** ${project.inspiration}\n` : ''}

${project.introduction ? `### 简介与导言\n${project.introduction}\n` : ''}
${project.summary ? `### 模组概要\n${project.summary}\n` : ''}
${project.prologue ? `### 序章开场白\n${project.prologue}\n` : ''}
\\page
`);
  }

  // 3. Dynamic Sections
  if (project.sections && project.sections.length > 0) {
    project.sections.forEach((sec, sIdx) => {
      const headingPrefix = '#'.repeat(Math.min(5, Math.max(1, sec.level || 1)));
      const chTab = sIdx < 5 ? `{{Ch${sIdx + 1},tab}}\n` : '';
      let secText = `${chTab}${headingPrefix} ${sec.title || '未命名小节'}\n`;

      if (sec.italicNote) {
        secText += `*${sec.italicNote}*\n\n`;
      }

      sec.blocks?.forEach((block) => {
        secText += serializeBlockToMarkdown(block) + '\n\n';
      });

      chunks.push(secText.trim());
    });
  }

  // 4. Credits Page
  if (project.creditsPage?.enabled) {
    chunks.push(`\\page\n{{CreditsPage}}
# 鸣谢与版权声明 (Credits & Legal)

${project.creditsPage.creditsText || '感谢所有参与本战役模组测试与创作的玩家。'}

${project.creditsPage.copyright?.hasModifications ? `\n> **规则调整说明：** ${project.creditsPage.copyright.modificationsNote || '包含了针对本战役的定制规则适配。'}\n` : ''}
${project.creditsPage.footerText ? `\n*${project.creditsPage.footerText}*` : ''}
`);
  }

  return chunks.join('\n\n\\page\n\n');
}

/**
 * Serialize a single ContentBlock into standard Markdown / HB V3 syntax
 */
function serializeBlockToMarkdown(block: ContentBlock): string {
  switch (block.type) {
    case 'text':
      return block.content || '';

    case 'subsection':
      return `### ${block.title}`;

    case 'divider':
      return `---`;

    case 'image': {
      const imgRef = cleanImageUrl(block.url, `插画:${block.id}`);
      return `![${block.caption || '插画'}](${imgRef})`;
    }

    case 'read_aloud':
      return `> ${block.content}`;

    case 'callout':
      return `{{note\n##### ${block.title || 'GM 备忘'}\n${block.content || ''}\n}}`;

    case 'table': {
      const headers = block.headers || [];
      const rows = block.rows || [];
      if (headers.length === 0 && rows.length === 0) return '';

      let md = `{{DHTable\n| ${headers.join(' | ')} |\n| ${headers.map(() => ':---').join(' | ')} |\n`;
      rows.forEach(r => {
        md += `| ${r.join(' | ')} |\n`;
      });
      md += `}}`;
      return md;
    }

    case 'enemy': {
      let traitsText = '';
      if (block.traits && block.traits.length > 0) {
        traitsText = '\n#### 特性与能力\n' + block.traits.map(t => 
          `**${t.name} - ${t.type.toUpperCase()}** ${t.description}`
        ).join('\n');
      }

      const avatarShape = block.avatarShape || 'circle';
      const cleanAvatar = cleanImageUrl(block.avatarUrl, `头像:${block.id}`);

      return `{{adversary\n## ${block.name}\n### Tier ${block.tier} ${block.enemyType || ''}\n` +
        (cleanAvatar ? `avatar: ${cleanAvatar} (${avatarShape})\n` : '') +
        (block.healthDisplay ? `healthDisplay: ${block.healthDisplay}\n` : '') +
        (block.flavor ? `*${block.flavor}*\n` : '') +
        `**动机与战术：** ${block.tactics || '无'}\n\n` +
        `{{descriptive\n` +
        `**Difficulty:** ${block.stats?.difficulty || 12} | **Thresholds:** ${block.stats?.thresholdMinor || 10}/${block.stats?.thresholdMajor || 20} | **HP:** ${block.stats?.hp || 5} | **Stress:** ${block.stats?.stress || 4}\n` +
        `**ATK:** ${block.attack?.modifier || '+2'} | **${block.attack?.name || '攻击'}:** ${block.attack?.range || '近战'} (${block.attack?.damageType || 'physical'}) | ${block.attack?.damage || '1d8+2'}\n` +
        `___\n**Experience:** ${block.experiences || '无'}\n}}\n` +
        traitsText +
        `\n}}`;
    }

    case 'outcome': {
      const entries = block.entries || [];
      if (entries.length === 0) return '';
      return `{{outcome\n` + entries.map(e => `[${(e.tags || ['success']).join(',')}] ${e.content}`).join('\n') + `\n}}`;
    }

    case 'environment': {
      return `{{environment\n## ${block.name}\n### Tier ${block.tier} ${block.envType || ''}\n` +
        (block.countdown ? `countdown: ${block.countdown}\n` : '') +
        (block.description ? `*${block.description}*\n` : '') +
        `**潜在威胁：** ${block.trend || '无'}\n\n` +
        `{{descriptive\n**Difficulty:** ${block.difficulty || 12} | **潜在敌人:** ${block.potentialEnemies || '无'}\n}}\n` +
        (block.features?.map(f => `**${f.name}:** ${f.description}`).join('\n') || '') +
        `\n}}`;
    }

    case 'cyberware': {
      return `{{cyberware\nname: ${block.name}\ntier: ${block.tier} | type: ${block.cyberType} | zone: ${block.zone} | slots: ${block.slots}\n` +
        `restriction: ${block.restriction || '无'}\n` +
        `compCost: ${block.compCost} | surgCost: ${block.surgCost}\n` +
        (block.tag ? `tag: ${block.tag}\n` : '') +
        `effect: ${block.effect}\n}}`;
    }

    default:
      return '';
  }
}

/**
 * Scan ProjectData or Markdown to generate standard Table of Contents (TOC) syntax
 */
export function generateTocSnippet(project: ProjectData): string {
  if (!project) return '';

  let toc = `{{toc\n# ${project.title || '战役'} · 目录 (Contents)\n`;
  let pageCounter = 2;

  if (project.concept || project.introduction) {
    toc += `- #### [{{ 战役框架与概述}}{{ ${pageCounter}} }](#s_intro)\n`;
    pageCounter += 2;
  }

  if (project.sections && project.sections.length > 0) {
    project.sections.forEach((sec, idx) => {
      const indent = sec.level > 1 ? '  '.repeat(sec.level - 1) : '';
      const prefix = sec.level === 1 ? '- ####' : sec.level === 2 ? '- #####' : '-';
      toc += `${indent}${prefix} [{{ ${sec.title || `第 ${idx + 1} 节`}}}{{ ${pageCounter}} }](#${sec.id || `s_${idx}`})\n`;
      pageCounter += 2;
    });
  }

  if (project.creditsPage?.enabled || project.settings?.showCopyright) {
    toc += `- #### [{{ 附录：DPCGL 官方版权与致谢}}{{ ${pageCounter}} }](#s_credits)\n`;
  }

  toc += `}}\n`;
  return toc;
}
