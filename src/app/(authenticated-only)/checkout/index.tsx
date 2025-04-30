import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { useRouter } from "expo-router";
import useCartStore from "@/store/cartStore";
import { useLocation } from "@/app/context/LocationContext";
import { useAuth } from "@/app/context/AuthContext";
import useOrderStore from "@/store/orderStore";
import useDeliveryStore from "@/store/deliveryStore";
import useTakeawayStore from "@/store/takeawayStore";
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
  const { items, totalAmount, clearCart } = useCartStore();
  const { locationData } = useLocation();
  const { user } = useAuth();
  const { isActive: isDeliveryActive } = useDeliveryStore();
  const { isActive: isTakeawayActive, selectedDate, selectedHour, selectedMinute } = useTakeawayStore();
  const { createDeliveryOrder, createTakeawayOrder, isLoading, error, resetOrderState } = useOrderStore();
  
  // Réinitialiser l'état du store d'ordres au chargement du composant
  useEffect(() => {
    console.log("Réinitialisation de l'état du store d'ordres");
    resetOrderState();
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
      console.log("Erreur détectée dans le store d'ordres:", error);
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
    console.log("handleContinue appelé, étape actuelle:", currentStep);
    if (currentStep === "recap") {
      console.log("Passage de l'étape recap à payment");
      setCurrentStep("payment");
    } else if (currentStep === "payment" && selectedPayment) {
      console.log("Passage de l'étape payment à confirmation");
      setCurrentStep("confirmation");
    } else if (currentStep === "confirmation") {
      console.log("Ouverture de la modal de confirmation");
      setShowConfirmationModal(true);
    }
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
      
      // Récupérer les adresses de l'utilisateur
      const userAddresses = await getUserAddresses();
      
      // Vérifier si l'utilisateur a des adresses
      if (!userAddresses || userAddresses.length === 0) {
        throw new Error("Aucune adresse trouvée. Veuillez ajouter une adresse dans votre profil.");
      }
      
      // Utiliser la première adresse disponible
      const addressId = userAddresses[0].id?.toString();
      
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
      if (isDeliveryActive) {
        // Créer une commande de livraison
        orderId = await createDeliveryOrder(
          addressId,
          fullname,
          phone,
          email,
          "" // Note (optionnelle)
        );
      } else if (isTakeawayActive) {
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
      
      console.log("Données utilisateur complètes:", JSON.stringify(userData, null, 2));
      
      // Préparer les données de l'utilisateur
      const fullname = `${userData.first_name} ${userData.last_name}`;
      const email = userData.email || "";
      const phone = userData.phone || "";
      
      // Récupérer les adresses de l'utilisateur
      const userAddresses = await getUserAddresses();
      
      // Vérifier si l'utilisateur a des adresses
      if (!userAddresses || userAddresses.length === 0) {
        throw new Error("Aucune adresse trouvée. Veuillez ajouter une adresse dans votre profil.");
      }
      
      // Utiliser la première adresse disponible
      const addressId = userAddresses[0].id?.toString();
      
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
      
      // Vérifier le moyen de paiement sélectionné
      if (!selectedPayment) {
        throw new Error("Veuillez sélectionner un moyen de paiement");
      }
      
      // Créer la commande selon le type (livraison ou à emporter)
      if (isDeliveryActive) {
        // Créer une commande de livraison
        orderId = await createDeliveryOrder(
          addressId,
          fullname,
          phone,
          email,
          `Paiement par ${selectedPayment}` // Ajouter le moyen de paiement dans la note
        );
      } else if (isTakeawayActive) {
        // Créer une commande à emporter
        orderId = await createTakeawayOrder(
          fullname,
          phone,
          email,
          `Paiement par ${selectedPayment}` // Ajouter le moyen de paiement dans la note
        );
      } else {
        // Par défaut, créer une commande de livraison
        orderId = await createDeliveryOrder(
          addressId,
          fullname,
          phone,
          email,
          `Paiement par ${selectedPayment}` // Ajouter le moyen de paiement dans la note
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
