import * as Font from "expo-font";

// Configuration des polices personnalisées
export const customFonts = {
  // Polices Urbanist
  Urbanist: require("../assets/fonts/Urbanist-Regular.ttf"),
  "Urbanist-Bold": require("../assets/fonts/Urbanist-Bold.ttf"),
  "Urbanist-Medium": require("../assets/fonts/Urbanist-Medium.ttf"),
  "Urbanist-Light": require("../assets/fonts/Urbanist-Light.ttf"),

  // Polices Blocklyn
  "Blocklyn-Grunge": require("../assets/fonts/Blocklyn-Grunge.otf"),
  "Blocklyn-Condensed": require("../assets/fonts/Blocklyn-Condensed.otf"),

  // Polices Sofia Pro (ajoutées)
  "SofiaPro-Regular": require("../assets/fonts/SofiaProRegular.ttf"),
  "SofiaPro-Bold": require("../assets/fonts/SofiaProBold.ttf"),
  "SofiaPro-Medium": require("../assets/fonts/SofiaProMedium.ttf"),
  "SofiaPro-Light": require("../assets/fonts/SofiaProLight.ttf"),
  "SofiaPro-SemiBold": require("../assets/fonts/SofiaProSemiBold.ttf"),
  "SofiaPro-Black": require("../assets/fonts/SofiaProBlack.ttf"),
};

// Fonction pour charger les polices de façon asynchrone
export const loadFonts = async () => {
  await Font.loadAsync(customFonts);
};
