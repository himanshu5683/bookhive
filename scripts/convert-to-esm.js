/*
 Auto-convert commonjs -> esm (best-effort)
 - Replaces: const X = require('y')  => import X from 'y'
 - Replaces: const {a,b} = require('y') => import {a,b} from 'y'
 - Replaces: module.exports = ... => export default ...
 - Replaces: exports.foo = ... => export const foo = ...
 Usage: node scripts/convert-to-esm.js <dir>
*/
import fs from 'fs';
import path from 'path';

const dir = process.argv[2] || '.';
const exts = ['.js'];

function walk(d) {
  const entries = fs.readdirSync(d, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) {
      // skip node_modules and .git
      if (['node_modules', '.git', 'dist', 'build'].includes(e.name)) continue;
      walk(full);
    } else {
      if (!exts.includes(path.extname(e.name))) continue;
      try {
        let src = fs.readFileSync(full, 'utf8');
        const orig = src;

        // skip files that already use import/export (basic check)
        if (/^\s*import\s+/m.test(src) || /^\s*export\s+/m.test(src)) {
          // but still try to fix module.exports -> export default (if mixed)
        }

        // 1) const { a, b } = require('pkg');
        src = src.replace(/const\s*\{\s*([^}]+?)\s*\}\s*=\s*require\((['"])([^'"]+)\2\)\s*;?/g,
          (m, names, q, pkg) => `import { ${names.trim()} } from '${pkg}';`);

        // 2) const X = require('pkg');
        // avoid replacing require(...) used as expressions (best-effort)
        src = src.replace(/const\s+([A-Za-z0-9_$]+)\s*=\s*require\((['"])([^'"]+)\2\)\s*;?/g,
          (m, id, q, pkg) => `import ${id} from '${pkg}';`);

        // 3) var/let require -> import
        src = src.replace(/(?:var|let)\s+([A-Za-z0-9_$]+)\s*=\s*require\((['"])([^'"]+)\2\)\s*;?/g,
          (m, id, q, pkg) => `import ${id} from '${pkg}';`);

        // 4) module.exports = ...
        src = src.replace(/module\.exports\s*=\s*/g, 'export default ');

        // 5) exports.foo = ...
        src = src.replace(/exports\.([A-Za-z0-9_$]+)\s*=\s*/g, 'export const $1 = ');

        // 6) convert require('pkg').something (best-effort leave unchanged)
        // skip deeper transformations to avoid unsafe edits

        if (src !== orig) {
          fs.writeFileSync(full, src, 'utf8');
          console.log('Updated:', full);
        }
      } catch (err) {
        console.error('Error processing', full, err.message);
      }
    }
  }
}

walk(path.resolve(dir));
console.log('Conversion complete. Please review changes and run tests.');