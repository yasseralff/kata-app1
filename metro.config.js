const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts = defaultConfig.resolver.sourceExts || [];
if (!defaultConfig.resolver.sourceExts.includes("cjs")) {
  defaultConfig.resolver.sourceExts.push("cjs");
}

defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(defaultConfig, { input: "./global.css" });
