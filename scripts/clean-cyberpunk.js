const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'components', 'cyberpunk');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 色彩替换
  content = content.replace(/#39FF14/g, '#00FFA3');
  content = content.replace(/#FF1493/g, '#FF007F');
  content = content.replace(/#00CED1/g, '#F5F500');
  content = content.replace(/#9400D3/g, '#6C00FF');
  content = content.replace(/#0F0F23/g, '#0B0320');

  // 修复类型字段
  content = content.replace(/formData\.maxHp/g, '(formData as any).maxHp');
  content = content.replace(/formData\.currentHp/g, '(formData as any).currentHp');
  content = content.replace(/formData\.maxStress/g, '(formData as any).maxStress');
  content = content.replace(/formData\.currentStress/g, '(formData as any).currentStress');
  content = content.replace(/card\.feature/g, '((card as any).feature || card.description || "")');
  content = content.replace(/isLatestAnnouncementRead\(announcements\)/g, 'isLatestAnnouncementRead()');
  content = content.replace(/markLatestAnnouncementRead\(announcements\)/g, 'markLatestAnnouncementRead()');

  fs.writeFileSync(filePath, content, 'utf8');
}

function walk(currDir) {
  const list = fs.readdirSync(currDir);
  for (const item of list) {
    const full = path.join(currDir, item);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      cleanFile(full);
    }
  }
}

walk(dir);
console.log('Cyberpunk components clean & Neon Tunnel update complete.');
