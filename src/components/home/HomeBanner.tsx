import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
  Animated,
  Image,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";
import useOrderTypeStore, { OrderType } from "@/store/orderTypeStore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 64) / 3;
const BANNER_HEIGHT = 340;

const HomeBanner = () => {
  const router = useRouter();
  const { user } = useAuth(); 
  const [isCardRevealed, setIsCardRevealed] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  // Animations pour chaque carte
  const card1Animation = useRef(new Animated.Value(0)).current;
  const card2Animation = useRef(new Animated.Value(0)).current;
  const card3Animation = useRef(new Animated.Value(0)).current;

  const [bannerImageSize, setBannerImageSize] = useState({
    width: width,
    height: BANNER_HEIGHT,
  });

  // Fonction pour animer une carte lors d'un toucher
  const animateCard = (cardAnimation, cardIndex) => {
    // Si la carte est déjà active, la désactiver
    if (activeCard === cardIndex) {
      setActiveCard(null);
      Animated.spring(cardAnimation, {
        toValue: 0,
        damping: 12,
        mass: 1,
        stiffness: 100,
        useNativeDriver: true,
      }).start();
      return;
    }

    setActiveCard(cardIndex);

    // Réinitialiser toutes les animations
    Animated.parallel([
      Animated.spring(card1Animation, {
        toValue: cardIndex === 1 ? 1 : 0,
        damping: 12,
        mass: 1,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.spring(card2Animation, {
        toValue: cardIndex === 2 ? 1 : 0,
        damping: 12,
        mass: 1,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.spring(card3Animation, {
        toValue: cardIndex === 3 ? 1 : 0,
        damping: 12,
        mass: 1,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Gère le clic sur une carte avec redirection conditionnelle 
   */
  const handleCardPress = (cardAnimation, cardIndex) => {
    // Déclencher l'animation
    animateCard(cardAnimation, cardIndex);

    // Récupérer les fonctions du store centralisé
    const { setActiveType, resetReservationData } = useOrderTypeStore.getState();

    // Après un court délai pour laisser l'animation se produire
    setTimeout(() => {
      if (!user) {
        // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
        router.push("/(tabs-guest)/login");
      } else {
        // Si l'utilisateur est authentifié, rediriger vers la page correspondante
        switch (cardIndex) {
          case 1: // Livraison
            
            // Définir le type de commande sur DELIVERY
            setActiveType(OrderType.DELIVERY);
            // Réinitialiser les données de réservation
            resetReservationData();
            // Rediriger vers la page de livraison avec un paramètre
            router.push({
              pathname: "/(authenticated-only)/bedelivered",
              params: { type: 'delivery' }
            });
            break;
          case 2: // Emporter
           
            // Définir le type de commande sur PICKUP
            setActiveType(OrderType.PICKUP);
            // Réinitialiser les données de réservation
            resetReservationData();
            // Rediriger vers la page de commande à emporter avec un paramètre
            router.push({
              pathname: "/(authenticated-only)/takeaway",
              params: { type: 'pickup' }
            });
            break;
          case 3: // Réservation
           
            // Définir le type de commande sur TABLE
            setActiveType(OrderType.TABLE);
            // Réinitialiser les données de réservation
            resetReservationData();
            // Rediriger vers la page de réservation avec un paramètre
            router.push({
              pathname: "/(authenticated-only)/reservation",
              params: { type: 'reservation' }
            });
            break;
          default:
            router.push("/(tabs-user)/");
        }
      }
    }, 400);
  };

  //  les transformations d'animation pour chaque carte
  const getCardTransform = (animation: Animated.Value) => {
    return {
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -60],
          }) as unknown as number,
        },
        {
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          }) as unknown as number,
        },
      ] as const,
    };
  };

  // Animation pour le contenu des cartes
  const getContentTransform = (animation) => {
    return {
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -10], 
          }),
        },
      ],
    };
  };

  const cardData = [
    {
      title: "Souhaiterais-tu être livrés ?",
      animation: card1Animation,
      index: 1,
      illustration: require("../../assets/images/takeway.png"),
    },
    {
      title: "Des plats à emporter ?",
      animation: card2Animation,
      index: 2,
      illustration: require("../../assets/images/emporter.png"),
    },
    {
      title: "Veux-tu réserver une table",
      animation: card3Animation,
      index: 3,
      illustration: require("../../assets/images/commandetable.png"),
    },
  ];

 
  const getBlurRadius = (index) => {
    return activeCard === index ? 0 : 15;
  };

  // Composant de masque pour la forme arrondie en bas
  const BannerMask = () => {
    return (
      <Svg height={BANNER_HEIGHT} width={width}>
        <Path
          d={`
            M0,20
            C0,8.954 8.954,0 20,0
            H${width - 20}
            C${width - 8.954},0 ${width},8.954 ${width},20
            V${BANNER_HEIGHT - 40}
            C${width * 0.75},${BANNER_HEIGHT + 20} ${width * 0.24},${BANNER_HEIGHT + 20} 0,${BANNER_HEIGHT - 40}
            Z
          `}
          fill="white"
        />
      </Svg>
    );
  };

  return (
    <View style={[styles.container, { marginHorizontal: -20 }]}>
      <MaskedView
        style={[styles.maskedContainer, { width: width }]}
        maskElement={<BannerMask />}
      >
        <Image
          source={require("../../assets/images/homebanner.png")}
          style={[styles.bannerImage, { width: width }]}
          resizeMode="stretch"
          onLayout={({ nativeEvent }) => {
            setBannerImageSize({
              width: nativeEvent.layout.width,
              height: nativeEvent.layout.height,
            });
          }}
          accessible={true}
          accessibilityLabel="Bannière d'accueil"
        />

        {/* Conteneur des cartes */}
        <View style={styles.cardsContainer}>
          {cardData.map((item, index) => (
            <TouchableWithoutFeedback
              key={index}
              onPress={() => handleCardPress(item.animation, item.index)}
              accessibilityLabel={item.title}
              accessibilityRole="button"
              accessibilityHint={
                user
                  ? "Accéder à ce service"
                  : "Se connecter pour accéder à ce service"
              }
            >
              <Animated.View
                style={[styles.cardWrapper, getCardTransform(item.animation)]}
              >
                {/* Carte avec blur uniquement quand inactive */}
                <View style={styles.cardContentWrapper}> 
                  <Image
                    source={require("../../assets/images/homebanner.png")}
                    style={[
                      styles.blurBackground,
                      {
                        width: bannerImageSize.width,
                        height: bannerImageSize.height,
                      },
                    ]}
                    blurRadius={getBlurRadius(item.index)}
                  />

                  {/* Overlay sombre uniquement pour les cartes inactives */}
                  {activeCard !== item.index && <View style={styles.overlay} />}

                  {/* Dégradé orange uniquement pour la carte active */}
                  {activeCard === item.index && (
                    <LinearGradient
                      colors={["#F17922", "#FA6345"]}
                      style={styles.activeBackdrop}
                    />
                  )}

                  {/* Contenu de la carte avec animation de remontée */}
                  <Animated.View
                    style={[
                      styles.cardContent,
                      getContentTransform(item.animation),
                    ]}
                  >
                    {activeCard === item.index && (
                      <Image
                        source={item.illustration}
                        style={styles.cardIllustration}
                        accessibilityLabel={`Icône ${item.title}`}
                      />
                    )}
                    <Text
                      style={[
                        styles.cardTitle,
                        activeCard === item.index && styles.activeText,
                      ]}
                    >
                      {item.title}
                    </Text>
 
                    {!user && activeCard === item.index && (
                      <Text style={styles.loginRequired}>
                        Connexion requise
                      </Text>
                    )}
                  </Animated.View>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          ))}
        </View>
      </MaskedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    position: "relative",
    overflow: "hidden",
  },
  maskedContainer: {
    height: BANNER_HEIGHT,
    position: "relative",
  },
  bannerImage: {
    height: BANNER_HEIGHT,
    position: "absolute",
  },
  cardsContainer: {
    position: "absolute",
    bottom: -110,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 0,
    zIndex: 10,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 230,
    borderRadius: 100,
    overflow: "hidden",
  },
  cardContentWrapper: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: 100,
    position: "relative",
  },
  blurBackground: {
    position: "absolute",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#7a3502",
  },
  activeBackdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    zIndex: 1,
    marginTop: -70,
  },
  cardIllustration: {
    width: 80,
    height: 80,
    marginBottom: 4,
    resizeMode: "contain",
  },
  cardTitle: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 12,
  },
  activeText: {
    color: "white",
    fontFamily: "Urbanist-Bold",
  },
  loginRequired: {
    color: "white",
    fontSize: 10,
    fontFamily: "Sofia-Medium",
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
});

export default HomeBanner;
