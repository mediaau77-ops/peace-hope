import { readdirSync } from 'node:fs';
import path from 'node:path';

const targets = [
  'frontend/app',
  'frontend/components',
  'frontend/hooks',
  'frontend/lib',
];

let found = false;

for (const target of targets) {
  const dir = path.resolve(process.cwd(), target);
  try {
    const walk = (current) => {
      const entries = readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
          console.error(`JavaScript file found in frontend app code: ${path.relative(process.cwd(), full)}`);
          found = true;
        }
      }
    };
    walk(dir);
  } catch {
    // directory may not exist yet, which is fine for scaffolding
  }
}

if (found) {
  process.exit(1);
}

console.log('Frontend TypeScript verification passed. No .js/.jsx files found in app code directories.');
