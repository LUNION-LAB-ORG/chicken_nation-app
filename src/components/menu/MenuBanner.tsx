import React from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  useWindowDimensions,
} from "react-native";

/**
 * Bannière promotionnelle pour l'écran du menu
 * Affiche une offre de réduction avec une image et du texte
 */
const MenuBanner: React.FC = () => {
  // Obtenir les dimensions de l'écran pour le responsive
  const { width: screenWidth } = useWindowDimensions();

  // Calcul dynamique des dimensions basé sur la largeur de l'écran
  const bannerHeight = screenWidth * 0.42; // Hauteur proportionnelle à la largeur
  const burgerWidth = screenWidth * 0.45; // ~45% de la largeur de l'écran
  const burgerHeight = burgerWidth * 1.16; // Maintenir le ratio hauteur/largeur

  // Tailles de texte responsives
  const percentFontSize = screenWidth * 0.17;
  const mainTextSize = screenWidth * 0.038;
  const smallTextSize = screenWidth * 0.028;

  return (
    <ImageBackground
      source={require("../../assets/images/offer-banner.png")}
      className="w-full rounded-3xl overflow-hidden flex-row items-center justify-between"
      style={{ height: bannerHeight }}
      accessibilityLabel="Bannière promotionnelle"
    >
      {/* Contenu texte */}
      <View className="w-1/2 pl-9">
        <Text
          className="text-white font-blocklyn-grunge leading-none pt-5"
          style={{ fontSize: percentFontSize }}
          accessibilityLabel="30 pourcent"
        >
          30%
        </Text>
        <Text
          className="text-white font-blocklyn-grunge -mt-1 leading-tight"
          style={{ fontSize: mainTextSize }}
          accessibilityLabel="De réduction de plus de trois commandes"
        >
          DE RÉDUCTION DE PLUS {`\n`}DE TROIS COMMANDES
        </Text>
        <Text
          className="text-white font-sofia-regular leading-tight"
          style={{ fontSize: smallTextSize }}
        >
          Seulement sur l'appli {`\n`}valable jusqu'au 28 février
        </Text>
      </View>

    
      <View className="w-1/2 h-full relative">
        <Image
          source={require("../../assets/images/burgerbanner.png")}
          resizeMode="contain"
          style={{
            position: "absolute",
            width: burgerWidth,
            height: burgerHeight,
            right: -5, 
            bottom: -35,  
          }}
          accessibilityLabel="Image d'un burger"
        />
      </View>
    </ImageBackground>
  );
};

export default MenuBanner;
