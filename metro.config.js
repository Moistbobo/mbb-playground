const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

const SOURCE_CONDITION = 'react-native-fold-detection-source';
const conditionsByPlatform = config.resolver.unstable_conditionsByPlatform ?? {};

config.resolver.unstable_conditionsByPlatform = Object.fromEntries(
  Object.entries(conditionsByPlatform).map(([platform, conditions]) => [
    platform,
    [...conditions, SOURCE_CONDITION],
  ])
);

// The git dependency ships no built lib/, so every bundler (native, web, and the
// static-render server) must load the package from its TypeScript source.
const foldDetectionEntry = path.join(
  path.dirname(require.resolve('@logicwind/react-native-fold-detection/package.json')),
  'src',
  'index.ts'
);

const rootOrigin = path.join(__dirname, 'package.json');
const expoOrigin = path.join(fs.realpathSync(path.join(__dirname, 'node_modules', 'expo')), 'package.json');
const upstreamResolveRequest = config.resolver.resolveRequest;

function isPinned(moduleName, name) {
  return moduleName === name || moduleName.startsWith(`${name}/`);
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstreamResolveRequest ?? context.resolveRequest;
  if (moduleName === '@logicwind/react-native-fold-detection') {
    return resolve({ ...context, originModulePath: rootOrigin }, foldDetectionEntry, platform);
  }
  if (isPinned(moduleName, 'react-native')) {
    return resolve({ ...context, originModulePath: rootOrigin }, moduleName, platform);
  }
  if (isPinned(moduleName, 'expo') || isPinned(moduleName, '@expo/ui')) {
    return resolve({ ...context, originModulePath: rootOrigin }, moduleName, platform);
  }
  if (isPinned(moduleName, 'expo-modules-core')) {
    return resolve({ ...context, originModulePath: expoOrigin }, moduleName, platform);
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
