import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'backend/src');

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      console.error(`TypeScript file found in backend/src: ${path.relative(process.cwd(), full)}`);
      process.exit(1);
    }
  }
}

try {
  walk(root);
  console.log('Backend JS verification passed. No .ts/.tsx files found under backend/src.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
