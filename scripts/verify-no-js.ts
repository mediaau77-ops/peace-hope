import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TARGET_DIRS = ['app', 'components', 'hooks', 'lib', 'server', 'shared'];
const forbiddenExtensions = ['.js', '.jsx', '.mjs', '.cjs'];
const violations: string[] = [];

function walk(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.next') {
        continue;
      }
      walk(fullPath);
      continue;
    }

    const lower = entry.name.toLowerCase();
    if (forbiddenExtensions.some((extension) => lower.endsWith(extension))) {
      violations.push(fullPath);
    }
  }
}

for (const dir of TARGET_DIRS) {
  try {
    if (statSync(dir, { throwIfNoEntry: false }) !== undefined) {
      walk(dir);
    }
  } catch {
    // Ignore missing directories as some repos don't include all targets.
  }
}

if (violations.length > 0) {
  console.error('Disallowed JavaScript files found in application code:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('No disallowed JavaScript files found in application code.');
