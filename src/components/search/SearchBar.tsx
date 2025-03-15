import React from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  onFilterPress: () => void;
}

/**
 * Barre de recherche avec filtrage instantané
 * Affiche les résultats au fur et à mesure de la saisie
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmitEditing,
  onFilterPress,
}) => {
  return (
    <View className="w-full h-[50px] bg-white border-[1px] border-[#9796A1] rounded-full flex flex-row items-center justify-between px-4">
      <View className="flex-row items-center flex-1 mr-3">
        <Image
          source={require("../../assets/icons/search.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onEndEditing={onSubmitEditing}
          placeholder="trouver un truc à grignoter"
          className="ml-3 text-[14px] text-[#9796A1] font-sofia-light flex-1"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <TouchableOpacity onPress={onFilterPress}>
        <Image
          source={require("../../assets/icons/filter.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
