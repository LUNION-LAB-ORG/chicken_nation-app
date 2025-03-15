import React from "react";
import { FlatList, View, Text, Image, ListRenderItem } from "react-native";
import { MenuItem as MenuItemType } from "@/types";
import MenuItem from "@/components/menu/MenuItem";

interface SearchResultsProps {
  results: MenuItemType[];
}

 
const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <View className="items-center justify-center flex-1 mt-20">
        <View className="items-center justify-center">
          <Image
            source={require("../../assets/icons/no-result.png")}
            style={{ width: 120, height: 120, resizeMode: "contain" }}
          />
          <Text className="text-xl font-urbanist-bold text-center mb-2 mt-4 text-black">
            Aucun résultat
          </Text>
          <Text className="text-gray-500 text-center font-urbanist-regular px-8">
            Désolé, le mot-clé que tu as saisi n'as pas été trouvé
          </Text>
        </View>
      </View>
    );
  }

  const renderItem: ListRenderItem<MenuItemType> = ({ item }) => (
    <MenuItem
      id={item.id}
      name={item.name}
      price={`${item.price} FCFA`}
      image={item.image}
      isNew={item.isNew ? "NOUVEAU" : undefined}
      description={item.description}
    />
  );

  return (
    <FlatList
      data={results}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      className="mt-4"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  );
};

export default SearchResults;
