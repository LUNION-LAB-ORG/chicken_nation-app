import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import ErrorModal from "@/components/ui/ErrorModal";
import useOrderStore from "@/store/orderStore";
import { OrderResponse, OrderStatus, getActiveOrders, getCompletedOrders, getCancelledOrders, getOrderById, getOrderStatus, cancelOrder } from "@/services/api/orders";
import { formatDate } from "@/utils/dateHelpers";
import { AuthStorage } from "@/services/storage/auth-storage";
import { formatImageUrl } from "@/utils/imageHelpers";

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
  IN_PROGRESS: { text: "En cours", color: "text-blue-500" },
  PICKED_UP: { text: "En cours", color: "text-blue-500" },
};

/**
 * Composant pour la modal de tracking
 */
const TrackingModal: React.FC<{
  visible: boolean;
  order: OrderResponse | null;
  onClose: () => void;
}> = ({ visible, order, onClose }) => {
  const [currentOrder, setCurrentOrder] = useState<OrderResponse | null>(order);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mettre à jour l'ordre actuel quand l'ordre passé en props change
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Rafraîchir l'état de la commande toutes les 10 secondes quand le modal est visible
  useEffect(() => {
    if (!visible || !order?.id) return;

    const refreshOrder = async () => {
      try {
        setIsRefreshing(true);
        console.log('[TrackingModal] Rafraîchissement du statut de la commande:', order.id);
        // Récupérer uniquement le statut de la commande
        const newStatus = await getOrderStatus(order.id);
        console.log('[TrackingModal] Nouveau statut:', newStatus);
        
        if (newStatus) {
          // Mettre à jour uniquement le statut de la commande
          setCurrentOrder(prev => prev ? { ...prev, status: newStatus as OrderStatus } : null);
          
          // Si la commande est annulée, fermer le modal
          if (newStatus === 'CANCELLED') {
            console.log('[TrackingModal] Commande annulée, fermeture du modal');
            onClose();
          }
        }
      } catch (error) {
        console.error("[TrackingModal] Erreur lors du rafraîchissement du statut:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Rafraîchir immédiatement
    refreshOrder();

    // Configurer l'intervalle de rafraîchissement
    const refreshInterval = setInterval(refreshOrder, 10000);

    // Nettoyer l'intervalle lors de la fermeture du modal
    return () => clearInterval(refreshInterval);
  }, [visible, order?.id, onClose]);

  if (!currentOrder) return null;

  const steps = [
    { 
      status: OrderStatus.PENDING, 
      label: "Commande reçue",
      description: "Votre commande a été reçue et est en attente de confirmation",
      icon: require("@/assets/icons/poulet.png")
    },
    { 
      status: OrderStatus.CONFIRMED, 
      label: "Commande confirmée",
      description: "Votre commande a été confirmée et sera préparée",
      icon: require("@/assets/icons/chicken.png")
    },
    { 
      status: OrderStatus.PREPARING, 
      label: "En préparation",
      description: "Votre commande est en cours de préparation",
      icon: require("@/assets/icons/restaurant.png")
    },
    { 
      status: OrderStatus.READY, 
      label: "Prêt",
      description: "Votre commande est prête pour la livraison",
      icon: require("@/assets/icons/package_orange.png")
    },
    { 
      status: OrderStatus.DELIVERED, 
      label: "Livré",
      description: "Votre commande a été livrée",
      icon: require("@/assets/icons/localisation.png")
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => 
      step.status === currentOrder.status || 
      step.status.toString() === currentOrder.status
    );
  };

  const isStepCompleted = (stepStatus: OrderStatus) => {
    const currentIndex = getCurrentStepIndex();
    const stepIndex = steps.findIndex(step => 
      step.status === stepStatus || 
      step.status.toString() === stepStatus.toString()
    );
    return stepIndex <= currentIndex;
  };

  const getEstimatedTime = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex === -1) return "Non disponible";
    
    const remainingSteps = steps.length - currentIndex - 1;
    if (remainingSteps === 0) return "Livré";
    
    const estimatedMinutes = remainingSteps * 15; // 15 minutes par étape
    return `${estimatedMinutes} minutes`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
          {/* Header avec indicateur de rafraîchissement */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xl font-sofia-medium text-gray-900">
                Suivi de commande
              </Text>
              <Text className="text-sm text-gray-500 font-sofia-regular">
                Référence: {currentOrder.reference}
              </Text>
            </View>
            <View className="flex-row items-center">
              {isRefreshing && (
                <ActivityIndicator size="small" color="#F97316" className="mr-2" />
              )}
              <TouchableOpacity onPress={onClose}>
                <Image
                  source={require("@/assets/icons/close.png")}
                  className="w-6 h-6"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Temps estimé */}
          <View className="bg-orange-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-sofia-medium text-gray-900">
                  Temps estimé
                </Text>
                <Text className="text-sm text-gray-500 font-sofia-regular">
                  Temps restant avant livraison
                </Text>
              </View>
              <Text className="text-lg font-sofia-medium text-[#F97316]">
                {getEstimatedTime()}
              </Text>
            </View>
          </View>

          {/* Timeline des étapes */}
          <ScrollView className="space-y-6">
            {steps.map((step, index) => (
              <View key={step.status} className="flex-row">
                {/* Ligne verticale */}
                {index < steps.length - 1 && (
                  <View 
                    className={`absolute left-6 top-12 w-0.5 h-16 ${
                      isStepCompleted(step.status) ? "bg-[#F97316]" : "bg-gray-200"
                    }`}
                  />
                )}
                
                {/* Icône et point */}
                <View className="items-center">
                  <View 
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      isStepCompleted(step.status) ? "bg-[#F97316]" : "bg-gray-200"
                    }`}
                  >
                    <Image
                      source={step.icon}
                      className="w-6 h-6"
                      style={{ tintColor: isStepCompleted(step.status) ? "#FFFFFF" : "#9CA3AF" }}
                    />
                  </View>
                </View>

                {/* Contenu */}
                <View className="ml-4 flex-1">
                  <Text 
                    className={`font-sofia-medium text-base ${
                      isStepCompleted(step.status) ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </Text>
                  <Text 
                    className={`text-sm font-sofia-regular ${
                      isStepCompleted(step.status) ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {step.description}
                  </Text>
                  {step.status === currentOrder.status && (
                    <View className="mt-2 bg-orange-50 rounded-lg p-2">
                      <Text className="text-sm text-[#F97316] font-sofia-medium">
                        En cours
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Détails de la commande */}
          <View className="border-t border-gray-200 pt-4 mt-4">
            <Text className="text-base font-sofia-medium text-gray-900 mb-3">
              Détails de la commande
            </Text>
            
            {/* Adresse de livraison */}
            {currentOrder.address && (
              <View className="mb-3">
                <Text className="text-sm font-sofia-medium text-gray-500">
                  Adresse de livraison
                </Text>
                <Text className="text-base font-sofia-regular text-gray-900">
                  {currentOrder.address.address}
                </Text>
                {currentOrder.address.details && (
                  <Text className="text-sm font-sofia-regular text-gray-500">
                    {currentOrder.address.details}
                  </Text>
                )}
              </View>
            )}

            {/* Informations de contact */}
            <View className="mb-3">
              <Text className="text-sm font-sofia-medium text-gray-500">
                Contact
              </Text>
              <Text className="text-base font-sofia-regular text-gray-900">
                {currentOrder.customer?.phone || currentOrder.phone}
              </Text>
            </View>

            {/* Montant */}
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-sofia-medium text-gray-900">
                Montant total
              </Text>
              <Text className="text-lg font-sofia-medium text-[#F97316]">
                {currentOrder.amount} FCFA
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Composant représentant une carte de commande individuelle
 */
const OrderCard: React.FC<{ order: OrderResponse }> = ({ order }) => {
  const router = useRouter();
  const { fetchOrders } = useOrderStore();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Récupérer le premier article de la commande pour l'affichage
  const firstItem = order.order_items && order.order_items.length > 0 ? order.order_items[0] : null;
  
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
  const isPending = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, 'IN_PROGRESS', 'PICKED_UP'].includes(order.status as OrderStatus);

  /**
   * Extraire le moyen de paiement depuis la note
   */
  const extractPaymentMethod = (note: string | undefined): string => {
    if (!note) return "Mobile Money";
    
    const lowerNote = note.toLowerCase();
    if (lowerNote.includes("wave")) return "Wave";
    if (lowerNote.includes("orange money") || lowerNote.includes("orange")) return "Orange Money";
    if (lowerNote.includes("moov money") || lowerNote.includes("moov")) return "Moov Money";
    if (lowerNote.includes("mtn") || lowerNote.includes("mtn money")) return "MTN Mobile Money";
    if (lowerNote.includes("carte") || lowerNote.includes("card") || lowerNote.includes("visa") || lowerNote.includes("mastercard")) return "Carte bancaire";
    if (lowerNote.includes("espèce") || lowerNote.includes("espece") || lowerNote.includes("cash")) return "Espèces";
    
    return "Mobile Money";
  };
  
  // Utiliser les données directement depuis la structure de la commande
  const paymentMethod = extractPaymentMethod(order.note);
  
  /**
   * Formater le prix avec séparateur de milliers
   */
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return "0 FCFA";
    return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
  };

  // Récupérer les données du plat principal
  const dishName = firstItem?.dish?.name || "Commande";
  const dishImageRaw = firstItem?.dish?.image || null;
  const dishImage = dishImageRaw ? formatImageUrl(dishImageRaw) : null;
  
  // Récupérer le prix correct
  const orderPrice = order.net_amount || order.amount || 0;

  /**
   * Gère le clic sur le bouton d'annulation
   */
  const handleCancelClick = () => {
    setShowConfirmModal(true);
  };

  /**
   * Gère l'annulation de la commande
   */
  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      setShowConfirmModal(false);
      console.log('[OrderCard] Tentative d\'annulation de la commande:', order.id);
      
      // Appeler l'API pour annuler la commande
      await cancelOrder(order.id);
      
      // Rafraîchir la liste des commandes
      await fetchOrders();
      
      console.log('[OrderCard] Commande annulée avec succès');
    } catch (error) {
      console.error('[OrderCard] Erreur lors de l\'annulation:', error);
      setShowErrorModal(true);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <View className="bg-white rounded-2xl mb-4">
      {/* En-tête avec image et détails */}
      <View className="flex-row p-4 items-center gap-4">
        {/* Image du plat - toujours afficher une image */}
        <View className="w-24 h-24 rounded-xl overflow-hidden border-[1px] border-orange-100">
          {dishImage ? (
            <Image 
              source={{ uri: dishImage }} 
              className="w-full h-full"
              defaultSource={require("@/assets/images/food2.png")}
              style={{ resizeMode: "contain" }}
            />
          ) : (
            <Image 
              source={require("@/assets/images/food2.png")} 
              className="w-full h-full"
            />
          )}
        </View>
        
        <View className="flex-1">
          <Text className="font-sofia-medium text-base text-gray-900">
            {dishName}
          </Text>
          {/* Affiche la date pour les commandes terminées ou annulées */}
          {isCompleted && (
            <Text className="text-gray-400 text-sm font-sofia-regular mt-1">
              {formattedDate}
            </Text>
          )}
          <View className="flex-row items-center gap-4 mt-1">
            <Text className="font-sofia-medium text-[#F97316]">
              {formatPrice(orderPrice)}
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
                  {`Payé via ${paymentMethod}`}
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
                className="py-[6px] px-[32px] rounded-full items-center justify-center bg-[#F97316] self-start"
                onPress={handleReorder}
              >
                <Text className="text-white text-[14px] font-sofia-regular">
                  Commander à nouveau
                </Text>
              </TouchableOpacity>
              <View className="flex-1"></View>
            </View>
          ) : (
            <View className="flex-row gap-4">
              <TouchableOpacity 
                className="flex-1 py-[6px] rounded-full border-[1px] border-[#F97316]"
                onPress={handleCancelClick}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#F97316" />
                ) : (
                  <Text className="text-center text-[#F97316] font-sofia-medium">
                    Annuler
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 py-[6px] rounded-full bg-[#F97316]"
                onPress={() => setShowTrackingModal(true)}
              >
                <Text className="text-center text-white font-sofia-medium">
                  Suivie de commande
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Modal de confirmation */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-sofia-medium text-gray-900 mb-4 text-center">
              Annuler la commande ?
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
            </Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border border-gray-300"
                onPress={() => setShowConfirmModal(false)}
              >
                <Text className="text-center text-gray-600 font-sofia-medium">
                  Non
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-red-500"
                onPress={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-center text-white font-sofia-medium">
                    Oui, annuler
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal d'erreur */}
      <ErrorModal
        visible={showErrorModal}
        message="Une erreur est survenue lors de l'annulation de votre commande. Veuillez réessayer ou contacter notre service client."
        onClose={() => setShowErrorModal(false)}
      />

      {/* Modal de tracking */}
      <TrackingModal
        visible={showTrackingModal}
        order={order}
        onClose={() => setShowTrackingModal(false)}
      />
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
        return "Vous n'avez pas de commandes en cours.";
      case "termines":
        return "Vous n'avez pas encore de commandes terminées.";
      case "annuler":
        return "Vous n'avez pas de commandes annulées.";
      default:
        return "Aucune commande disponible.";
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
    className={`py-[4px] px-[32px] rounded-full ${
      isActive ? "bg-[#F97316]" : "bg-white border-[1px] border-[#F97316]"
    }`}
  >
    <Text
      className={`font-sofia-medium ${
        isActive ? "text-white" : "text-[#F97316]"
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
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Récupérer l'ID de l'utilisateur connecté
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AuthStorage.getUserData();
        if (userData?.id) {
          setCurrentUserId(userData.id);
        } else {
          console.error("Pas d'ID utilisateur trouvé");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
      }
    };
    getUserId();
  }, []);

  // Charger les commandes au montage du composant et les rafraîchir automatiquement
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = await AuthStorage.getAccessToken();
        if (!token) {
          console.error("Pas de token d'accès trouvé");
          return;
        }
        await fetchOrders();
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
      }
    };

    // Charger les commandes immédiatement
    loadOrders();

    // Configurer l'intervalle de rafraîchissement (toutes les 30 secondes)
    const refreshInterval = setInterval(loadOrders, 30000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(refreshInterval);
  }, []);

  // Filtrer les commandes selon le filtre actif et l'ID de l'utilisateur
  const filteredOrders = useMemo(() => {
    if (orders.length === 0) return [];

    // D'abord filtrer par utilisateur si un ID est disponible
    let userOrders = orders;
    if (currentUserId) {
      userOrders = orders.filter(order => {
        const orderUserId = order.customer?.id || order.customer_id;
        return orderUserId === currentUserId;
      });
    }

    // Ensuite filtrer par statut selon le filtre actif
    switch (activeFilter) {
      case "en_cours":
        return getActiveOrders(userOrders);
      case "termines":
        return getCompletedOrders(userOrders);
      case "annuler":
        return getCancelledOrders(userOrders);
      default:
        return userOrders;
    }
  }, [orders, activeFilter, currentUserId]);

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
              style={{ resizeMode: "contain" }}
            />
          </TouchableOpacity>
          <Text className="text-xl font-sofia-medium text-gray-900">
            Commandes
          </Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Filtres */}
      <View className="bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View className="flex-row gap-3 justify-center">
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
