import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import useCartStore from "@/store/cartStore";
import { FontAwesome } from "@expo/vector-icons";
import GradientButton from "@/components/ui/GradientButton";
import { useRouter } from "expo-router";
import CartTabBar from "@/components/ui/CartTabBar";
import { useAuth } from "@/app/context/AuthContext";
import DynamicHeader from "@/components/home/DynamicHeader";
import useLocationStore from "@/store/locationStore";
import { promoCodes } from "@/data/MockedData";
import SuccessModal from "@/components/ui/SuccessModal";
import AddressSelectionModal from "@/components/address/AddressSelectionModal";

/**
 * Écran du panier d'achat
 * Affiche les produits ajoutés au panier, permet de modifier les quantités,
 * d'appliquer des codes promo et de passer à la caisse.
 */
const Cart: React.FC = () => {
  // Hooks et stores
  const { items, totalItems, totalAmount, removeFromCart, updateQuantity } =
    useCartStore();
  const router = useRouter();
  const { user } = useAuth();
  const { addressDetails, coordinates, getFormattedAddress, setCoordinates, setAddressDetails, setLocationType } = useLocationStore();

  // États pour la gestion des codes promo
  const [promoCode, setPromoCode] = useState("");
  const [validPromo, setValidPromo] = useState<{
    discount: number;
    type: string;
  } | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [codeApplied, setCodeApplied] = useState(false);

  // État pour la modale de succès
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // État pour la modale de sélection d'adresse
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Calcul des totaux pour l'affichage
  const calculatedTVA = totalAmount * 0.05;
  const deliveryFee = 1000;
  const finalTotal = totalAmount + calculatedTVA + deliveryFee - promoDiscount;

  /**
   * Récupère la localisation de l'utilisateur au chargement si aucune adresse n'est définie
   */
  useEffect(() => {
    const checkAndGetLocation = async () => {
      // Si on n'a pas encore d'adresse ou de coordonnées, essayer de les obtenir
      if (!addressDetails?.formattedAddress && !coordinates) {
        await getCurrentLocation();
      }
    };
    
    checkAndGetLocation();
  }, []);

  /**
   * Récupère la position actuelle de l'utilisateur
   */
  const getCurrentLocation = async (): Promise<void> => {
    try {
      setIsLoadingLocation(true);
      
      // Vérifier si le module expo-location est disponible
      const Location = require("expo-location");
      
      // Demander la permission d'accéder à la localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        console.log("Permission de localisation refusée");
        return;
      }
      
      // Obtenir la localisation actuelle
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      // Mettre à jour les coordonnées dans le store
      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      // Effectuer le geocoding inverse pour obtenir l'adresse
      await reverseGeocode(location.coords.latitude, location.coords.longitude);
      
      // Définir le type de localisation comme automatique
      setLocationType("auto");
      
    } catch (error) {
      console.error("Erreur lors de la récupération de la localisation:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  /**
   * Convertit les coordonnées en une adresse (geocoding inverse)
   */
  const reverseGeocode = async (latitude: number, longitude: number): Promise<void> => {
    try {
      // Utiliser l'API de geocoding inverse de Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "ChickenNationApp",
            "Accept-Language": "fr"
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        // Extraire les informations pertinentes de l'adresse
        const addressDetails = {
          road: data.address.road || "",
          city: data.address.city || data.address.town || data.address.village || "",
          postalCode: data.address.postcode || "",
          formattedAddress: data.display_name || "",
          address: data.address.road || ""
        };
        
        // Mettre à jour les détails de l'adresse dans le store
        setAddressDetails(addressDetails);
      }
    } catch (error) {
      console.error("Erreur lors du geocoding inverse:", error);
      // En cas d'erreur, définir une adresse par défaut
      setAddressDetails({
        formattedAddress: "Position actuelle"
      });
    }
  };

  /**
   * Extrait l'adresse formatée à partir des données de localisation
   * @returns {string} L'adresse formatée pour l'affichage
   */
  const getDisplayAddress = (): string => {
    return getFormattedAddress();
  };

  /**
   * Obtient le nom de la zone de livraison
   * @returns {string} Le nom de la zone de livraison
   */
  const getAreaName = (): string => {
    if (addressDetails?.city) {
      return addressDetails.city;
    }
    return "Localisation actuelle";
  };

  /**
   * Applique un code promo si valide et calcule la réduction
   */
  const applyPromoCode = (): void => {
    const normalizedCode = promoCode.trim().toUpperCase();

    if (!normalizedCode) {
      Alert.alert("Erreur", "Veuillez saisir un code promo");
      return;
    }

    // Recherche du code promo dans la liste des codes valides
    const validCode = promoCodes.find((code) => code.code === normalizedCode);

    if (validCode) {
      setValidPromo({
        discount: validCode.discount,
        type: validCode.type,
      });
      setCodeApplied(true);

      // Calculer la réduction selon le type de code promo
      if (validCode.type === "percent") {
        // Réduction en pourcentage
        const discount = totalAmount * (validCode.discount / 100);
        setPromoDiscount(discount);
      } else {
        // Réduction fixe (ne pas dépasser le montant total)
        setPromoDiscount(Math.min(validCode.discount, totalAmount));
      }

      // Afficher la modale de succès
      setSuccessMessage(`${validCode.description}`);
      setShowSuccessModal(true);
    } else {
      setValidPromo(null);
      setPromoDiscount(0);
      setCodeApplied(false);
      Alert.alert("Erreur", "Code promo invalide");
    }
  };

  /**
   * Réinitialise le code promo et les réductions associées
   */
  const resetPromoCode = (): void => {
    setPromoCode("");
    setValidPromo(null);
    setPromoDiscount(0);
    setCodeApplied(false);
  };

  /**
   * Met à jour la réduction si le panier change et qu'un code promo est appliqué
   */
  useEffect(() => {
    if (codeApplied && validPromo) {
      if (validPromo.type === "percent") {
        const discount = totalAmount * (validPromo.discount / 100);
        setPromoDiscount(discount);
      }
      // Pour les réductions fixes, on ne recalcule pas
    }
  }, [totalAmount, codeApplied, validPromo]);

  /**
   * Gère le clic sur "Passer à la caisse"
   * Redirige vers la page de paiement si l'utilisateur est connecté,
   * sinon vers la page de connexion
   */
  const handleCheckout = (): void => {
    if (user) {
      router.push("/(authenticated-only)/checkout");
    } else {
      // Si l'utilisateur n'est pas connecté, le rediriger vers la page de connexion
      Alert.alert(
        "Connexion requise",
        "Veuillez vous connecter pour finaliser votre commande",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Se connecter",
            onPress: () => router.push("/(tabs-guest)/login"),
          },
        ],
      );
    }
  };

  /**
   * Gère la fermeture de la modale de succès
   */
  const handleCloseModal = (): void => {
    setShowSuccessModal(false);
  };

  // Rendu pour un panier vide
  if (items.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <CustomStatusBar />

        <View className="flex-1 items-center justify-center">
          <Image
            source={require("../../../assets/icons/empty-cart.png")}
            style={{ width: 150, height: 150, resizeMode: "contain" }}
            accessibilityLabel="Panier vide"
          />
          <Text className="text-2xl text-center font-urbanist-bold text-slate-800">
            Ton panier est vide
          </Text>
          <Text className="text-md mt-4 text-center font-urbanist-medium text-gray-500">
            Consulte notre menu
          </Text>
        </View>

        <CartTabBar />
      </View>
    );
  }

  // Rendu principal du panier avec des articles
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      {/* Header fixe en haut */}
      <View className="-mt-6 z-10">
        <DynamicHeader
          displayType="back"
          title="Panier des commandes"
          showCart={true}
        />
      </View>

      <ScrollView
        className="flex-1 mt-4 px-6 sm:px-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Liste des produits dans le panier */}
        {items.map((item) => (
          <View key={item.id} className="bg-white rounded-2xl p-4 mb-4">
            <View className="flex-row items-center">
              <Image
                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                className="w-24 h-24 sm:w-20 sm:h-20 rounded-xl border-orange-500 border-[1px]"
                style={{ resizeMode: "contain" }}
                accessibilityLabel={`Image de ${item.name}`}
              />
              <View className="flex-1 ml-4">
                <Text className="font-urbanist-bold text-sm sm:text-base">
                  {item.name}
                </Text>
                <Text className="font-sofia-light text-slate-600 text-md sm:text-sm mt-1">
                  {item.description}
                </Text>
                <Text className="font-sofia-light text-gray-500 text-xs sm:text-sm mt-1">
                  {item.extras ? item.extras.join(" + ") : "Aucun supplément"}
                </Text>
                <View className="flex flex-row justify-between items-center flex-wrap">
                  <Text className="font-sofia-medium text-orange-500 mt-1">
                    {item.price.toLocaleString()} FCFA
                  </Text>
                  {/* Sélecteur de quantité */}
                  <View className="flex-row items-center mt-1">
                    <TouchableOpacity
                      className="border-orange-500 border-2 rounded-full p-2 py-[5px] sm:p-[9px] sm:py-[7px]"
                      onPress={() =>
                        updateQuantity(item.id, Math.max(0, item.quantity - 1))
                      }
                      accessibilityLabel="Réduire la quantité"
                    >
                      <FontAwesome name="minus" size={16} color="#f97316" />
                    </TouchableOpacity>
                    <Text className="mx-3 sm:mx-4 text-base sm:text-lg font-sofia-light text-black/70">
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      accessibilityLabel="Augmenter la quantité"
                    >
                      <Image
                        source={require("../../../assets/icons/plus-rounded.png")}
                        style={{ width: 34, height: 34, resizeMode: "contain" }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            {/* Boutons d'action pour chaque produit */}
            <View className="flex-row justify-between mt-4 gap-3">
              <TouchableOpacity
                onPress={() => removeFromCart(item.id)}
                className="border border-orange-500 rounded-full py-2 px-2 flex-1 items-center"
                accessibilityLabel={`Retirer ${item.name} du panier`}
              >
                <Text className="text-orange-500 font-sofia-medium text-center">
                  Retirer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/(common)/products/${item.id}`)}
                className="bg-orange-500 rounded-full py-2 px-2 flex-1 items-center"
                accessibilityLabel={`Modifier ${item.name}`}
              >
                <Text className="text-white font-sofia-medium text-center">
                  Modifier
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Section lieu de livraison */}
        {user && (
          <View className="bg-white rounded-3xl p-4 mb-4 border border-orange-500/50">
            <Text className="font-sofia-bold text-gray-500 mb-2">
              Lieu de livraison
            </Text>
            <TouchableOpacity 
              onPress={() => setShowAddressModal(true)}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Image
                  source={require("../../../assets/icons/changelocation.png")}
                  className="w-16 h-16 sm:w-20 sm:h-20"
                  style={{ resizeMode: "contain" }}
                />
                <View>
                  {isLoadingLocation ? (
                    <>
                      <Text className="font-sofia-medium text-orange-500 text-sm sm:text-base">
                        Localisation en cours...
                      </Text>
                      <Text className="mt-1 font-sofia-light text-gray-500 text-xs sm:text-sm">
                        Récupération de votre position
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="font-sofia-medium text-orange-500 text-sm sm:text-base">
                        {getAreaName()}
                      </Text>
                      <Text 
                        className="mt-1 font-sofia-light text-gray-500 text-xs sm:text-sm"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={{ maxWidth: 200 }}
                      >
                        {getDisplayAddress()}
                      </Text>
                    </>
                  )}
                </View>
              </View>
              <FontAwesome name="angle-right" size={24} color="#FF6B00" />
            </TouchableOpacity>
          </View>
        )}

        {/* Section code promo */}
        {user && (
          <View
            className={`bg-slate-100 rounded-3xl mb-4 px-2 py-1 ${codeApplied ? "border-[1px] border-orange-500" : ""}`}
          >
            <View className="flex-row items-center justify-between rounded-full">
              <View className="flex-row items-center flex-1 pl-2">
                <Image
                  source={
                    codeApplied
                      ? require("../../../assets/icons/promo-verified.png")
                      : require("../../../assets/icons/special-offer.png")
                  }
                  style={{
                    width: codeApplied ? 20 : 16,
                    height: codeApplied ? 20 : 16,
                    resizeMode: "contain",
                    marginRight: 8,
                  }}
                  accessibilityLabel={
                    codeApplied ? "Code promo vérifié" : "Code promo"
                  }
                />
                <TextInput
                  placeholder="Code Promo"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  className="flex-1 font-sofia-regular text-gray-500"
                  editable={!codeApplied}
                  accessibilityLabel="Entrez votre code promo"
                />
              </View>
              <TouchableOpacity
                className={`${codeApplied ? "bg-yellow" : "bg-orange-500"} rounded-full py-2 px-4 ml-2`}
                onPress={applyPromoCode}
                disabled={codeApplied}
                accessibilityLabel={
                  codeApplied ? "Code promo accepté" : "Appliquer le code promo"
                }
              >
                <Text
                  className={`${codeApplied ? "text-black" : "text-white"} font-sofia-medium`}
                >
                  {codeApplied ? "Code accepté" : "Appliquer"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Récapitulatif de la commande */}
        <View className="bg-white rounded-3xl p-4 mb-4 border border-orange-500/50">
          <View className="flex-row justify-between mb-2">
            <Text className="font-sofia-light text-gray-500">
              Montant de la commande
            </Text>
            <Text className="font-sofia-medium text-gray-500">
              {totalAmount.toLocaleString()} FCFA
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="font-sofia-light text-gray-500">TVA 5%</Text>
            <Text className="font-sofia-medium text-gray-500">
              {calculatedTVA.toLocaleString()} FCFA
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="font-sofia-light text-gray-500">
              Frais de livraison
            </Text>
            <Text className="font-sofia-medium text-gray-500">
              {deliveryFee.toLocaleString()} FCFA
            </Text>
          </View>
          {promoDiscount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="font-sofia-light text-green-600">
                Réduction code promo
              </Text>
              <Text className="font-sofia-medium text-green-600">
                - {promoDiscount.toLocaleString()} FCFA
              </Text>
            </View>
          )}
          <View className="border-t border-gray-200 my-2" />
          <View className="flex-row justify-between mt-2">
            <Text className="font-sofia-light text-gray-500">Net à payer</Text>
            <Text className="font-sofia-bold text-orange-500">
              {finalTotal.toLocaleString()} FCFA
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bouton "Passer à la caisse" */}
      <View className="px-4 sm:px-6 py-4 bg-white border-t border-gray-100">
        {user ? (
          <GradientButton onPress={handleCheckout}>
            <View className="flex-row items-center justify-center">
              <Image
                source={require("../../../assets/icons/card.png")}
                style={{
                  width: 24,
                  height: 24,
                  resizeMode: "contain",
                  marginRight: 8,
                }}
                accessibilityLabel="Icône paiement"
              />
              <Text className="text-white text-lg font-urbanist-medium">
                Passer à la caisse
              </Text>
            </View>
          </GradientButton>
        ) : (
          <GradientButton onPress={() => router.push("/(tabs-guest)/login")}>
            <Text className="text-white text-lg font-urbanist-medium">
              Connexion requise
            </Text>
          </GradientButton>
        )}
      </View>

      {/* TabBar pour le panier */}
      <CartTabBar />

      {/* Modale de sélection d'adresse */}
      <AddressSelectionModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onAddressSelected={() => {
          // Rafraîchir les données de localisation après la sélection
        }}
      />

      {/* Modale de succès pour le code promo */}
      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={handleCloseModal}
      />
    </View>
  );
};

export default Cart;
