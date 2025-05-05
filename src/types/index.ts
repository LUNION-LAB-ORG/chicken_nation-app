/**
 * Représente une catégorie de produits dans le menu
 * @property id - Identifiant unique de la catégorie
 * @property name - Nom de la catégorie
 * @property description - Description optionnelle de la catégorie
 * @property promo - Tag promotionnel optionnel
 * @property image - Image associée à la catégorie
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  promo?: string;
  image?: any;
}

/**
 * Représente un supplément disponible pour un produit
 * @property id - Identifiant unique du supplément
 * @property name - Nom du supplément
 * @property price - Prix du supplément en FCFA
 * @property isAvailable - Indique si le supplément est disponible
 * @property isSelected - État de sélection du supplément
 */
export interface Supplement {
  id: string;
  name: string;
  price: string;
  isAvailable: boolean;
  isSelected?: boolean;
}

/**
 * Définit un type de supplément pour un produit
 * @property type - Catégorie du supplément (Boissons, Sauces, etc.)
 * @property items - Liste des suppléments disponibles
 * @property required - Indique si le choix d'un supplément est obligatoire
 */
export interface ProductSupplement {
  type: "BOISSONS" | "SAUCES" | "PETITE OU GROSSE FAIM";
  items: Supplement[];
  required?: boolean;
}

/**
 * Représente un avis client sur un produit
 * @property id - Identifiant unique de l'avis
 * @property userId - Identifiant de l'utilisateur ayant laissé l'avis
 * @property productId - Identifiant du produit concerné
 * @property rating - Note donnée (sur 5)
 * @property comment - Commentaire de l'avis
 * @property date - Date de publication de l'avis
 * @property likes - Nombre de "j'aime" sur l'avis
 */
export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  date: string;
  likes?: number;
}

/**
 * Représente l'historique d'une commande
 * @property id - Identifiant unique de la commande
 * @property userId - Identifiant de l'utilisateur
 * @property restaurantId - Identifiant du restaurant
 * @property items - Articles commandés avec leurs quantités et suppléments
 * @property total - Montant total de la commande
 * @property status - État actuel de la commande
 * @property date - Date de la commande
 * @property deliveryAddress - Adresse de livraison
 * @property paymentMethod - Méthode de paiement utilisée
 */
export interface OrderHistory {
  id: string;
  userId: string;
  restaurantId: string;
  items: {
    productId: string;
    quantity: number;
    supplements?: {
      [key: string]: string[];
    };
  }[];
  total: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  date: string;
  deliveryAddress?: string;
  paymentMethod: "cash" | "card" | "mobile_money";
}

/**
 * Représente une notification envoyée à l'utilisateur
 * @property id - Identifiant unique de la notification
 * @property userId - Identifiant de l'utilisateur destinataire
 * @property icon - Icône de la notification
 * @property iconBgColor - Couleur de fond de l'icône
 * @property title - Titre de la notification
 * @property date - Date de la notification
 * @property time - Heure de la notification
 * @property message - Contenu de la notification
 * @property type - Type de notification (commande, promo, etc.)
 * @property isRead - État de lecture de la notification
 * @property showChevron - Affichage de la flèche de navigation
 * @property notifBanner - Bannière de la notification
 * @property notifTitle - Titre spécifique pour la bannière
 * @property data - Données supplémentaires selon le type
 */
export interface Notification {
  id: string;
  userId: string;
  icon: any;
  iconBgColor: string;
  title: string;
  date: string;
  time: string;
  message: string;
  type: "order" | "promo" | "info" | "payment" | "account";
  isRead: boolean;
  showChevron?: boolean;
  notifBanner: any;
  notifTitle: string;
  data?: {
    orderId?: string;
    promoId?: string;
    serviceId?: string;
    paymentMethodId?: string;
    userId?: string;
  };
}

/**
 * Configuration des paramètres de notification
 * @property orderUpdates - Paramètres des notifications de commande
 * @property promotions - Paramètres des notifications promotionnelles
 * @property newsletter - Paramètres de la newsletter
 * @property pushNotifications - Paramètres des notifications push
 */
