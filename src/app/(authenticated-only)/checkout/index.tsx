import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import useCartStore from "@/store/cartStore";
import { useLocation } from "@/app/context/LocationContext";
import { useAuth } from "@/app/context/AuthContext";
import useOrderStore from "@/store/orderStore";
import useOrderTypeStore, { OrderType } from "@/store/orderTypeStore";
import {
  PaymentMethod,
  CheckoutStep,
  CreditCardData,
  KeypadKey,
  RecapStep,
  PaymentStep,
  ConfirmationStep,
  PhoneModal,
  SimpleConfirmationModal,
  AddCreditCardStep,
  CreditCardPreviewStep,
  SuccessStep,
  FailedStep,
  NetworkErrorStep,
} from "@/components/checkout";
import { getUserAddresses } from "@/services/api/address";
import { getCustomerDetails } from "@/services/api/customer";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Étendre le type LocationData pour inclure addressId
declare module "@/app/context/LocationContext" {
  interface LocationData {
    addressId?: string;
    // Autres propriétés existantes...
  }
}

// Props pour les composants de résultat
interface SimpleResultStepProps {
  onRetry: () => void;
  onCancel?: () => void;
  errorMessage?: string;
}

// Props pour le composant de succès
interface SimpleSuccessStepProps {
  onContinue: () => void;
}

// Props pour le composant de prévisualisation de carte
interface SimpleCreditCardPreviewProps {
  creditCardData: CreditCardData;
  onContinue: () => void;
}

// Props pour le composant d'ajout de carte
interface SimpleAddCreditCardProps {
  creditCardData: CreditCardData;
  setCreditCardData: React.Dispatch<React.SetStateAction<CreditCardData>>;
  cardHolderRef: React.RefObject<TextInput>;
  cardNumberRef: React.RefObject<TextInput>;
  expiryDateRef: React.RefObject<TextInput>;
  cvvRef: React.RefObject<TextInput>;
  handleCardNumberChange: (text: string) => void;
  handleExpiryDateChange: (text: string) => void;
  onContinue: () => void;
}

