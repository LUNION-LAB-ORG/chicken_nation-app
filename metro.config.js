const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ajouter des configurations supplémentaires pour améliorer la stabilité
config.resetCache = true;
config.maxWorkers = 4;
config.watchFolders = [__dirname];
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];
config.resolver.assetExts = ['png', 'jpg', 'jpeg', 'gif', 'ttf', 'otf'];

// Configuration pour réduire les redémarrages inutiles
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
