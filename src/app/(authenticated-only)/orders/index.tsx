import React, { useState, useMemo } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { users, menuItems } from "@/data/MockedData";
import type { MenuItem } from "@/types";

/**
 * Types définissant les filtres et statuts des commandes
 */
type FilterType = "en_cours" | "termines" | "annuler";
type OrderStatus = "delivered" | "pending" | "cancelled";

/**
 * Interface définissant la structure d'un article dans une commande
 */
interface OrderItem {
  productId: string;
  quantity: number;
  supplements?: {
    boissons?: string[];
    sauces?: string[];
  };
}

/**
 * Interface définissant la structure complète d'une commande
 */
interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  total: string;
  status: OrderStatus;
  date: string;
  deliveryAddress: string;
  paymentMethod: string;
}

/**
 * Mapping des statuts de commande avec leurs textes et couleurs associés
 */
const statusMapping: Record<OrderStatus, { text: string; color: string }> = {
  delivered: { text: "Livré", color: "text-green-500" },
  pending: { text: "En cours", color: "text-orange-500" },
  cancelled: { text: "Annulé", color: "text-red-500" },
};

/**
 * Composant représentant une carte de commande individuelle
 */
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const router = useRouter();
  
  // Récupère les détails des articles de la commande avec leurs informations complètes
  const orderItems = useMemo(() => {
    return order.items.map(item => {
      const menuItem = menuItems.find(menu => menu.id === item.productId);
      return {
        ...item,
        menuDetails: menuItem,
      };
    });
  }, [order.items]);

  /**
   * Formate la date au format "Initié le JJ.MM.AAAA"
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `Initié le ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  /**
   * Gère la redirection vers l'écran du produit pour commander à nouveau
   */
  const handleReorder = () => {
    if (orderItems[0]?.menuDetails?.id) {
      router.push(`/(common)/products/${orderItems[0].menuDetails.id}`);
    }
  };

  return (
    <View className="bg-white rounded-2xl mb-4">
      {/* En-tête avec image et détails */}
      <View className="flex-row p-4 items-center gap-4">
        <Image
          source={orderItems[0]?.menuDetails?.image}
          className="w-20 h-20 rounded-2xl border-[1px] border-orange-200"
        />
        <View className="flex-1">
          <Text className="font-sofia-medium text-base text-gray-900">
            {orderItems[0]?.menuDetails?.name}
          </Text>
          {/* Affiche la date pour les commandes terminées ou annulées */}
          {(order.status === "delivered" || order.status === "cancelled") && (
            <Text className="text-gray-400 text-sm font-sofia-regular mt-1">
              {formatDate(order.date)}
            </Text>
          )}
          <View className="flex-row items-center gap-4 mt-1">
            <Text className="font-sofia-bold text-orange-500">
              {order.total} FCFA
            </Text>
            {/* Affichage conditionnel du statut de la commande */}
            {order.status === "cancelled" ? (
              <View className="flex-row items-center ml-10">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                <Text className="text-red-500 text-sm font-sofia-regular">
                  Annulé
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center ml-10">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-green-500 text-sm font-sofia-regular">
                  {order.paymentMethod === 'mobile_money' ? 'Payé via Mobile Money' : 'Payé via Carte bancaire'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Boutons d'action - uniquement pour les commandes non annulées */}
      {order.status !== "cancelled" && (
        <View className="px-4 pb-4">
          {order.status === "delivered" ? (
            <View className="flex-row gap-4">
              <TouchableOpacity 
                className="py-3 px-6 rounded-xl bg-orange-500 self-start"
                onPress={handleReorder}
              >
                <Text className="text-white font-sofia-medium">
                  Commander à nouveau
                </Text>
              </TouchableOpacity>
              <View className="flex-1"></View>
            </View>
          ) : (
            <View className="flex-row gap-4">
              <TouchableOpacity 
                className="flex-1 py-3 rounded-xl border border-orange-500"
              >
                <Text className="text-center text-orange-500 font-sofia-medium">
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 py-3 rounded-xl bg-orange-500"
              >
                <Text className="text-center text-white font-sofia-medium">
                  Suivie de commande
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * Composant affiché lorsqu'aucune commande n'est disponible
 */
const EmptyState: React.FC<{ activeFilter: FilterType }> = ({ activeFilter }) => {
  const getMessage = () => {
    switch (activeFilter) {
      case "en_cours":
        return "Tu n'as aucune commande en cours";
      case "termines":
        return "Tu n'as aucune commande terminée";
      case "annuler":
        return "Tu n'as aucune commande annulée";
      default:
        return "Tu n'as aucune commande";
    }
  };

  return (
    <View className="flex-1 items-center mt-8">
      <Image
        source={require("@/assets/icons/empty-orders.png")}
        className="w-32 h-32 opacity-50"
      />
      <Text className="mt-4 text-xl font-sofia-medium text-gray-900">
        Aucun résultat
      </Text>
      <Text className="mt-2 text-gray-500 font-sofia-light text-center px-8">
        {getMessage()}
      </Text>
    </View>
  );
};

/**
 * Composant pour les boutons de filtre
 */
const FilterButton: React.FC<{
  type: FilterType;
  active: boolean;
  onPress: () => void;
  label: string;
}> = ({ type, active, onPress, label }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-1 py-2 rounded-full ${
      active ? "bg-orange-500" : "border border-orange-500"
    }`}
  >
    <Text
      className={`font-sofia-medium text-center ${
        active ? "text-white" : "text-orange-500"
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

/**
 * Composant principal de la page des commandes
 */
const Orders = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>("en_cours");

  // Récupération des commandes mockées avec le bon typage
  const mockOrders = users[0].orderHistory as Order[];

  // Filtrage des commandes en fonction du filtre actif
  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      switch (activeFilter) {
        case "en_cours":
          return order.status === "pending";
        case "termines":
          return order.status === "delivered";
        case "annuler":
          return order.status === "cancelled";
        default:
          return true;
      }
    });
  }, [mockOrders, activeFilter]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      {/* Header avec bouton retour et titre */}
      <View className="flex-row items-center justify-between px-3 pb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("@/assets/icons/arrow-back.png")}
            className="w-10 h-10"
          />
        </TouchableOpacity>
        <Text className="text-xl font-sofia-medium text-gray-900">
          Commandes
        </Text>
        <View className="w-10" />
      </View>

      {/* Boutons de filtrage */}
      <View className="flex-row px-4 gap-6 mb-4">
        <FilterButton
          type="en_cours"
          active={activeFilter === "en_cours"}
          onPress={() => setActiveFilter("en_cours")}
          label="En cours"
        />
        <FilterButton
          type="termines"
          active={activeFilter === "termines"}
          onPress={() => setActiveFilter("termines")}
          label="Terminés"
        />
        <FilterButton
          type="annuler"
          active={activeFilter === "annuler"}
          onPress={() => setActiveFilter("annuler")}
          label="Annuler"
        />
      </View>

      {/* Liste des commandes ou état vide */}
      <ScrollView 
        className="flex-1 px-4" 
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <EmptyState activeFilter={activeFilter} />
        )}
      </ScrollView>
    </View>
  );
};

export default Orders;
