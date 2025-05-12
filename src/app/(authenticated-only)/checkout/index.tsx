import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, Alert, Button, BackHandler, Modal } from "react-native";
import { WebView } from 'react-native-webview';
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { formatPrice } from '@/utils/priceHelpers';
import { formatPhoneForAPI } from '@/utils/formatters';
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
import { getCustomerDetails } from "@/services/api/customer";
import AsyncStorage from '@react-native-async-storage/async-storage';
import useLocationStore from '@/store/locationStore';
import { useKkiapay } from '@kkiapay-org/react-native-sdk';
import usePaymentStore from '@/store/paymentStore';
import * as FileSystem from 'expo-file-system';
import { createPayment, CreatePaymentDto } from "@/services/api/payments";

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
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [creditCardData, setCreditCardData] = useState<CreditCardData>({
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const widgetRef = useRef(null);

  // Refs pour les inputs de carte de crédit
  const cardHolderRef = useRef<TextInput>(null);
  const cardNumberRef = useRef<TextInput>(null);
  const expiryDateRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);

  // Calcul des totaux
  const calculatedTVA = totalAmount * 0.05;
  // N'appliquer les frais de livraison que pour les commandes de type DELIVERY
  const deliveryFee = activeType === OrderType.DELIVERY ? 1000 : 0;
  const finalTotal = totalAmount + calculatedTVA + deliveryFee;

  // Ne pas vider le panier automatiquement, cela sera fait après la création du paiement

  // Surveiller les erreurs du store d'ordres
  useEffect(() => {
    if (error) {
      
      setOrderError(error);
      setCurrentStep("failed");
    }
  }, [error]);

  const { 
    setProcessing, 
    setPaymentSuccess, 
    setPaymentError, 
    resetPaymentState,
    setWebViewOpen,
    setPaymentData
  } = usePaymentStore();

  const { openKkiapayWidget, addSuccessListener, addFailedListener, addEventListener } = useKkiapay();

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
    if (method === "card") {
      setCurrentStep("addcreditcard");
    } else if (["orange", "mtn", "moov", "wave"].includes(method)) {
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
    } else if (currentStep === "payment") {
      if (selectedPayment === "card") {
        setCurrentStep("addcreditcard");
      } else if (["orange", "mtn", "moov", "wave"].includes(selectedPayment || "")) {
        // Vérifier si un numéro de téléphone a été saisi
        if (!phoneNumber || phoneNumber.length !== 10) {
          Alert.alert(
            "Numéro de téléphone requis",
            "Veuillez saisir un numéro de téléphone valide pour continuer",
            [{ text: "OK" }]
          );
          return;
        }
        setCurrentStep("confirmation");
      } else {
        setCurrentStep("confirmation");
      }
    } else if (currentStep === "confirmation") {
      setShowConfirmationModal(true);
    }
  };

  const handleProceedPayment = async () => {
    setShowConfirmationModal(false);
    setProcessingOrder(true);
    
    try {
      console.log('=== DÉBUT DU PROCESSUS DE PAIEMENT ===');
      
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        console.log('ERREUR: Utilisateur non connecté');
        throw new Error("Vous devez être connecté pour passer une commande");
      }
      
      console.log('UTILISATEUR:', {
        id: user.id,
        email: user.email
      });
      
      // Récupérer les données utilisateur depuis l'API
      console.log('RÉCUPÉRATION DES DONNÉES UTILISATEUR...');
      const userData = await getCustomerDetails();
      
      if (!userData) {
        console.log('ERREUR: Impossible de récupérer les données utilisateur');
        throw new Error("Impossible de récupérer vos données utilisateur");
      }
      
      console.log('DONNÉES UTILISATEUR:', JSON.stringify(userData, null, 2));
      
      // Utilisation de la fonction utilitaire formatPhoneForAPI pour un formatage cohérent
      const formatPhoneNumber = (phoneNum: string) => {
        console.log('=== CHECKOUT: DÉBUT DU FORMATAGE DU NUMÉRO ===');
        console.log('CHECKOUT: NUMÉRO ORIGINAL:', phoneNum);
        
        if (!phoneNum) {
          console.log('CHECKOUT: NUMÉRO VIDE, RETOUR VIDE');
          return '';
        }
        
        // Vérifier si le numéro est trop court
        const digits = phoneNum.replace(/\D/g, '');
        console.log('CHECKOUT: NUMÉRO NETTOYÉ (DIGITS):', digits);
        console.log('CHECKOUT: LONGUEUR DU NUMÉRO:', digits.length);
        
        if (digits.length < 8) {
          console.log('CHECKOUT: ATTENTION - NUMÉRO TROP COURT, UTILISATION DU NUMÉRO PAR DÉFAUT');
          const defaultNumber = formatPhoneForAPI('01010101');
          console.log('CHECKOUT: NUMÉRO PAR DÉFAUT FORMATÉ:', defaultNumber);
          return defaultNumber;
        }
        
        const formattedNumber = formatPhoneForAPI(phoneNum);
        console.log('CHECKOUT: NUMÉRO FINAL FORMATÉ:', formattedNumber);
        console.log('=== CHECKOUT: FIN DU FORMATAGE DU NUMÉRO ===');
        return formattedNumber;
      };
      
      // Préparer les données de l'utilisateur
      const fullname = `${userData.first_name} ${userData.last_name}`;
      const email = userData.email || "";
      
      // Formater le numéro de téléphone au format +225XXXXXXXX
      const rawPhone = phoneNumber || userData.phone || "";
      const phone = formatPhoneNumber(rawPhone);
      
      console.log('DONNÉES PRÉPARÉES:', {
        fullname,
        email,
        phone
      });
      
      // Vérifier que l'adresse est bien sélectionnée
      const { addressDetails, coordinates } = useLocationStore.getState();
      if (!addressDetails || !coordinates) {
        console.log('ERREUR: Adresse non sélectionnée');
        throw new Error("Veuillez sélectionner une adresse de livraison.");
      }
      
      console.log('ADRESSE:', {
        addressDetails,
        coordinates
      });
      
      let orderId: string | null = null;
      
      // Si nous avons déjà un paymentId, l'inclure dans la création de la commande
      const orderData = {
        fullname,
        phone,
        email,
        note: "",
        paymentId: paymentId || undefined
      };
      
      console.log('DONNÉES COMMANDE:', JSON.stringify(orderData, null, 2));
      
      // Créer la commande selon le type
      console.log('CRÉATION DE LA COMMANDE...');
      if (activeType === OrderType.DELIVERY) {
        console.log('TYPE: Commande de livraison');
        // Utiliser directement le numéro formaté au lieu de laisser le store le reformater
        // Cela évite les problèmes de double formatage ou de formatage incorrect
        const formattedPhoneForOrder = phone; // Déjà formaté par notre fonction formatPhoneNumber
        console.log('NUMÉRO UTILISÉ POUR LA COMMANDE:', formattedPhoneForOrder);
        
        orderId = await createDeliveryOrder(
          'selected',
          orderData.fullname,
          formattedPhoneForOrder, // Utiliser le numéro déjà formaté
          orderData.email,
          orderData.note,
          orderData.paymentId
        );
      } else if (activeType === OrderType.PICKUP) {
        console.log('TYPE: Commande à emporter');
        // Utiliser directement le numéro formaté au lieu de laisser le store le reformater
        const formattedPhoneForOrder = phone; // Déjà formaté par notre fonction formatPhoneNumber
        console.log('NUMÉRO UTILISÉ POUR LA COMMANDE:', formattedPhoneForOrder);
        
        orderId = await createTakeawayOrder(
          orderData.fullname,
          formattedPhoneForOrder, // Utiliser le numéro déjà formaté
          orderData.email,
          orderData.note,
          orderData.paymentId
        );
      } else if (activeType === OrderType.TABLE) {
        console.log('TYPE: Réservation de table');
        
        // Utiliser directement le numéro formaté au lieu de laisser le store le reformater
        const formattedPhoneForOrder = phone; // Déjà formaté par notre fonction formatPhoneNumber
        console.log('NUMÉRO UTILISÉ POUR LA COMMANDE:', formattedPhoneForOrder);
        
        // Récupérer les données de réservation depuis le store
        const { date, time, numberOfPeople, tableType } = reservationData;
        
        // Convertir la date en format string (YYYY-MM-DD)
        const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
        
        console.log('DONNÉES DE RÉSERVATION:', {
          date: dateString,
          time,
          numberOfPeople,
          tableType
        });
        
        // Vérifier que toutes les données nécessaires sont présentes
        if (!date || !time || !numberOfPeople || !tableType) {
          throw new Error('Informations de réservation incomplètes');
        }
        
        // Ajouter le numéro de téléphone formaté dans les paramètres de la fonction
        // Note: createTableOrder n'accepte pas le paramètre phone dans sa signature,
        // mais nous l'ajoutons ici pour être cohérent avec les autres types de commandes
        orderId = await createTableOrder(
          orderData.fullname,
          orderData.email,
          dateString,
          time,
          tableType,
          numberOfPeople,
          orderData.note
        );
      }
      
      if (orderId) {
        console.log('COMMANDE CRÉÉE:', orderId);
        
        // Si nous n'avons pas encore de paymentId, créer le paiement maintenant
        if (!paymentId) {
          console.log('CRÉATION DU PAIEMENT...');
          
          // Vérifier que le panier n'est pas vide
          if (totalAmount <= 0) {
            throw new Error('Le panier est vide. Impossible de procéder au paiement.');
          }
          
          // Sauvegarder le montant du panier pour éviter les problèmes si le panier est vidé
          const cartTotalAmount = totalAmount;
          
          // Récupérer le montant total du panier
          let cartTotal = totalAmount;
          console.log('MONTANT DU PANIER:', cartTotal);
          
          // Calculer la TVA (5%)
          const calculatedTVA = Math.round(cartTotal * 0.05);
          console.log('TVA CALCULÉE (5%):', calculatedTVA);
          
          // Ajouter les frais de livraison uniquement pour les commandes de type DELIVERY
          const deliveryFee = activeType === OrderType.DELIVERY ? 1000 : 0;
          console.log('FRAIS DE LIVRAISON:', deliveryFee);
          
          // Calculer le montant total avec précision
          const calculatedTotal = cartTotal + calculatedTVA + deliveryFee;
          console.log('TOTAL CALCULÉ (panier + TVA + livraison):', calculatedTotal);
          
          // Arrondir au franc supérieur pour éviter les problèmes de décimales
          const paymentAmount = Math.ceil(calculatedTotal);
          console.log('MONTANT FINAL ENVOYÉ AU PAIEMENT:', paymentAmount);
          
          const paymentData: CreatePaymentDto = {
            amount: paymentAmount,
            order_id: orderId,
            mode: selectedPayment === "card" ? "CREDIT_CARD" : "MOBILE_MONEY",
            mobile_money_type: selectedPayment?.toUpperCase() as any,
            status: "PENDING",
            reference: `PAY-${Date.now()}`
          };
          
          console.log('DONNÉES PAIEMENT:', JSON.stringify(paymentData, null, 2));
          
          try {
            const paymentResponse = await createPayment(paymentData);
            console.log('PAIEMENT CRÉÉ:', JSON.stringify(paymentResponse, null, 2));
            setPaymentId(paymentResponse.id);
          } catch (error) {
            console.log('ERREUR PAIEMENT:', error);
            // On continue quand même car la commande est créée
          }
        } else {
          console.log('PAYMENT ID EXISTANT:', paymentId);
        }
        
        console.log('PROCESSUS TERMINÉ AVEC SUCCÈS');
        setCurrentStep("success");
        // Vider le panier seulement après avoir créé le paiement avec succès
        clearCart();
      } else {
        console.log('ERREUR: Création de la commande échouée');
        throw new Error("Erreur lors de la création de la commande");
      }
    } catch (err: any) {
      console.log('ERREUR FINALE:', err.message);
      setOrderError(err.message || "Erreur lors du paiement");
      setCurrentStep("failed");
    } finally {
      setProcessingOrder(false);
      console.log('=== FIN DU PROCESSUS DE PAIEMENT ===');
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const handleConfirmPayment = async () => {
    console.log('🔄 Début du processus de paiement...');
    setShowConfirmationModal(false);
    setProcessing(true);
    
    try {
      if (!selectedPayment) {
        console.log('❌ Aucun moyen de paiement sélectionné');
        throw new Error("Veuillez sélectionner un moyen de paiement");
      }

      console.log('Moyen de paiement sélectionné:', selectedPayment);

      if (["orange", "mtn", "moov", "wave"].includes(selectedPayment)) {
        console.log('💳 Préparation du paiement...');
        
        // Vérification des données requises
        if (!user) {
          throw new Error("Utilisateur non connecté");
        }

        if (!user.email) {
          throw new Error("Email utilisateur manquant");
        }

        if (!phoneNumber || phoneNumber.length !== 10) {
          throw new Error("Numéro de téléphone invalide");
        }

        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        if (!fullName) {
          throw new Error("Nom utilisateur manquant");
        }

        const paymentAmount = Math.ceil(finalTotal);
        if (!paymentAmount || paymentAmount <= 0) {
          throw new Error("Montant invalide");
        }

        // Log des données avant envoi
        console.log('Données de paiement:', {
          amount: paymentAmount,
          phone: phoneNumber,
          email: user.email,
          name: fullName
        });
        
        // Construire l'URL de paiement avec les paramètres
        const url = `https://chicken-nation-dashboard.vercel.app/payment?amount=${paymentAmount}&phone=${phoneNumber}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(fullName)}`;
        
        console.log('URL de paiement:', url);
        
        // Stocker l'URL et afficher le modal
        setPaymentUrl(url);
        setShowPaymentModal(true);
        return;
      }

      console.log('Création de la commande pour les autres moyens de paiement...');
      await handleProceedPayment();
    } catch (err: any) {
      console.error('❌ ERREUR LORS DU PROCESSUS DE PAIEMENT:', err.message);
      setPaymentError(err.message || "Erreur lors du paiement");
      setCurrentStep("failed");
      setSelectedPayment(null);
    } finally {
      setProcessing(false);
      console.log('Fin du processus de paiement');
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
            setCurrentStep("payment");  
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

      {/* Modal de paiement */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-white rounded-t-3xl">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Image
                  source={require("@/assets/icons/arrow-back.png")}
                  className="w-6 h-6"
                />
              </TouchableOpacity>
              <Text className="text-lg font-sofia-medium">Paiement</Text>
              <View className="w-6" />
            </View>
            <WebView
              source={{ uri: paymentUrl }}
              style={{ flex: 1 }}
              onNavigationStateChange={(navState) => {
                // Gérer la réponse du serveur de paiement ici
                if (navState.url.includes('success')) {
                  setShowPaymentModal(false);
                  setCurrentStep("success");
                  clearCart();
                } else if (navState.url.includes('error')) {
                  setShowPaymentModal(false);
                  setCurrentStep("failed");
                }
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Checkout;
