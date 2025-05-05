import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { DBTableType } from "@/store/orderTypeStore";

// Types de tables pour l'interface utilisateur
type TableType = "round" | "square" | "long";

// Mapping entre les types d'UI et les types de la base de données
export const TABLE_TYPE_MAPPING = {
  round: DBTableType.TABLE_ROUND,
  square: DBTableType.TABLE_SQUARE,
  long: DBTableType.TABLE_RECTANGLE
};

// Configuration des tables
const TABLE_CONFIG = {
  square: { min: 2, max: 8, label: "Table carrée de 2 à 8" },
  round: { min: 2, max: 8, label: "Table ronde de 2 à 8" },
  long: { min: 2, max: 14, label: "Longue table de 2 à 14" },
};

// Positions des chaises pour chaque type de table
const getChairPositions = (type, count) => {
  if (type === "round") {
    // Positions fixes pour les 8 chaises autour de la table ronde
    return [
      // Haut
      {
        top: 50,
        left: "50%",
        transform: [{ translateX: -11 }, { rotate: "0deg" }],
      },
      // Haut-droite
      { top: 75, right: 65, transform: [{ rotate: "45deg" }] },
      // Droite
      {
        top: "50%",
        right: 45,
        transform: [{ translateY: -11 }, { rotate: "90deg" }],
      },
      // Bas-droite
      { bottom: 75, right: 65, transform: [{ rotate: "135deg" }] },
      // Bas
      {
        bottom: 48,
        left: "50%",
        transform: [{ translateX: -11 }, { rotate: "180deg" }],
      },
      // Bas-gauche
      { bottom: 75, left: 65, transform: [{ rotate: "225deg" }] },
      // Gauche
      {
        top: "50%",
        left: 45,
        transform: [{ translateY: -11 }, { rotate: "270deg" }],
      },
      // Haut-gauche
      { top: 75, left: 65, transform: [{ rotate: "315deg" }] },
    ];
  }

  if (type === "square") {
    return [
      // Haut (2 chaises)
      { top: 62, left: "46%", transform: [{ rotate: "0deg" }] },
      { top: 75, right: "26%", transform: [{ rotate: "45deg" }] },
      // Droite (2 chaises)
      { top: "46%", right: 62, transform: [{ rotate: "90deg" }] },
      { top: 182, bottom: "26%", right: 71, transform: [{ rotate: "130deg" }] },
      // Bas (2 chaises)
      { bottom: 63, right: "45%", transform: [{ rotate: "180deg" }] },
      { bottom: 72, left: "27%", transform: [{ rotate: "220deg" }] },
      // Gauche (2 chaises)
      { bottom: "46%", left: 62, transform: [{ rotate: "270deg" }] },
      { top: "28%", left: 68, transform: [{ rotate: "300deg" }] },
    ];
  }

  if (type === "long") {
    return [
      // Haut (5 chaises avec espacement égal)
      { top: 60, left: 30, transform: [{ rotate: "0deg" }] },
      { top: 60, left: 75, transform: [{ rotate: "0deg" }] },
      { top: 60, left: 125, transform: [{ rotate: "0deg" }] },
      { top: 60, left: 175, transform: [{ rotate: "0deg" }] },
      { top: 60, left: 225, transform: [{ rotate: "0deg" }] },

      // Droite (2 chaises avec espacement égal)
      { right: -15, top: "36%", transform: [{ rotate: "90deg" }] },
      { right: -15, bottom: "36%", transform: [{ rotate: "90deg" }] },

      // Bas (5 chaises avec espacement égal)
      { bottom: 60, left: 225, transform: [{ rotate: "180deg" }] },
      { bottom: 60, left: 175, transform: [{ rotate: "180deg" }] },
      { bottom: 60, left: 125, transform: [{ rotate: "180deg" }] },
      { bottom: 60, left: 75, transform: [{ rotate: "180deg" }] },
      { bottom: 60, left: 30, transform: [{ rotate: "180deg" }] },

      // Gauche (2 chaises avec espacement égal)
      { left: -15, top: "56%", transform: [{ rotate: "270deg" }] },
      { left: -15, bottom: "56%", transform: [{ rotate: "270deg" }] },
    ];
  }

  return [];
};

