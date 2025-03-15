import {
  Category,
  MenuItem,
  Restaurant,
  Review,
  TableReservation,
  User,
  PromoBanner,
  PromoCode,
} from "@/types";

// Données des catégories
export const categories: Category[] = [
  {
    id: "cat1",
    name: "LES POULETS GRILLÉS",
    promo: "Poulet",
    description: "Nos délicieux poulets grillés",
    image: require("../assets/images/pouletgrille.png"),
  },
  {
    id: "cat2",
    name: "LUNCHS",
    promo: "Déjeuner",
    description: "Nos menus du midi",
    image: require("../assets/images/lunch.png"),
  },
  {
    id: "cat3",
    name: "PLATS",
    description: "Nos plats signature",
    image: require("../assets/images/seau.png"),
  },
  {
    id: "cat4",
    name: "BURGERS & SANDWICHS",
    promo: "Burger",
    description: "Nos burgers et sandwichs maison",
    image: require("../assets/images/burger4.png"),
  },
  {
    id: "cat5",
    name: "SUPPLEMENTS",
    description: "Accompagnements et extras",
    image: require("../assets/images/supplements.png"),
  },
  {
    id: "cat6",
    name: "BOISSONS",
    promo: "Boisson",
    description: "Boissons fraîches et chaudes",
    image: require("../assets/images/boissons.png"),
  },
  {
    id: "cat7",
    name: "SAUCES",
    description: "Nos sauces maison",
    image: require("../assets/images/mix.png"),
  },
];

// Données des restaurants avec réservations
export const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "CHICKEN NATION ANGRÉ",
    description: "Le meilleur du poulet à Angré",
    address: "Boulevard Arsène Usher Assouan, Abidjan",
    location: "Côte d'Ivoire",
    phone: "+225 0707070707",
    email: "angre@chickennation.ci",
    isOpen: true,
    closingTime: "23:00",
    openingTime: "10:30",
    deliveryStartTime: "10:30",
    deliveryEndTime: "22:30",
    latitude: 5.3969,
    longitude: -4.0305,
    schedule: [
      { day: "Lundi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Mardi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Mercredi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Jeudi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Vendredi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Samedi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Dimanche", openingTime: "10:30", closingTime: "23:00" },
    ],
    tables: [
      {
        capacity: 2,
        quantity: 8,
        type: "indoor",
      },
      {
        capacity: 4,
        quantity: 6,
        type: "indoor",
      },
      {
        capacity: 6,
        quantity: 4,
        type: "indoor",
      },
      {
        capacity: 4,
        quantity: 4,
        type: "outdoor",
      },
    ],
    reservationTimeSlots: [
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
    ],
    maxReservationSize: 12,
    minReservationSize: 1,
    reservationLeadHours: 2,
    reservationMaxDays: 30,
    reservationSettings: {
      timeSlots: [
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "19:00",
        "19:30",
        "20:00",
        "20:30",
        "21:00",
      ],
      maxSize: 12,
      minSize: 1,
      leadHours: 2,
      maxDays: 30,
    },
  },
  {
    id: "2",
    name: "CHICKEN NATION ZONE 4",
    description: "Votre restaurant préféré en Zone 4",
    address: "Rue du Canal, Abidjan",
    location: "Côte d'Ivoire",
    phone: "+225 0707070707",
    email: "zone4@chickennation.ci",
    isOpen: false,
    openingTime: "11:00",
    closingTime: "23:00",
    deliveryStartTime: "11:30",
    deliveryEndTime: "22:30",
    latitude: 5.301,
    longitude: -4.0171,
    schedule: [
      { day: "Lundi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Mardi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Mercredi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Jeudi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Vendredi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Samedi", openingTime: "10:30", closingTime: "23:00" },
      { day: "Dimanche", openingTime: "10:30", closingTime: "23:00" },
    ],
    tables: [
      {
        capacity: 2,
        quantity: 8,
        type: "indoor",
      },
      {
        capacity: 4,
        quantity: 6,
        type: "indoor",
      },
      {
        capacity: 6,
        quantity: 4,
        type: "indoor",
      },
      {
        capacity: 4,
        quantity: 4,
        type: "outdoor",
      },
    ],
    reservationTimeSlots: [
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
    ],
    maxReservationSize: 12,
    minReservationSize: 1,
    reservationLeadHours: 2,
    reservationMaxDays: 30,
    reservationSettings: {
      timeSlots: [
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "19:00",
        "19:30",
        "20:00",
        "20:30",
        "21:00",
      ],
      maxSize: 12,
      minSize: 1,
      leadHours: 2,
      maxDays: 30,
    },
  },
];

