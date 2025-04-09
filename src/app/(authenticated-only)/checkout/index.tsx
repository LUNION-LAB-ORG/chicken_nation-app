import React, { useState, useRef } from "react";
import { View, Text, Image, TouchableOpacity, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { useRouter } from "expo-router";
import useCartStore from "@/store/cartStore";
import { useLocation } from "@/app/context/LocationContext";
import {
  PaymentMethod,
  CheckoutStep,
  CreditCardData,
  KeypadKey,
  RecapStep,
  PaymentStep,
  ConfirmationStep,
  PhoneModal,
  ConfirmationModal,
  AddCreditCardStep,
  CreditCardPreviewStep,
  SuccessStep,
  FailedStep,
  NetworkErrorStep,
} from "@/components/checkout";

const Checkout = () => {
  const router = useRouter();
  const { items, totalAmount } = useCartStore();
  const { locationData } = useLocation();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("recap");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null,
  );
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ creditCardData, setCreditCardData] = useState<CreditCardData>({
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  // Refs pour les inputs de carte de crédit
  const cardHolderRef = useRef<TextInput>(null);
  const cardNumberRef = useRef<TextInput>(null);
  const expiryDateRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);

  // Calcul des totaux
  const calculatedTVA = totalAmount * 0.05;
  const deliveryFee = 1000;
  const finalTotal = totalAmount + calculatedTVA + deliveryFee;

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
    } else if (currentStep === "payment" && selectedPayment) {
      setCurrentStep("confirmation");
    } else if (currentStep === "confirmation") {
      setShowConfirmationModal(true);
    }
  };

  const handleProceedPayment = () => {
    setShowConfirmationModal(false);
    setCurrentStep("success");
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
          onCancel={() => router.push("/(tabs-user)/")}
          onRetry={() => router.back()}
        />
      )}

      {currentStep === "network_error" && (
        <NetworkErrorStep
          onCancel={() => router.push("/(tabs-user)/")}
          onRetry={() => router.back()}
        />
      )}

      <PhoneModal
        visible={showPhoneModal}
        phoneNumber={phoneNumber}
        onClose={() => {
          setShowPhoneModal(false);
          setPhoneNumber("");
        }}
        onConfirm={() => {
          if (phoneNumber.length === 10) {
            setShowPhoneModal(false);
            setCurrentStep("confirmation");
          }
        }}
        onNumberPress={handleNumberPress}
        onDelete={handleDelete}
      />

      <ConfirmationModal
        visible={showConfirmationModal}
        selectedPayment={selectedPayment}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleProceedPayment}
      />
    </View>
  );
};

export default Checkout;
