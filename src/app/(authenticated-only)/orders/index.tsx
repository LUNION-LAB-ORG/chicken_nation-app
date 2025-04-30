import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { menuItems } from "@/data/MockedData";
import useOrderStore from "@/store/orderStore";
import { OrderResponse, OrderStatus, OrderType } from "@/services/api/orders";
import { formatDate } from "@/utils/dateHelpers";

/**
 * Types définissant les filtres et statuts des commandes
 */
type FilterType = "en_cours" | "termines" | "annuler";

/**
 * Mapping des statuts de commande avec leurs textes et couleurs associés
 */
const statusMapping: Record<string, { text: string; color: string }> = {
  PENDING: { text: "En attente", color: "text-orange-500" },
  CONFIRMED: { text: "Confirmé", color: "text-blue-500" },
  PREPARING: { text: "En préparation", color: "text-purple-500" },
  READY: { text: "Prêt", color: "text-green-500" },
  DELIVERED: { text: "Livré", color: "text-green-500" },
  CANCELLED: { text: "Annulé", color: "text-red-500" },
};

/**
 * Composant représentant une carte de commande individuelle
 */
const OrderCard: React.FC<{ order: OrderResponse }> = ({ order }) => {
  const router = useRouter();
  
  // Récupère le premier article de la commande pour l'affichage
  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
  
  /**
   * Formate la date au format "Initié le JJ.MM.AAAA"
   */
  const formattedDate = useMemo(() => {
    return `Initié le ${formatDate(order.created_at)}`;
  }, [order.created_at]);

  /**
   * Gère la redirection vers l'écran du produit pour commander à nouveau
   */
  const handleReorder = () => {
    if (firstItem?.dish?.id) {
      router.push(`/(common)/products/${firstItem.dish.id}`);
    }
  };

  /**
   * Détermine si la commande est terminée (livrée ou annulée)
   */
  const isCompleted = order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED;
  
  /**
   * Détermine si la commande est en cours
   */
  const isPending = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY].includes(order.status as OrderStatus);

  /**
   * Détermine le type de paiement (à implémenter selon les données réelles)
   */
  const paymentMethod = "mobile_money"; // À remplacer par les données réelles quand disponibles

  return (
    <View className="bg-white rounded-2xl mb-4">
      {/* En-tête avec image et détails */}
      <View className="flex-row p-4 items-center gap-4">
     
        <View className="flex-1">
          <Text className="font-sofia-medium text-base text-gray-900">
            {firstItem?.dish?.name || "Commande"}
          </Text>
          {/* Affiche la date pour les commandes terminées ou annulées */}
          {isCompleted && (
            <Text className="text-gray-400 text-sm font-sofia-regular mt-1">
              {formattedDate}
            </Text>
          )}
          <View className="flex-row items-center gap-4 mt-1">
            <Text className="font-sofia-bold text-orange-500">
              {order.final_amount} FCFA
            </Text>
            {/* Affichage conditionnel du statut de la commande */}
            {order.status === OrderStatus.CANCELLED ? (
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
                  {paymentMethod === 'mobile_money' ? 'Payé via Mobile Money' : 'Payé via Carte bancaire'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Boutons d'action - uniquement pour les commandes non annulées */}
      {order.status !== OrderStatus.CANCELLED && (
        <View className="px-4 pb-4">
          {order.status === OrderStatus.DELIVERED ? (
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
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`py-2 px-6 rounded-full ${
      isActive ? "bg-orange-500" : "bg-gray-100"
    }`}
  >
    <Text
      className={`font-sofia-medium ${
        isActive ? "text-white" : "text-gray-500"
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
  const { orders, fetchOrders, isLoading, error } = useOrderStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>("en_cours");

  // Charger les commandes au montage du composant
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtrer les commandes selon le filtre actif
  const filteredOrders = useMemo(() => {
    if (orders.length === 0) return [];

    switch (activeFilter) {
      case "en_cours":
        return orders.filter(order => 
          [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY].includes(order.status as OrderStatus)
        );
      case "termines":
        return orders.filter(order => order.status === OrderStatus.DELIVERED);
      case "annuler":
        return orders.filter(order => order.status === OrderStatus.CANCELLED);
      default:
        return orders;
    }
  }, [orders, activeFilter]);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <CustomStatusBar />

      {/* Header */}
      <View className="bg-white pt-2 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require("@/assets/icons/arrow-back.png")}
              className="w-10 h-10"
            />
          </TouchableOpacity>
          <Text className="text-xl font-sofia-medium text-gray-900">
            Mes commandes
          </Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Filtres */}
      <View className="bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        >
          <View className="flex-row gap-3">
            <FilterButton
              label="En cours"
              isActive={activeFilter === "en_cours"}
              onPress={() => setActiveFilter("en_cours")}
            />
            <FilterButton
              label="Terminés"
              isActive={activeFilter === "termines"}
              onPress={() => setActiveFilter("termines")}
            />
            <FilterButton
              label="Annulés"
              isActive={activeFilter === "annuler"}
              onPress={() => setActiveFilter("annuler")}
            />
          </View>
        </ScrollView>
      </View>

      {/* État de chargement */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="mt-4 text-gray-500 font-sofia-medium">
            Chargement de vos commandes...
          </Text>
        </View>
      )}

      {/* État d'erreur */}
      {error && !isLoading && (
        <View className="flex-1 items-center justify-center p-4">
         
          <Text className="text-xl font-sofia-medium text-gray-900 text-center">
            Une erreur est survenue
          </Text>
          <Text className="mt-2 text-gray-500 font-sofia-light text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity 
            className="py-3 px-6 rounded-xl bg-orange-500"
            onPress={() => fetchOrders()}
          >
            <Text className="text-white font-sofia-medium">
              Réessayer
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des commandes */}
      {!isLoading && !error && (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <EmptyState activeFilter={activeFilter} />
          )}
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
};

export default Orders;