const Checkout = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { items, totalAmount, clearCart } = useCartStore();
  const { locationData } = useLocation();
  const { user } = useAuth();
  
  // Utiliser le nouveau store centralisé au lieu des trois stores séparés
  const { activeType, reservationData, setActiveType, resetReservationData } = useOrderTypeStore();
  
  // Conserver uniquement le store d'ordres pour créer les commandes
  const { createDeliveryOrder, createTakeawayOrder, createTableOrder, isLoading, error, resetOrderState } = useOrderStore();
  
  // Référence pour éviter les initialisations multiples
  const hasInitializedRef = useRef(false);

  // Initialiser le composant une seule fois
  useEffect(() => {
    const initializeCheckout = async () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;
 
      
      // Réinitialiser l'état du store d'ordres
      resetOrderState();

      
      
      // Si nous avons un paramètre 'type' égal à 'reservation', activer le mode TABLE
      if (params.type === 'reservation') {
        
        setActiveType(OrderType.TABLE);
      }
    };

    initializeCheckout();
  }, []);

  // Référence pour éviter les boucles infinies
  const hasCheckedRef = useRef(false);

  // Vérifier et définir le type de commande en fonction des paramètres
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
 

    // Vérifier si un paramètre de type est spécifié
    const hasTypeParam = params.type === 'pickup' || params.type === 'delivery' || params.type === 'reservation';
    
    // Si un paramètre de type est spécifié, l'utiliser pour définir le type de commande
    if (hasTypeParam) {
      if (params.type === 'pickup') {
        
        setActiveType(OrderType.PICKUP);
      } else if (params.type === 'delivery') {
        
        setActiveType(OrderType.DELIVERY);
      } else if (params.type === 'reservation') {
      
        setActiveType(OrderType.TABLE);
      }
    } else {
      // Si aucun paramètre de type n'est spécifié, vérifier si le type actuel est valide
      const isValidType = activeType === OrderType.DELIVERY || 
                          activeType === OrderType.PICKUP || 
                          activeType === OrderType.TABLE;
      
      // Ne réinitialiser à DELIVERY que si le type actuel n'est pas valide
      if (!isValidType) {
       
        useOrderTypeStore.getState().resetOrderTypeToDefault();
        setActiveType(OrderType.DELIVERY);
      } else {
       
      }
    }

    // Vérifier à nouveau le type actif après la mise à jour
    setTimeout(() => {
      
    }, 100);
  }, []);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("recap");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null,
  );
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [creditCardData, setCreditCardData] = useState<CreditCardData>({
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Refs pour les inputs de carte de crédit
  const cardHolderRef = useRef<TextInput>(null);
  const cardNumberRef = useRef<TextInput>(null);
  const expiryDateRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);

  // Calcul des totaux
  const calculatedTVA = totalAmount * 0.05;
  const deliveryFee = 1000;
  const finalTotal = totalAmount + calculatedTVA + deliveryFee;

  // Surveiller les erreurs du store d'ordres
  useEffect(() => {
    if (error) {
      
      setOrderError(error);
      setCurrentStep("failed");
    }
  }, [error]);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
    if (method === "card") {
      setCurrentStep("addcreditcard");
    } else if (["orange", "momo", "moov", "wave"].includes(method)) {
      setShowPhoneModal(true);
    }
  };

  const handleNumberPress = (num: KeypadKey) => {
    if (phoneNumber.length < 10) {
      setPhoneNumber((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleContinue = () => {
  
    
    if (currentStep === "recap") {
      setCurrentStep("payment");
      console.log("Passage de l'étape recap à payment");
    } else if (currentStep === "payment") {
      if (selectedPayment === "card") {
        setCurrentStep("addcreditcard");
        console.log("Passage de l'étape payment à addcreditcard");
      } else {
        setCurrentStep("confirmation");
        console.log("Passage de l'étape payment à confirmation");
      }
    } else if (currentStep === "confirmation") {
      console.log("Ouverture de la modal de confirmation");
      setShowConfirmationModal(true);
    }
  };

  const getAddressId = async () => {
    const userAddresses = await getUserAddresses();
    let addressId: string | undefined;

    if (!userAddresses || userAddresses.length === 0) {
      if (locationData && locationData.coordinates) {
        const { coordinates, addressDetails } = locationData;
        try {
          const tempAddress = {
            title: "Position actuelle",
            address: addressDetails?.formattedAddress || "Position actuelle",
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            street: addressDetails?.address || "",
            city: addressDetails?.city || "Abidjan"
          };
          await AsyncStorage.setItem('temp_delivery_address', JSON.stringify(tempAddress));
          addressId = "current_location";
        } catch (error) {
          console.error("Erreur lors de la création de l'adresse temporaire:", error);
          throw new Error("Impossible d'utiliser votre position actuelle. Veuillez ajouter une adresse dans votre profil.");
        }
      } else {
        throw new Error("Aucune adresse trouvée et localisation actuelle non disponible. Veuillez ajouter une adresse dans votre profil.");
      }
    } else {
      addressId = userAddresses[0].id?.toString();
    }
    return addressId;
  };

  const handleProceedPayment = async () => {
    setShowConfirmationModal(false);
    setProcessingOrder(true);
    
    try {
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        throw new Error("Vous devez être connecté pour passer une commande");
      }
      
      // Récupérer les données utilisateur depuis l'API
      const userData = await getCustomerDetails();
      
      if (!userData) {
        throw new Error("Impossible de récupérer vos données utilisateur");
      }
      
      // Préparer les données de l'utilisateur
      const fullname = `${userData.first_name} ${userData.last_name}`;
      const email = userData.email || "";
      const phone = userData.phone || "";
      
      // Récupérer l'ID de l'adresse
      const addressId = await getAddressId();
      
      if (!addressId) {
        throw new Error("Adresse invalide. Veuillez ajouter une nouvelle adresse dans votre profil.");
      }
      
      let orderId: string | null = null;
      
      // Simuler un délai de traitement du paiement (1 seconde)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier les articles du panier
      const cartStore = useCartStore.getState();
      
      if (cartStore.items.length === 0) {
        throw new Error("Votre panier est vide");
      }
      
      // Créer la commande selon le type (livraison ou à emporter)
      if (activeType === OrderType.DELIVERY) {
        // Créer une commande de livraison
        orderId = await createDeliveryOrder(
          addressId,
          fullname,
          phone,
          email,
          "" // Note (optionnelle)
        );
      } else if (activeType === OrderType.PICKUP) {
        // Créer une commande à emporter
        orderId = await createTakeawayOrder(
          fullname,
          phone,
          email,
          "" // Note (optionnelle)
        );
      } else {
        // Par défaut, créer une commande de livraison
        orderId = await createDeliveryOrder(
          addressId,
          fullname,
          phone,
          email,
          "" // Note (optionnelle)
        );
      }
      
      if (orderId) {
        setCurrentStep("success");
        
        // Vider le panier après la commande réussie
        clearCart();
      } else {
        throw new Error("Erreur lors de la création de la commande");
      }
    } catch (err: any) {
      setOrderError(err.message || "Erreur lors du paiement");
      setCurrentStep("failed");
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleConfirmPayment = async () => {
    setShowConfirmationModal(false);
    setProcessingOrder(true);
    
   
    try {
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        throw new Error("Vous devez être connecté pour passer une commande");
      }
      
      // Récupérer les données utilisateur depuis l'API
      const userData = await getCustomerDetails();
      
      if (!userData) {
        throw new Error("Impossible de récupérer vos données utilisateur");
      }
      
      
      
      // Préparer les données de l'utilisateur
      const fullname = `${userData.first_name} ${userData.last_name}`;
      const email = userData.email || "";
      const phone = userData.phone || "";
      
    
      
      // Récupérer l'ID de l'adresse
      const addressId = await getAddressId();
      
      if (!addressId) {
        throw new Error("Adresse invalide. Veuillez ajouter une nouvelle adresse dans votre profil.");
      }
      
      let orderId: string | null = null;
      
      // Simuler un délai de traitement du paiement (1 seconde)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier les articles du panier
      const cartStore = useCartStore.getState();
      
      console.log("Articles du panier:", cartStore.items.length, "item(s)");
      
      if (cartStore.items.length === 0) {
        throw new Error("Votre panier est vide");
      }
      
      // Vérifier le moyen de paiement sélectionné
      if (!selectedPayment) {
        throw new Error("Veuillez sélectionner un moyen de paiement");
      }
      
      console.log("Moyen de paiement sélectionné:", selectedPayment);
      
      // Créer la commande selon le type actif
      switch (activeType) {
        case OrderType.TABLE:
          
          
          // Utiliser la fonction getFormattedReservationData pour obtenir les données formatées
          const formattedReservationData = useOrderTypeStore.getState().getFormattedReservationData();
          
          if (!formattedReservationData) {
            throw new Error("Données de réservation incomplètes. Veuillez recommencer la réservation.");
          }
          
         
          formattedReservationData.note += ` - Paiement par ${selectedPayment}`;
          
          // Créer une réservation de table
          orderId = await createTableOrder(
            formattedReservationData.fullname,
            formattedReservationData.email,
            formattedReservationData.date,
            formattedReservationData.time,
            formattedReservationData.tableType,
            formattedReservationData.numberOfPeople,
            formattedReservationData.note
          );
          break;
          
        case OrderType.PICKUP:
          
          // Créer une commande à emporter
          orderId = await createTakeawayOrder(
            fullname,
            phone,
            email,
            `Paiement par ${selectedPayment}` // Ajouter le moyen de paiement dans la note
          );
          break;
          
        case OrderType.DELIVERY:
        default:
         
          // Créer une commande de livraison
          orderId = await createDeliveryOrder(
            addressId,
            fullname,
            phone,
            email,
            `Paiement par ${selectedPayment}` // Ajouter le moyen de paiement dans la note
          );
          break;
      }
      
     
      
      if (orderId) {
        // Réinitialiser les données de réservation après une commande réussie
        if (activeType === OrderType.TABLE) {
          
          resetReservationData();
        }
        
        // Réinitialiser le type de commande à DELIVERY pour la prochaine commande
        console.log("Réinitialisation du type de commande à DELIVERY pour la prochaine commande");
        useOrderTypeStore.getState().resetOrderTypeToDefault();
        
        setCurrentStep("success");
        
        // Vider le panier après la commande réussie
        clearCart();
      } else {
        throw new Error("Erreur lors de la création de la commande");
      }
    } catch (err: any) {
      console.error("ERREUR LORS DU PROCESSUS DE PAIEMENT:", err.message);
      setOrderError(err.message || "Erreur lors du paiement");
      setCurrentStep("failed");
    } finally {
      setProcessingOrder(false);
      
    }
  };

  const validateCreditCard = (): boolean => {
    const { cardHolder, cardNumber, expiryDate, cvv } = creditCardData;
    if (cardHolder.length < 3) return false;
    if (cardNumber.replace(/\s/g, "").length !== 16) return false;
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;
    if (cvv.length !== 3) return false;
    return true;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted =
      text
        .replace(/\s/g, "")
        .match(/.{1,4}/g)
        ?.join(" ") || text;
    setCreditCardData((prev) => ({
      ...prev,
      cardNumber: formatted.slice(0, 19),
    }));
  };

  const handleExpiryDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    setCreditCardData((prev) => ({
      ...prev,
      expiryDate: formatted.slice(0, 5),
    }));
  };

  const handleBack = () => {
    if (currentStep === "payment") {
      setCurrentStep("recap");
    } else if (currentStep === "confirmation") {
      setCurrentStep("payment");
    } else if (currentStep === "addcreditcard") {
      setCurrentStep("payment");
    } else if (currentStep === "creditcardpreview") {
      setCurrentStep("addcreditcard");
    } else if (["success", "failed", "network_error"].includes(currentStep)) {
      router.back();
    } else {
      router.back();
    }
  };

  const handleCheckout = (): void => {
    if (user) {
      console.log("Navigation vers le checkout");
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

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      {/* Header */}
      <View className="flex-row items-center justify-between px-3 pb-4">
        <TouchableOpacity onPress={handleBack}>
          <Image
            source={require("@/assets/icons/arrow-back.png")}
            className="w-10 h-10"
          />
        </TouchableOpacity>
        <Text className="text-xl font-sofia-medium text-gray-900">
          {currentStep === "recap"
            ? "A la caisse"
            : currentStep === "payment"
            ? "Moyen de paiement"
            : currentStep === "confirmation"
            ? "Confirmation"
            : currentStep === "addcreditcard"
            ? "Moyen de paiement"
            : currentStep === "creditcardpreview"
            ? "Aperçu de la carte"
            : currentStep === "success"
            ? "Confirmation de paiement"
            : currentStep === "failed"
            ? "Échec du paiement"
            : currentStep === "network_error"
            ? "Erreur de connexion"
            : ""}
        </Text>
        <View className="w-10" />
      </View>

      {currentStep === "recap" && (
        <RecapStep
          totalAmount={totalAmount}
          calculatedTVA={calculatedTVA}
          deliveryFee={deliveryFee}
          finalTotal={finalTotal}
          onContinue={handleContinue}
        />
      )}

      {currentStep === "payment" && (
        <PaymentStep
          selectedPayment={selectedPayment}
          onPaymentMethodSelect={handlePaymentMethodSelect}
          onContinue={handleContinue}
        />
      )}

      {currentStep === "confirmation" && (
        <ConfirmationStep
          selectedPayment={selectedPayment}
          totalAmount={totalAmount}
          calculatedTVA={calculatedTVA}
          deliveryFee={deliveryFee}
          finalTotal={finalTotal}
          onChangePayment={() => setCurrentStep("payment")}
          onContinue={handleContinue}
          isLoading={processingOrder}
        />
      )}

      {currentStep === "addcreditcard" && (
        <AddCreditCardStep
          creditCardData={creditCardData}
          onChangeCreditCardData={(data) =>
            setCreditCardData((prev) => ({ ...prev, ...data }))
          }
          onSave={() =>
            validateCreditCard() && setCurrentStep("creditcardpreview")
          }
          cardHolderRef={cardHolderRef}
          cardNumberRef={cardNumberRef}
          expiryDateRef={expiryDateRef}
          cvvRef={cvvRef}
          handleCardNumberChange={handleCardNumberChange}
          handleExpiryDateChange={handleExpiryDateChange}
          validateCreditCard={validateCreditCard}
        />
      )}

      {currentStep === "creditcardpreview" && (
        <CreditCardPreviewStep
          creditCardData={creditCardData}
          totalAmount={totalAmount}
          calculatedTVA={calculatedTVA}
          deliveryFee={deliveryFee}
          finalTotal={finalTotal}
          onContinue={() => setCurrentStep("confirmation")}
        />
      )}

      {currentStep === "success" && (
        <SuccessStep
          phoneNumber={phoneNumber}
          finalTotal={finalTotal}
          selectedPayment={selectedPayment}
          onViewOrders={() => router.push("/(authenticated-only)/orders")}
          onViewReceipt={() => router.push("/(authenticated-only)/orders")}
        />
      )}

      {currentStep === "failed" && (
        <FailedStep
          onRetry={() => {
            setOrderError(null);
            setCurrentStep("confirmation");
          }}
          onCancel={() => router.push("/(tabs-user)/")}
        />
      )}

      {currentStep === "network_error" && (
        <NetworkErrorStep
          onRetry={() => {
            setCurrentStep("confirmation");
          }}
          onCancel={() => router.push("/(tabs-user)/")}
        />
      )}

      {/* Modal pour saisir le numéro de téléphone */}
      <PhoneModal
        visible={showPhoneModal}
        phoneNumber={phoneNumber}
        onClose={() => {
          setShowPhoneModal(false);
          setPhoneNumber("");
        }}
        onNumberPress={handleNumberPress}
        onDelete={handleDelete}
        onConfirm={() => {
          if (phoneNumber.length === 10) {
            setShowPhoneModal(false);
            setCurrentStep("confirmation");
          } else {
            Alert.alert(
              "Numéro incomplet",
              "Veuillez saisir un numéro à 10 chiffres",
            );
          }
        }}
      />

      {/* Modal de confirmation de paiement */}
      <SimpleConfirmationModal
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmPayment}
        isLoading={processingOrder}
      />
    </View>
  );
};

export default Checkout;
