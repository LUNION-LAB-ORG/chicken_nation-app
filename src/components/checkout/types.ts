export type PaymentMethod = "orange" | "momo" | "moov" | "wave" | "card";
export type CheckoutStep =
  | "recap"
  | "payment"
  | "confirmation"
  | "success"
  | "failed"
  | "network_error"
  | "addcreditcard"
  | "creditcardpreview";

export type KeypadKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";

export type CreditCardData = {
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

export const paymentMethods = [
  {
    id: "orange" as PaymentMethod,
    name: "Orange Money",
    icon: require("@/assets/icons/payments/orange.png"),
  },
  {
    id: "momo" as PaymentMethod,
    name: "MTN Mobile Money",
    icon: require("@/assets/icons/payments/momo.png"),
  },
  {
    id: "moov" as PaymentMethod,
    name: "Moov Money",
    icon: require("@/assets/icons/payments/moov.png"),
  },
  {
    id: "wave" as PaymentMethod,
    name: "Wave",
    icon: require("@/assets/icons/payments/wave.png"),
  },
  {
    id: "card" as PaymentMethod,
    name: "Carte de crédit prépayée",
    icon: require("@/assets/icons/payments/visa.png"),
  },
];

export const keypadMapping = {
  "1": "",
  "2": "ABC",
  "3": "DEF",
  "4": "GHI",
  "5": "JKL",
  "6": "MNO",
  "7": "PQRS",
  "8": "TUV",
  "9": "WXYZ",
};