// Données des réservations
export const reservations: TableReservation[] = [
  {
    id: "res1",
    userId: "user1",
    restaurantId: "1",
    date: "2024-01-20",
    time: "19:30",
    numberOfPeople: 4,
    status: "confirmed",
    specialRequests: "Table près de la fenêtre si possible",
    occasion: "anniversary",
    tablePreference: "rounded",
    createdAt: "2024-01-15T10:00:00",
  },
  {
    id: "res2",
    userId: "user2",
    restaurantId: "1",
    date: "2024-01-21",
    time: "12:30",
    numberOfPeople: 2,
    status: "pending",
    occasion: "business",
    tablePreference: "rectangle",
    createdAt: "2024-01-15T14:30:00",
  },
];

// Données des utilisateurs
export const users: User[] = [
  {
    id: "user1",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    phone: "+225 0101010101",
    password: "hashedPassword123",
    profilePicture: require("../assets/images/profile.png"),
    favorites: {
      restaurants: ["1"],
      products: ["1", "4"],
    },
    addresses: [
      {
        id: "addr1",
        name: "Maison",
        address: "Cocody Angré 7ème tranche",
        details: "Près de la pharmacie",
        isDefault: true,
      },
    ],
    notificationPreferences: {
      specialOffers: true,
      promotion: false,
      orders: true,
      appUpdates: true,
      newService: false,
    },
    orderHistory: [
      {
        id: "order1",
        userId: "user1",
        restaurantId: "1",
        items: [
          {
            productId: "1",
            quantity: 2,
          },
          {
            productId: "4",
            quantity: 1,
          }
        ],
        total: "15500",
        status: "pending",
        date: "2024-03-20T10:30:00",
        deliveryAddress: "Cocody Angré 7ème tranche",
        paymentMethod: "mobile_money",
      },
      {
        id: "order2",
        userId: "user1",
        restaurantId: "1",
        items: [
          {
            productId: "2",
            quantity: 1,
          }
        ],
        total: "6000",
        status: "delivered",
        date: "2024-03-19T15:45:00",
        deliveryAddress: "Cocody Angré 7ème tranche",
        paymentMethod: "card",
      },
      {
        id: "order3",
        userId: "user1",
        restaurantId: "1",
        items: [
          {
            productId: "3",
            quantity: 2,
          }
        ],
        total: "9000",
        status: "cancelled",
        date: "2024-03-18T09:15:00",
        deliveryAddress: "Cocody Angré 7ème tranche",
        paymentMethod: "mobile_money",
      },
      {
        id: "order4",
        userId: "user1",
        restaurantId: "1",
        items: [
          {
            productId: "1",
            quantity: 1,
          },
          {
            productId: "5",
            quantity: 2,
          }
        ],
        total: "9000",
        status: "delivered",
        date: "2024-03-20T11:00:00",
        deliveryAddress: "Cocody Angré 7ème tranche",
        paymentMethod: "card",
      }
    ],
    reviews: ["review1", "review2"],
    notifications: [
      {
        id: "notif1",
        userId: "user1",
        icon: require("../assets/icons/notifications/order-successful.png"),
        iconBgColor: "#E6FFE6",
        title: "Commande livrée",
        message: "Votre commande #order1 a été livrée avec succès",
        type: "order",
        isRead: false,
        date: "2024-01-15",
        time: "14:35",
        notifBanner: require("../assets/images/promo.png"),
        notifTitle: "Détails de la livraison",
        data: {
          orderId: "order1",
        },
      },
      {
        id: "notif2",
        userId: "user1",
        icon: require("../assets/icons/notifications/new-info.png"),
        iconBgColor: "#FFE6E6",
        title: "Offre spéciale",
        message: "-20% sur tous les poulets ce weekend !",
        type: "promo",
        isRead: true,
        date: "2024-01-14",
        time: "10:00",
        notifBanner: require("../assets/images/promo.png"),
        notifTitle: "Promotion du weekend",
        data: {
          promoId: "promo1",
        },
      },
    ],
    notificationSettings: {
      orderUpdates: {
        enabled: true,
        preferences: {
          orderConfirmation: true,
          orderPreparation: true,
          orderReady: true,
          deliveryStatus: true,
          orderDelivered: true,
          orderCancelled: true,
        },
        channels: {
          inApp: true,
          email: true,
          sms: true,
        },
      },
      promotions: {
        enabled: true,
        preferences: {
          dailyDeals: true,
          weekendSpecials: true,
          newItems: true,
          specialEvents: true,
          personalizedOffers: true,
        },
        frequency: "weekly",
        channels: {
          inApp: true,
          email: true,
          sms: false,
        },
      },
      newsletter: {
        enabled: false,
        preferences: {
          newsAndUpdates: false,
          recipes: true,
          tips: true,
          events: false,
        },
        frequency: "monthly",
        channels: {
          email: true,
        },
      },
      pushNotifications: {
        enabled: true,
        preferences: {
          sound: true,
          vibration: true,
          banner: true,
          lockScreen: true,
        },
        quiet_hours: {
          enabled: true,
          start: "22:00",
          end: "07:00",
        },
      },
    },
    createdAt: "2024-01-01T10:00:00",
    lastLogin: "2024-01-15T15:00:00",
  },
  {
    id: "user2",
    firstName: "Marie",
    lastName: "Konan",
    username: "mariek",
    email: "marie.k@example.com",
    phone: "+225 0202020202",
    password: "hashedPassword456",
    profilePicture: require("../assets/images/profile.png"),
    favorites: {
      restaurants: ["2"],
      products: ["2", "3"],
    },
    addresses: [
      {
        id: "addr2",
        name: "Bureau",
        address: "Plateau, Avenue de la République",
        details: "Immeuble Alpha 2000",
        isDefault: true,
      },
    ],
    notificationPreferences: {
      specialOffers: false,
      promotion: true,
      orders: true,
      appUpdates: false,
      newService: true,
    },
    orderHistory: [],
    reviews: ["review3"],
    notifications: [],
    notificationSettings: {
      orderUpdates: {
        enabled: true,
        preferences: {
          orderConfirmation: true,
          orderPreparation: true,
          orderReady: true,
          deliveryStatus: true,
          orderDelivered: true,
          orderCancelled: true,
        },
        channels: {
          inApp: true,
          email: false,
          sms: true,
        },
      },
      promotions: {
        enabled: true,
        preferences: {
          dailyDeals: false,
          weekendSpecials: true,
          newItems: true,
          specialEvents: false,
          personalizedOffers: true,
        },
        frequency: "daily",
        channels: {
          inApp: true,
          email: false,
          sms: true,
        },
      },
      newsletter: {
        enabled: false,
        preferences: {
          newsAndUpdates: false,
          recipes: false,
          tips: false,
          events: false,
        },
        frequency: "never",
        channels: {
          email: false,
        },
      },
      pushNotifications: {
        enabled: true,
        preferences: {
          sound: false,
          vibration: true,
          banner: true,
          lockScreen: false,
        },
        quiet_hours: {
          enabled: false,
          start: "23:00",
          end: "06:00",
        },
      },
    },
    createdAt: "2024-01-02T11:00:00",
    lastLogin: "2024-01-15T16:00:00",
  },
];

