import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

interface SearchHistoryProps {
  history: string[];
  onHistoryItemSelect: (query: string) => void;
}

/**
 * Composant pour afficher l'historique des recherches récentes
 */
const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onHistoryItemSelect,
}) => {
  if (history.length === 0) return null;

  return (
    <View className="mt-5 pb-10 mb-6 px-3 border-b-[1px] border-orange-500/50">
      <View className="flex-row justify-between items-center mb-3">
        <View className="items-center flex-row">
          <Image
            source={require("../../assets/icons/chicken.png")}
            style={{ width: 16, height: 16, resizeMode: "contain" }}
          />
          <Text className="text-lg font-urbanist-medium ml-2 text-orange-500">
            Recherches récentes
          </Text>
        </View>
      </View>
      {history.map((item, index) => (
        <TouchableOpacity
          key={index}
          className="flex-row items-center justify-between py-3"
          onPress={() => onHistoryItemSelect(item)}
        >
          <View className="flex-row items-center">
            <Image
              source={require("../../assets/icons/clock.png")}
              style={{ width: 16, height: 16 }}
            />
            <Text className="font-urbanist-regular mb-1 text-lg ml-2 text-gray-700">
              {item}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SearchHistory;
