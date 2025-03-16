"use client";

import type React from "react";
import { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import CartIndicator from "../ui/CartIndicator";
import useReservationStore from "@/store/reservationStore";
import BottomSheetModal from "@/components/ui/BottomSheetModal";

/**
 * Types d'affichage pour le header
 */
type HeaderDisplayType = "logo" | "table" | "summary" | "back" | "back-with-logo";

/**
 * Interface pour les props du composant DynamicHeader
 */
interface DynamicHeaderProps {
  /** Type d'affichage du header */
  displayType?: HeaderDisplayType;
  /** Titre à afficher (pour les modes 'table', 'summary', 'back') */
  title?: string;
  /** Affiche ou non le panier */
  showCart?: boolean;
  /** Fonction appelée lors du retour arrière (mode 'back' uniquement) */
  onBackPress?: () => void;
  /** Force l'affichage ou le masquage de la barre de progression */
  showProgressBar?: boolean;
  /** Progression en pourcentage (0-100) pour la barre de progression */
  progressPercent?: number;
  /** Indique si le header est utilisé dans un contexte de réservation */
  reservationContext?: boolean;
}

/**
 * En-tête dynamique qui s'adapte au contexte actuel
 * Peut afficher différents types d'en-têtes selon le contexte
 * et montrer une barre de progression pour les processus en cours
 */
const DynamicHeader: React.FC<DynamicHeaderProps> = ({
  displayType = "logo",
  title,
  showCart = true,
  onBackPress,
  showProgressBar,
  progressPercent,
  reservationContext = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  // État pour gérer la visibilité du modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Récupérer l'état de réservation uniquement si nécessaire
  const { isActive, progress: storeProgress } = useReservationStore();

  // Déterminer si la barre de progression doit être affichée
  const shouldShowProgressBar = () => {
    // Si explicitement fourni dans les props, utiliser cette valeur
    if (showProgressBar !== undefined) return showProgressBar;
    // Sinon, n'afficher que si on est dans un contexte de réservation active
    return reservationContext && isActive;
  };

  // Déterminer la valeur de progression à utiliser
  const getProgressValue = () => {
    // Si explicitement fournie dans les props, utiliser cette valeur
    if (progressPercent !== undefined) return progressPercent;
    // Sinon, utiliser la valeur du store
    return storeProgress;
  };

  /**
   * Gère le retour à l'écran précédent
   */
  const handleBack = (): void => {
    if (pathname.includes("specialOfferId")) {
      router.push("/(tabs-user)/special-offers");
      return;
    }
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  /**
   * Gère le clic sur le menu latéral - ouvre le modal
   */
  const handleMenuPress = (): void => {
    setIsModalVisible(true);
  };

  /**
   * Gère le clic sur le logo
   */
  const handleLogoPress = (): void => {
  
  };

  /**
   * Rend le contenu principal du header selon le type d'affichage
   */
  const renderContent = (): JSX.Element => {
    switch (displayType) {
      case "back-with-logo":
        return (
          <View className="px-2 " style={styles.backHeader}>
            <TouchableOpacity className="-ml-4" onPress={handleBack}>
              <Image
                source={require("../../assets/icons/arrow-back.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogoPress}
              style={styles.logoContainer}
            >
              <Image
                source={require("../../assets/icons/long-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {showCart ? (
              <CartIndicator />
            ) : (
              <View style={styles.placeholderIcon} />
            )}
          </View>
        );

      case "back":
        return (
          <View className="px-4" style={styles.backHeader}>
            <TouchableOpacity className="" onPress={handleBack}>
              <Image
                source={require("../../assets/icons/arrow-back.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text className="text-xl font-sofia-medium">
                {title || "Retour"}
              </Text>
            </View>

            {showCart ? (
              <CartIndicator />
            ) : (
              <View style={styles.placeholderIcon} />
            )}
          </View>
        );

      case "table":
        return (
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack}>
              <Image
                source={require("../../assets/icons/arrow-back.png")}
                style={styles.icon}
              />
            </TouchableOpacity>

            <View style={styles.centerContent}>
              <Text style={styles.tableText}>{title}</Text>
            </View>

            {showCart ? (
              <CartIndicator />
            ) : (
              <View style={styles.placeholderIcon} />
            )}
          </View>
        );

      case "summary":
        return (
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack}>
              <Image
                source={require("../../assets/icons/arrow-back.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>

            <View style={styles.centerContent}>
              <Text style={styles.tableText}>Résumé</Text>
            </View>

            {showCart ? (
              <CartIndicator />
            ) : (
              <View style={styles.placeholderIcon} />
            )}
          </View>
        );

      case "logo":
      default:
        return (
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleMenuPress}>
              <Image
                source={require("../../assets/icons/drawer.png")}
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogoPress}
              style={styles.logoContainer}
            >
              <Image
                source={require("../../assets/icons/long-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {showCart ? (
              <CartIndicator />
            ) : (
              <View style={styles.placeholderIcon} />
            )}
          </View>
        );
    }
  };

  return (
    <>
      <View className="gap-3" style={styles.container}>
        {renderContent()}

        {/* Barre de progression conditionnelle */}
        {shouldShowProgressBar() && (
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${getProgressValue()}%` }]}
            />
          </View>
        )}
      </View>

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8, 
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontFamily: "Urbanist-Bold",
    fontSize: 20,
    color: "#333",
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  backIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
  },
  tableText: {
    fontFamily: "Urbanist-Bold",
    fontSize: 18,
    color: "#F17922",
  },
  logo: {
    width: 177,
    height: 24,
  },
  placeholderIcon: {
    width: 24,
    height: 24,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#E0E0E0",
    marginTop: 8,
    borderRadius: 100,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#F17922",
    borderRadius: 2,
  },
});

export default DynamicHeader;
