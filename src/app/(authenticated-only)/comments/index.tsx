import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Star, Send } from "lucide-react-native";
import DynamicHeader from "@/components/home/DynamicHeader";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { StatusBar } from "expo-status-bar";
import SuccessModal from "@/components/ui/SuccessModal";

const CommentsScreen: React.FC = () => {
  // État pour gérer le texte du nouveau commentaire
  const [commentText, setCommentText] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Profil fictif de l'utilisateur connecté
  const currentUser = {
    id: "user-current",
    name: "Alex Dubois",
    avatar: require("../../../assets/images/profile.png"),
  };

  // État pour gérer la liste des commentaires (initialisé avec les commentaires existants)
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Charolette Hanlin",
      avatar: require("../../../assets/images/profile2.png"),
      rating: 5,
      comment:
        "Excellente nourriture. Le menu est vaste et saisonnier à un niveau particulièrement élevé. Certainement une cuisine raffinée 😍😍",
      timeAgo: "il y a 6 jours",
    },
    {
      id: 2,
      name: "Darron Kulikowski",
      avatar: require("../../../assets/images/profile.png"),
      rating: 4,
      comment:
        "C'est mon restaurant préféré. La nourriture est toujours fantastique et peu importe ce que je commande, je suis toujours ravi de mon repas ! 💯 💯",
      timeAgo: "il y a 2 semaines",
    },
  ]);

  // Calcul des statistiques de notation
  const calculateRatings = () => {
    const totalReviews = reviews.length;
    const totalStars = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average =
      totalReviews > 0 ? (totalStars / totalReviews).toFixed(1) : "0.0";

    // Calculer la distribution des notes
    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((r) => r.rating === stars).length;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return { stars, percentage };
    });

    return {
      average,
      distribution,
      reviews,
    };
  };

  // Obtient les statistiques calculées
  const ratings = calculateRatings();

  /**
   * Ajoute un nouveau commentaire de l'utilisateur actuel
   */
  const handleAddComment = () => {
    if (!commentText.trim()) {
      Alert.alert(
        "Commentaire vide",
        "Veuillez écrire un commentaire avant de l'envoyer.",
      );
      return;
    }

    // Créer un nouvel objet commentaire
    const newComment = {
      id: Date.now(), // Identifiant unique basé sur le timestamp
      name: currentUser.name,
      avatar: currentUser.avatar,
      rating: 5, // Note par défaut (on pourrait ajouter un sélecteur d'étoiles)
      comment: commentText,
      timeAgo: "à l'instant",
    };

    // Ajouter le nouveau commentaire au début de la liste
    setReviews([newComment, ...reviews]);

    // Réinitialiser le champ de texte
    setCommentText("");

    // Afficher le modal de succès
    setShowSuccessModal(true);
  };

  // Rendu des étoiles
  const renderStars = (count: number, size = 20, color = "#FB9400") => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          size={size}
          fill={index < count ? color : "none"}
          color={index < count ? color : "#FB9400"}
        />
      ));
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar />
      <CustomStatusBar />
      <View className="px-4 -mt-5">
        <DynamicHeader
          displayType="back"
          title="Commentaires"
          showCart={true}
        />
      </View>

      {/* Contenu principal */}
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          {/* Note moyenne */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="items-center">
              <Text className="text-[64px] font-sofia-bold text-gray-700">
                {ratings.average}
              </Text>
              <View className="flex-row">
                {renderStars(Math.floor(Number(ratings.average)))}
              </View>
            </View>

            {/* Distribution des notes */}
            <View className="flex-1 ml-8">
              {ratings.distribution.map((item) => (
                <View key={item.stars} className="flex-row items-center mb-2">
                  <Text className="w-6 text-gray-600 font-sofia-medium">
                    {item.stars}
                  </Text>
                  <View className="flex-1 h-3 bg-gray-200 rounded-full ml-2">
                    <View
                      className="h-3 bg-yellow-400 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
 
          {/* Ligne de séparation */}
          <View className="h-[1px] bg-gray-200 my-4" />

          {/* Liste des commentaires */}
          <View className="mt-2">
            {reviews.map((review) => (
              <View key={review.id} className="mb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <Image
                      source={review.avatar}
                      className="w-12 h-12 rounded-full"
                      defaultSource={require("../../../assets/images/profile.png")}
                    />
                    <Text className="ml-3 font-sofia-medium text-gray-700 text-lg">
                      {review.name}
                    </Text>
                  </View>
                  <View className="flex-row">
                    {renderStars(review.rating, 16)}
                  </View>
                </View>
                <Text className="text-gray-600 font-sofia-light mb-2 leading-5">
                  {review.comment}
                </Text>
                <Text className="text-gray-400 text-sm font-sofia-light">
                  {review.timeAgo}
                </Text>
                {/* Ligne de séparation sauf pour le dernier commentaire */}
                <View className="h-[1px] bg-gray-200 mt-6" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Zone de saisie de commentaire */}
      <View className="px-4 py-3 bg-white border-t border-gray-100">
        <View className="flex-row items-center bg-[#F5F5F5] rounded-full px-4 py-2">
          <TextInput
            className="flex-1 font-sofia-regular text-gray-700"
            placeholder="Laisser un commentaire"
            placeholderTextColor="#9796A1"
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity className="ml-2" onPress={handleAddComment}>
            <Send size={26} color={commentText.trim() ? "#F17922" : "gray"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de succès */}
      <SuccessModal
        visible={showSuccessModal}
        message="Votre commentaire a été ajouté avec succès."
        onClose={() => setShowSuccessModal(false)}
      />
    </View>
  );
};

export default CommentsScreen;
