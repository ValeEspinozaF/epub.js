#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Generates examples/_books/manifest.json describing files and directories.
const booksDir = path.join(__dirname, '..', 'examples', '_books');
const outFile = path.join(booksDir, 'manifest.json');

function scanDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];
  for (const it of items) {
    if (it.isFile() && /\.(epub|opf)$/i.test(it.name)) {
      result.push({ type: 'file', name: it.name, path: path.posix.join('_books', path.relative(booksDir, path.join(dir, it.name)).replace(/\\/g, '/')) });
    }
    if (it.isDirectory()) {
      const subdir = path.join(dir, it.name);
      const files = fs.readdirSync(subdir, { withFileTypes: true })
        .filter(f => f.isFile() && /\.(epub|opf)$/i.test(f.name))
        .map(f => ({ name: f.name, path: path.posix.join('_books', it.name, f.name) }));
      result.push({ type: 'dir', name: it.name, path: path.posix.join('_books', it.name), files });
    }
  }
  return result;
}

function main() {
  if (!fs.existsSync(booksDir)) {
    console.error('Books directory not found:', booksDir);
    process.exit(1);
  }

  const manifest = scanDir(booksDir);
  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Wrote', outFile);
}

main();