export default function TableReservation({ onTableTypeChange, onPersonCountChange }) {
  // État pour le type de table sélectionné
  const [selectedTableType, setSelectedTableType] =
    useState<TableType>("round");

  // État pour le nombre de personnes
  const [personCount, setPersonCount] = useState(4);

  // Mettre à jour le nombre de personnes si nécessaire lors du changement de type de table
  useEffect(() => {
    const { min, max } = TABLE_CONFIG[selectedTableType];
    if (personCount < min) {
      setPersonCount(min);
    } else if (personCount > max) {
      setPersonCount(max);
    }
  }, [selectedTableType]);
  
  // Notifier le parent des changements
  useEffect(() => {
    // Convertir le type d'UI en type de base de données
    const dbTableType = TABLE_TYPE_MAPPING[selectedTableType];
    if (onTableTypeChange) {
      onTableTypeChange(dbTableType);
    }
    if (onPersonCountChange) {
      onPersonCountChange(personCount);
    }
  }, [selectedTableType, personCount, onTableTypeChange, onPersonCountChange]);

  // Gérer l'incrémentation du nombre de personnes
  const incrementPersonCount = () => {
    const { max } = TABLE_CONFIG[selectedTableType];
    if (personCount < max) {
      setPersonCount(personCount + 1);
    }
  };

  // Gérer la décrémentation du nombre de personnes
  const decrementPersonCount = () => {
    const { min } = TABLE_CONFIG[selectedTableType];
    if (personCount > min) {
      setPersonCount(personCount - 1);
    }
  };

  // Sélectionner le type de table
  const selectTableType = (type: TableType) => {
    setSelectedTableType(type);
  };

  // Obtenir les positions des chaises pour le type de table actuel
  const chairPositions = getChairPositions(
    selectedTableType,
    TABLE_CONFIG[selectedTableType].max,
  );

  // Déterminer la forme et la taille de la table en fonction du type
  const getTableStyle = () => {
    switch (selectedTableType) {
      case "round":
        return "w-36 h-36 rounded-full";
      case "square":
        return "w-[100px] h-[100px] rounded-3xl";
      case "long":
        return "w-72 h-28 rounded-xl";
      default:
        return "w-36 h-36 rounded-full";
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      {/* Visualisation de la table */}
      <View className="w-80 h-80 relative mb-6 items-center justify-center">
        {/* Table centrale */}
        <View
          className={`${getTableStyle()} bg-orange-500 items-center justify-center`}
        >
          <Text className="text-white text-md">personnes</Text>
        </View>

        {/* Chaises autour de la table */}
        {chairPositions
          .slice(0, Math.max(personCount, TABLE_CONFIG[selectedTableType].min))
          .map((position, index) => {
            return (
              <View
                key={index}
                className="absolute"
                style={{
                  ...position,
                  width: 22,
                  height: 22,
                }}
              >
                <Image
                  source={require("../../assets/icons/table-active.png")}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
            );
          })}

        {/* Chaises inactives */}
        {chairPositions
          .slice(
            Math.max(personCount, TABLE_CONFIG[selectedTableType].min),
            TABLE_CONFIG[selectedTableType].max,
          )
          .map((position, index) => {
            return (
              <View
                key={index + personCount}
                className="absolute"
                style={{
                  ...position,
                  width: 22,
                  height: 22,
                }}
              >
                <Image
                  source={require("../../assets/icons/table-inactive.png")}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
            );
          })}
      </View>

      {/* Sélection du type de table avec défilement horizontal */}
      <View className="w-full mb-6 ">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingRight: 20, 
          }}
          className="w-full "
          snapToInterval={150}  
          decelerationRate="fast"  
        >
          {Object.entries(TABLE_CONFIG).map(([type, config]) => (
            <TouchableOpacity
              key={type}
              onPress={() => selectTableType(type as TableType)}
              className={`mx-2 px-4 py-3 rounded-full ${
                selectedTableType === type
                  ? "bg-orange-500"
                  : "bg-white border border-orange-500"
              }`}
              style={{ marginRight: type === "long" ? 20 : 8 }}  
            >
              <Text
                className={`${
                  selectedTableType === type ? "text-white" : "text-orange-500"
                } text-sm`}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contrôle du nombre de personnes */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={decrementPersonCount}
          className="border-orange-500 border-2 rounded-full p-[9px] py-[7px]"
        >
          <FontAwesome name="minus" size={18} color="#f97316" />
        </TouchableOpacity>

        <Text className="mx-5 text-xl">
          {personCount.toString().padStart(2, "0")}
        </Text>

        <TouchableOpacity
          onPress={incrementPersonCount}
          className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center"
        >
          <Image
            source={require("../../assets/icons/plus-rounded.png")}
            style={{ width: 38, height: 38, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
