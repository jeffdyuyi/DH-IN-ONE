const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'components', 'cyberpunk');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const isModal = filePath.includes('modals');
  const prefix = isModal ? '../../../' : '../../';

  content = content.replace(/from '(?:\.\.\/)+types\/cyberpunk'/g, `from '${prefix}types/cyberpunk'`);
  content = content.replace(/from '(?:\.\.\/)+lib\/cyberpunk\/tier-constants'/g, `from '${prefix}lib/cyberpunk/tier-constants'`);
  content = content.replace(/from '(?:\.\.\/)+lib\/cyberpunk\/workshop-v3-adapter'/g, `from '${prefix}lib/cyberpunk/workshop-v3-adapter'`);
  content = content.replace(/from '(?:\.\.\/)+lib\/vault\/([^']+)'/g, `from '${prefix}lib/vault/$1'`);
  content = content.replace(/from '(?:\.\.\/)+lib\/sheet-data'/g, `from '${prefix}lib/sheet-data'`);
  content = content.replace(/from '(?:\.\.\/)+lib\/default-sheet-data'/g, `from '${prefix}lib/default-sheet-data'`);
  content = content.replace(/from '(?:\.\.\/)+character\/storage\/character-save-storage'/g, `from '${prefix}character/storage/character-save-storage'`);
  content = content.replace(/from '(?:\.\.\/)+lib\/multi-character-storage'/g, `from '${prefix}lib/multi-character-storage'`);
  content = content.replace(/from '(?:\.\.\/)+card\/card-types'/g, `from '${prefix}card/card-types'`);

  fs.writeFileSync(filePath, content, 'utf8');
}

function walk(currDir) {
  const list = fs.readdirSync(currDir);
  for (const item of list) {
    const full = path.join(currDir, item);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      fixFile(full);
    }
  }
}

walk(dir);
console.log('Depth prefix fix complete.');