// Données des avis
export const reviews: Review[] = [
  {
    id: "review1",
    userId: "user1",
    productId: "1",
    rating: 5,
    comment: "Excellent poulet, très bien assaisonné !",
    date: "2024-01-14T12:00:00",
    likes: 3,
  },
  {
    id: "review2",
    userId: "user1",
    productId: "4",
    rating: 4,
    comment: "Très bon burger, mais un peu cher",
    date: "2024-01-13T15:30:00",
    likes: 1,
  },
  {
    id: "review3",
    userId: "user2",
    productId: "2",
    rating: 5,
    comment: "Les épices sont parfaites, je recommande !",
    date: "2024-01-15T18:45:00",
    likes: 4,
  },
];

// Données des suppléments
export const supplements = {
  boissons: {
    type: "BOISSONS",
    items: [
      {
        id: "drink1",
        name: "Coca Cola 33cl",
        price: "1000",
        isAvailable: true,
      },
      {
        id: "drink2",
        name: "Fanta 33cl",
        price: "1000",
        isAvailable: true,
      },
    ],
  },
  sauces: {
    type: "SAUCES",
    items: [
      {
        id: "sauce1",
        name: "Sauce Piquante",
        price: "500",
        isAvailable: true,
      },
      {
        id: "sauce2",
        name: "Sauce BBQ",
        price: "500",
        isAvailable: true,
      },
    ],
  },
  portions: {
    type: "PETITE OU GROSSE FAIM",
    items: [
      {
        id: "portion1",
        name: "Double portion",
        price: "2000",
        isAvailable: true,
      },
    ],
  },
};

