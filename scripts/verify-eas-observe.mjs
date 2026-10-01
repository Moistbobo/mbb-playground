import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const result = (ok, detail) => ({ ok, detail });
const read = (rel) => readFileSync(path.join(root, rel), 'utf8');

function callBodies(source, callee) {
  const bodies = [];
  let from = 0;
  while (true) {
    const start = source.indexOf(`${callee}(`, from);
    if (start === -1) break;
    let depth = 0;
    let end = -1;
    for (let i = start + callee.length; i < source.length; i++) {
      if (source[i] === '(') depth++;
      else if (source[i] === ')' && --depth === 0) {
        end = i;
        break;
      }
    }
    if (end === -1) break;
    bodies.push(source.slice(start + callee.length + 1, end));
    from = end + 1;
  }
  return bodies;
}

function checkDependency(pkgText) {
  const dependencies = JSON.parse(pkgText).dependencies ?? {};
  const version = dependencies['expo-observe'];
  return result(Boolean(version), version ? `expo-observe@${version}` : 'expo-observe missing from dependencies');
}

function checkLayout(source) {
  const imported = source.match(/import\s*\{([^}]*)\}\s*from\s*['"]expo-observe['"]/);
  const named = imported ? imported[1] : '';
  const importOk = /\bObserve\b/.test(named) && /\bObserveRoot\b/.test(named);
  const configureOk = callBodies(source, 'Observe.configure').some((body) =>
    /integrations\s*:\s*\{[^}]*['"]expo-router['"]\s*:\s*true/.test(body),
  );
  const wrapOk = /export\s+default\s+ObserveRoot\.wrap\s*\(/.test(source);
  const problems = [];
  if (!importOk) problems.push('missing { Observe, ObserveRoot } import from expo-observe');
  if (!configureOk) problems.push("Observe.configure does not enable integrations['expo-router'] === true");
  if (!wrapOk) problems.push('missing default export of ObserveRoot.wrap(...)');
  return result(problems.length === 0, problems.length ? problems.join('; ') : 'import, configure, wrap present');
}

function checkScreen(name, source) {
  const imported = source.match(/import\s*\{([^}]*)\}\s*from\s*['"]expo-observe['"]/);
  const importOk = Boolean(imported) && /\buseObserve\b/.test(imported[1]);
  const hookOk = /const\s*\{[^}]*\bmarkInteractive\b[^}]*\}\s*=\s*useObserve\s*\(/.test(source);
  const effectOk = callBodies(source, 'useEffect').some((body) => /markInteractive\s*\(\s*\)/.test(body));
  const problems = [];
  if (!importOk) problems.push('missing useObserve import from expo-observe');
  if (!hookOk) problems.push('markInteractive is not destructured from useObserve()');
  if (!effectOk) problems.push('markInteractive() is not called inside useEffect');
  return result(problems.length === 0, problems.length ? `${name}: ${problems.join('; ')}` : `${name}: useObserve + markInteractive in useEffect`);
}

function checkScreens() {
  const names = ['src/app/index.tsx', 'src/app/explore.tsx'];
  const outcomes = names.map((name) => checkScreen(name, read(name)));
  const failed = outcomes.filter((outcome) => !outcome.ok);
  return result(failed.length === 0, failed.length ? failed.map((outcome) => outcome.detail).join('; ') : 'both screens wired');
}

function checkUploadSourceMaps(easText) {
  const value = JSON.parse(easText).build?.production?.uploadSourceMaps;
  return result(value === true, `build.production.uploadSourceMaps = ${JSON.stringify(value)}`);
}

function checkAutolinkingPlatform(platform) {
  const bin = path.join(root, 'node_modules/.bin/expo-modules-autolinking');
  if (!existsSync(bin)) return result(false, 'expo-modules-autolinking binary not found');
  const proc = spawnSync(bin, ['resolve', '--platform', platform, '--json', '--project-root', root], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (proc.error) return result(false, `spawn failed: ${proc.error.message}`);
  if (proc.status !== 0) {
    const stderr = proc.stderr.trim().split('\n').filter(Boolean).pop() ?? '';
    return result(false, `resolve exited ${proc.status}${stderr ? `: ${stderr}` : ''}`);
  }
  let resolved;
  try {
    resolved = JSON.parse(proc.stdout);
  } catch {
    return result(false, 'resolve output was not JSON');
  }
  const modules = resolved.modules ?? [];
  const found = modules.some((module) => module.packageName === 'expo-observe');
  return result(found, found ? `expo-observe linked among ${modules.length} modules` : `expo-observe absent among ${modules.length} modules`);
}

function checkAutolinking() {
  const outcomes = ['ios', 'android'].map((platform) => [platform, checkAutolinkingPlatform(platform)]);
  const failed = outcomes.filter(([, outcome]) => !outcome.ok);
  return result(
    failed.length === 0,
    failed.length
      ? failed.map(([platform, outcome]) => `${platform}: ${outcome.detail}`).join('; ')
      : outcomes.map(([platform, outcome]) => `${platform}: ${outcome.detail}`).join('; '),
  );
}

const checks = [
  ['package.json declares expo-observe', () => checkDependency(read('package.json'))],
  ['src/app/_layout.tsx configures Observe and wraps ObserveRoot', () => checkLayout(read('src/app/_layout.tsx'))],
  ['screens call useObserve + markInteractive in useEffect', checkScreens],
  ['eas.json production uploads source maps', () => checkUploadSourceMaps(read('eas.json'))],
  ['autolinking resolves expo-observe for ios and android', checkAutolinking],
];

let failed = 0;
for (const [name, run] of checks) {
  let outcome;
  try {
    outcome = run();
  } catch (error) {
    outcome = result(false, error.message);
  }
  if (!outcome.ok) failed++;
  console.log(`${outcome.ok ? 'PASS' : 'FAIL'}  ${name} (${outcome.detail})`);
}

console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);