export interface NotificationSettings {
  orderUpdates: {
    enabled: boolean;
    preferences: {
      orderConfirmation: boolean;
      orderPreparation: boolean;
      orderReady: boolean;
      deliveryStatus: boolean;
      orderDelivered: boolean;
      orderCancelled: boolean;
    };
    channels: {
      inApp: boolean;
      email: boolean;
      sms: boolean;
    };
  };
  promotions: {
    enabled: boolean;
    preferences: {
      dailyDeals: boolean;
      weekendSpecials: boolean;
      newItems: boolean;
      specialEvents: boolean;
      personalizedOffers: boolean;
    };
    frequency: "daily" | "weekly" | "monthly" | "never";
    channels: {
      inApp: boolean;
      email: boolean;
      sms: boolean;
    };
  };
  newsletter: {
    enabled: boolean;
    preferences: {
      newsAndUpdates: boolean;
      recipes: boolean;
      tips: boolean;
      events: boolean;
    };
    frequency: "weekly" | "monthly" | "never";
    channels: {
      email: boolean;
    };
  };
  pushNotifications: {
    enabled: boolean;
    preferences: {
      sound: boolean;
      vibration: boolean;
      banner: boolean;
      lockScreen: boolean;
    };
    quiet_hours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

/**
 * Représente un utilisateur de l'application
 * @property id - Identifiant unique de l'utilisateur
 * @property firstName - Prénom
 * @property lastName - Nom
 * @property username - Nom d'utilisateur
 * @property email - Adresse email
 * @property phone - Numéro de téléphone
 * @property password - Mot de passe
 * @property profilePicture - Photo de profil
 * @property favorites - Restaurants et menus favoris
 * @property addresses - Adresses de livraison
 * @property notificationPreferences - Préférences de notification
 * @property orderHistory - Historique des commandes
 * @property reviews - Avis laissés par l'utilisateur
 * @property notifications - Notifications reçues
 * @property notificationSettings - Paramètres de notification
 * @property createdAt - Date de création du compte
 * @property lastLogin - Dernière connexion
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  profilePicture: any;
  favorites: {
    restaurants: string[];
    products: string[];
  };
  addresses: {
    id: string;
    name: string;
    address: string;
    details?: string;
    isDefault: boolean;
  }[];
  notificationPreferences: {
    specialOffers: boolean;
    promotion: boolean;
    orders: boolean;
    appUpdates: boolean;
    newService: boolean;
  };
  orderHistory: OrderHistory[];
  reviews: string[];
  notifications: Notification[];
  notificationSettings: NotificationSettings;
  createdAt: string;
  lastLogin: string;
}

/**
 * Représente un élément de supplément
 * @property id - Identifiant unique de l'élément
 * @property name - Nom de l'élément
 * @property price - Prix de l'élément
 * @property isAvailable - Disponibilité de l'élément
 */
interface SupplementItem {
  id: string;
  name: string;
  price: string;
  isAvailable: boolean;
}

/**
 * Définit un type de supplément avec ses caractéristiques
 * @property type - Type de supplément
 * @property items - Liste des éléments du supplément
 * @property isIncluded - Indique si le supplément est inclus dans le prix
 * @property required - Indique si le choix est obligatoire
 */
interface SupplementType {
  type: string;
  items: SupplementItem[];
  isIncluded?: boolean;
  required?: boolean;
}

/**
 * Représente un article du menu
 * @property id - Identifiant unique de l'article
 * @property name - Nom de l'article
 * @property description - Description de l'article
 * @property restaurant - Nom du restaurant
 * @property restaurantId - Identifiant du restaurant
 * @property price - Prix de l'article
 * @property rating - Note moyenne
 * @property categoryId - Catégorie de l'article
 * @property isAvailable - Disponibilité de l'article
 * @property isNew - Indique si l'article est nouveau
 * @property ingredients - Liste des ingrédients
 * @property image - Image de l'article
 * @property supplements - Suppléments disponibles
 * @property reviews - Liste des avis
 * @property totalReviews - Nombre total d'avis
 * @property discountedPrice - Prix après réduction
 * @property originalPrice - Prix avant réduction
 * @property isPromotion - Indique si l'article est en promotion
 * @property favorite_id - ID du favori (utilisé pour la suppression)
 */
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  restaurant: string;
  restaurantId: string;
  price: string;
  rating: number;
  categoryId: string;
  isAvailable: boolean;
  isNew?: boolean;
  ingredients?: string[];
  image: any;
  supplements: {
    boissons?: SupplementType;
    sauces?: SupplementType;
    portions?: SupplementType;
  };
  reviews: string[];
  totalReviews: number;
  discountedPrice?: string;
  originalPrice?: string;
  isPromotion?: boolean;
  favorite_id?: string; // ID du favori pour la suppression
}

/**
 * Représente les horaires d'ouverture
 * @property day - Jour de la semaine
 * @property openingTime - Heure d'ouverture
 * @property closingTime - Heure de fermeture
 */
export interface Schedule {
  day:
    | "Lundi"
    | "Mardi"
    | "Mercredi"
    | "Jeudi"
    | "Vendredi"
    | "Samedi"
    | "Dimanche";
  openingTime: string;
  closingTime: string;
}

/**
 * Représente un restaurant
 * @property id - Identifiant unique du restaurant
 * @property name - Nom du restaurant
 * @property description - Description du restaurant
 * @property address - Adresse du restaurant
 * @property location - Localisation
 * @property phone - Numéro de téléphone
 * @property email - Adresse email
 * @property isOpen - État d'ouverture
 * @property closingTime - Heure de fermeture
 * @property openingTime - Heure d'ouverture
 * @property deliveryStartTime - Début des livraisons
 * @property deliveryEndTime - Fin des livraisons
 * @property image - Image du restaurant
 * @property latitude - Latitude géographique
 * @property longitude - Longitude géographique
 * @property schedule - Horaires d'ouverture
 * @property tables - Configuration des tables
 * @property reservationTimeSlots - Créneaux de réservation
 * @property maxReservationSize - Taille max de réservation
 * @property minReservationSize - Taille min de réservation
 * @property reservationLeadHours - Délai min de réservation
 * @property reservationMaxDays - Délai max de réservation
 * @property reservationSettings - Paramètres de réservation
 */
export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  location: string;
  phone: string;
  email?: string;
  isOpen: boolean;
  closingTime?: string;
  openingTime?: string;
  deliveryStartTime: string;
  deliveryEndTime?: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  schedule: Schedule[];
  tables: {
    capacity: number;
    quantity: number;
    type: "indoor" | "outdoor" | "smoking" | "non-smoking";
  }[];
  reservationTimeSlots: string[];
  maxReservationSize: number;
  minReservationSize: number;
  reservationLeadHours: number;
  reservationMaxDays: number;
  reservationSettings?: {
    timeSlots: string[];
    maxSize: number;
    minSize: number;
    leadHours: number;
    maxDays: number;
  };
}

export interface TableReservation {
  id: string;
  userId: string;
  restaurantId: string;
  date: string;
  time: string;
  numberOfPeople: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  occasion?: "birthday" | "anniversary" | "business" | "other";
  tablePreference?: "rounded" | "rectangle" | "long";
  createdAt: string;
  updatedAt?: string;
}

export interface PromoDetails {
  discount: number;
  validUntil: string;
  originalPrices: {
    [menuId: string]: string;  
  };
}

export interface PromoBanner {
  id: string;
  background: any;
  image: any;
  percentText: string;
  mainText: string;
  subText: string;
  color?: string;
  offerId: string;
  menuIds: string[]; // IDs des menus concernés par l'offre
  promoDetails: PromoDetails;
}

export interface PromoCode {
  code: string;
  discount: number;
  type: "percent" | "fixed";
  validUntil: string;
  description: string;
  minOrderValue?: number;
  maxDiscount?: number;
  isReusable?: boolean;
  isFirstOrderOnly?: boolean;
  restrictions?: {
    categoryIds?: string[];
    productIds?: string[];
    restaurantIds?: string[];
  };
}