// Données des menus
export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "CHICKEN DAYS NORMAL",
    description: "Notre délicieux poulet dans sa version classique",
    restaurant: "CHICKEN NATION ANGRÉ",
    restaurantId: "1",
    price: "6000",
    rating: 4.5,
    categoryId: "cat1",
    isAvailable: true,
    isNew: true,
    ingredients: ["Poulet", "Épices maison", "Frites"],
    image: require("../assets/images/food.png"),
    supplements: {
      boissons: {
        ...supplements.boissons,
        isIncluded: true, // Les boissons sont incluses dans ce menu
        required: true,
      },
      sauces: {
        ...supplements.sauces,
        isIncluded: false, // Les sauces sont en supplément
      },
      portions: {
        ...supplements.portions,
        isIncluded: false, // Les portions sont en supplément
      },
    },
    reviews: ["review1"],
    totalReviews: 1,
  },
  {
    id: "2",
    name: "CHICKEN DAYS EPICE",
    description: "Notre poulet signature avec un mélange d'épices spéciales",
    restaurant: "CHICKEN NATION ANGRÉ",
    restaurantId: "1",
    price: "6000",
    rating: 4.8,
    categoryId: "cat1",
    isAvailable: true,
    ingredients: ["Poulet", "Mélange d'épices spéciales", "Frites"],
    image: require("../assets/images/food.png"),
    supplements: {
      boissons: {
        ...supplements.boissons,
        isIncluded: false, // Les boissons sont en supplément
      },
      sauces: {
        ...supplements.sauces,
        isIncluded: false, // Les sauces sont en supplément
      },
      portions: {
        ...supplements.portions,
        isIncluded: false, // Les portions sont en supplément
      },
    },
    reviews: ["review3"],
    totalReviews: 1,
  },
  {
    id: "3",
    name: "LUNCH POULET",
    description: "Menu du midi avec poulet grillé",
    restaurant: "CHICKEN NATION ANGRÉ",
    restaurantId: "1",
    price: "4500",
    rating: 4.2,
    categoryId: "cat2",
    isAvailable: true,
    ingredients: ["Poulet grillé", "Riz", "Sauce", "Boisson"],
    image: require("../assets/images/food.png"),
    supplements: {
      boissons: {
        ...supplements.boissons,
        isIncluded: false,
      },
      sauces: {
        ...supplements.sauces,
        isIncluded: false,
      },
    },
    reviews: [],
    totalReviews: 0,
  },
  {
    id: "4",
    name: "BURGER CHICKEN",
    description: "Burger avec filet de poulet croustillant",
    restaurant: "CHICKEN NATION ANGRÉ",
    restaurantId: "1",
    price: "3500",
    rating: 4.0,
    categoryId: "cat4",
    isAvailable: true,
    ingredients: ["Pain burger", "Filet de poulet", "Salade", "Sauce spéciale"],
    image: require("../assets/images/food.png"),
    supplements: {
      sauces: {
        ...supplements.sauces,
        isIncluded: false, // Les sauces sont en supplément
      },
    },
    reviews: ["review2"],
    totalReviews: 1,
  },
  {
    id: "5",
    name: "FRITES",
    description: "Portion de frites croustillantes",
    restaurant: "CHICKEN NATION ANGRÉ",
    restaurantId: "1",
    price: "1500",
    rating: 3.8,
    categoryId: "cat5",
    isAvailable: true,
    ingredients: ["Pommes de terre"],
    image: require("../assets/images/food.png"),
    supplements: {
      sauces: {
        ...supplements.sauces,
        isIncluded: false, // Les sauces sont en supplément
      },
    },
    reviews: [],
    totalReviews: 0,
  },
  {
    id: "6",
    name: "COCA COLA",
    description: "Coca Cola 33cl",
    restaurant: "CHICKEN NATION ANGRÉ",
    restaurantId: "1",
    price: "1000",
    rating: 4.5,
    categoryId: "cat6",
    isAvailable: true,
    image: require("../assets/images/food.png"),
    supplements: {},
    reviews: [],
    totalReviews: 0,
  },
  {
    id: "7",
    name: "SAUCE PIQUANTE",
    description: "Notre sauce piquante maison",
    restaurant: "CHICKEN NATION ANGRÉ",
    restaurantId: "1",
    price: "500",
    rating: 4.7,
    categoryId: "cat7",
    isAvailable: true,
    image: require("../assets/images/food.png"),
    supplements: {},
    reviews: [],
    totalReviews: 0,
  },
];

