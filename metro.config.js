const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

const rootOrigin = path.join(__dirname, 'package.json');
const expoOrigin = path.join(fs.realpathSync(path.join(__dirname, 'node_modules', 'expo')), 'package.json');
const upstreamResolveRequest = config.resolver.resolveRequest;

function isPinned(moduleName, name) {
  return moduleName === name || moduleName.startsWith(`${name}/`);
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstreamResolveRequest ?? context.resolveRequest;
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
