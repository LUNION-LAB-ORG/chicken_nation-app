import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import PriceSlider from "@/components/ui/PriceSlider";

interface SearchFilterProps {
  sortOptions: string[];
  selectedSort: string;
  onSortChange: (option: string) => void;
  sliderValue: number;
  onSliderChange: (value: number) => void;
  minPrice: number;
  maxPrice: number;
}

/**
 * Composant de filtrage pour la recherche
 */
const SearchFilter: React.FC<SearchFilterProps> = ({
  sortOptions,
  selectedSort,
  onSortChange,
  sliderValue,
  onSliderChange,
  minPrice = 2000,
  maxPrice = 10000,
}) => {
  return (
    <View className="bg-white rounded-t-3xl">
      <View className="px-6 pb-8 mt-4">
        <View className="flex-row items-center mb-6">
          <Image
            source={require("../../assets/icons/chicken.png")}
            className="w-5 h-5 mr-2"
            style={{ tintColor: "#f97316" }}
          />
          <Text className="text-orange-500 font-sofia-light text-lg">
            Filtrage
          </Text>
        </View>

        <Text className="text-textdark text-[14px] -ml-4 font-bold mb-10">
          Trier par
        </Text>

        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option}
            className="flex-row items-center justify-between py-2"
            onPress={() => onSortChange(option)}
          >
            <Text
              className={`text-[14px] font-sofia-regular ${selectedSort === option ? "text-orange-500" : "text-gray-600"}`}
            >
              {option}
            </Text>
            {selectedSort === option && (
              <Image
                source={require("../../assets/icons/check.png")}
                className="w-7 h-7"
                style={{ tintColor: "#f97316" }}
              />
            )}
          </TouchableOpacity>
        ))}

        <Text className="text-[14px] font-bold -ml-4 -mb-8 mt-16">Montant</Text>
        <View>
          <PriceSlider
            minValue={minPrice}
            maxValue={maxPrice}
            initialValue={sliderValue}
            onValueChange={onSliderChange}
          />
        </View>
      </View>
    </View>
  );
};

export default SearchFilter;