/**
 * Données des bannières promotionnelles
 */
export const promoBanners: PromoBanner[] = [
  {
    id: "banner1",
    background: require("../assets/images/offer-banner.png"),
    image: require("../assets/images/burgerbanner.png"),
    percentText: "30%",
    mainText: "DE RÉDUCTION DE PLUS \nDE TROIS COMMANDES",
    subText: "Seulement sur l'appli \nvalable jusqu'au 28 février",
    color: "white",
    offerId: "offer1",
    menuIds: ["1", "2", "4"], // IDs des menus concernés par cette offre
    promoDetails: {
      discount: 30,
      validUntil: "2024-02-28",
      originalPrices: {
        "1": menuItems[0].price,  
        "2": menuItems[1].price, 
        "4": menuItems[3].price, 
      },
    },
  },
  
  {
    id: "banner2",
    background: require("../assets/images/offer-banner2.png"),
    image: require("../assets/images/chicken-bucket.png"),
    percentText: "15%",
    mainText: "DE RÉDUCTION SUR \nTOUTES LES FAMILIAUX",
    subText: "Seulement sur l'appli \nvalable jusqu'au 28 février",
    color: "white",
    offerId: "offer2",
    menuIds: ["1", "2"], // IDs des menus concernés
    promoDetails: {
      discount: 15,
      validUntil: "2024-02-28",
      originalPrices: {
        "1": menuItems[0].price,
        "2": menuItems[1].price,
      },
    },
  },
  {
    id: "banner3",
    background: require("../assets/images/banner3.png"),
    image: require("../assets/images/sandwichbanner.png"),
    percentText: "25%",
    mainText: "DE RÉDUCTION SUR \nTOUS LES SANDWICHS",
    subText: "Seulement sur l'appli \nvalable jusqu'au 28 février",
    color: "white",
    offerId: "offer3",
    menuIds: ["4"], // IDs des menus concernés
    promoDetails: {
      discount: 25,
      validUntil: "2024-02-28",
      originalPrices: {
        "4": menuItems[3].price,
      },
    },
  },
];

/**
 * Codes promo disponibles avec leurs réductions
 */
export const promoCodes: PromoCode[] = [
  {
    code: "CHICKEN10",
    discount: 10,
    type: "percent",
    validUntil: "2024-05-31",
    description: "10% de réduction sur votre commande",
  },
  {
    code: "WELCOME20",
    discount: 20,
    type: "percent",
    validUntil: "2024-05-31",
    description: "20% de réduction pour les nouveaux utilisateurs",
  },
  {
    code: "FREE1000",
    discount: 1000,
    type: "fixed",
    validUntil: "2024-05-31",
    description: "1000 FCFA de réduction sur votre commande",
  },
];

export const notifications = [
  {
    id: "notif1",
    userId: "user1",
    icon: require("../assets/icons/notifications/new-info.png"),
    iconBgColor: "#E6F2FF",
    title: "Nouvelle info",
    date: "2024-02-17T20:50:00",
    time: "20:50",
    message: 'Tu attends quoi pour relever le défi du "BURGER MECHANT MECHANT". Vous pouvez commander au : 07 47 00 00 34/ 07 20 35 35 35',
    type: "promo" as const,
    isRead: false,
    showChevron: true,
    notifBanner: require("../assets/images/promo2.png"),
    notifTitle: "Offre spéciale : Défie le Méchant Méchant Burger!",
    data: {
      promoId: "promo1"
    }
  },
  {
    id: "notif2",
    userId: "user1",
    icon: require("../assets/icons/notifications/order-canceled.png"),
    iconBgColor: "#FFEBEB",
    title: "Commande annulée",
    date: "2024-02-17T20:50:00",
    time: "20:50",
    message: "Vous avez annulé une commande de SKINNY 2PCS EPICE + ALLOCO. Nous nous excusons pour votre inconvénient. Nous essaierons d'améliorer notre service la prochaine fois 😔",
    type: "order" as const,
    isRead: false,
    notifBanner: require("../assets/icons/no-result.png"),
    notifTitle: "Détails de la commande annulée",
    data: {
      orderId: "order3"
    }
  },
  {
    id: "notif3",
    userId: "user1",
    icon: require("../assets/icons/notifications/order-successful.png"),
    iconBgColor: "#E6FFE6",
    title: "Commande réussie !",
    date: "2024-02-17T20:50:00",
    time: "20:50",
    message: "Vous avez passé une commande 4 MECHANT MECHANT BURGER et payé 14.000 FCFA Votre nourriture arrivera bientôt. Profitez de nos services 😌",
    type: "order" as const,
    isRead: false,
    notifBanner: require("../assets/images/promo.png"),
    notifTitle: "Votre commande est en route",
    data: {
      orderId: "order1"
    }
  },
  {
    id: "notif4",
    userId: "user1",
    icon: require("../assets/icons/notifications/new-info.png"),
    iconBgColor: "#E6F2FF",
    title: "Nouveaux services disponibles !",
    date: "2024-02-17T20:50:00",
    time: "20:50",
    message: 'Tu attends quoi pour relever le défi du "BURGER MECHANT MECHANT". Vous pouvez commander au : 07 47 00 00 34/ 07 20 35 35 35',
    type: "info" as const,
    isRead: true,
    notifBanner: require("../assets/images/promo.png"),
    notifTitle: "Découvrez nos nouveaux services",
    data: {
      serviceId: "service1"
    }
  },
  {
    id: "notif5",
    userId: "user1",
    icon: require("../assets/icons/notifications/credit-card-connected.png"),
    iconBgColor: "#F0E6FF",
    title: "Carte de crédit connectée !",
    date: "2024-02-17T20:50:00",
    time: "20:50",
    message: "Ta carte de crédit a été associée avec succès à Chicken Nation. Profitez de nos services.",
    type: "payment" as const,
    isRead: false,
    notifBanner: require("../assets/images/promo.png"),
    notifTitle: "Paiement configuré avec succès",
    data: {
      paymentMethodId: "card1"
    }
  },
  {
    id: "notif6",
    userId: "user1",
    icon: require("../assets/icons/notifications/signup-successful.png"),
    iconBgColor: "#E6FFE6",
    title: "Création de compte réussie !",
    date: "2024-02-17T20:50:00",
    time: "20:50",
    message: "La création de compte est réussie, tu peux désormais découvrir nos services.",
    type: "account" as const,
    isRead: true,
    notifBanner: require("../assets/images/promo.png"),
    notifTitle: "Bienvenue chez Chicken Nation",
    data: {
      userId: "user1"
    }
  }
];
