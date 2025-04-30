import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import CustomCheckbox from "@/components/ui/CustomCheckbox";

type SupplementItem = {
  id: string;
  name: string;
  price: string;
};

type SupplementCategory = {
  category: string;
  type: string;
  isIncluded: boolean;
  items: SupplementItem[];
  required?: boolean;
};

type ProductSupplementsProps = {
  includedSupplements: SupplementCategory[];
  paidSupplements: SupplementCategory[];
  showCustomizations: boolean;
  onToggleCustomizations: () => void;
  isSupplementSelected: (category: string, name: string) => boolean;
  onSupplementSelect: (category: string, supplement: any) => void;
};

/**
 * Composant pour afficher et gérer les suppléments inclus et payants
 */
const ProductSupplements: React.FC<ProductSupplementsProps> = ({
  includedSupplements,
  paidSupplements,
  showCustomizations,
  onToggleCustomizations,
  isSupplementSelected,
  onSupplementSelect,
}) => {
  // Rendu des suppléments inclus
  const renderIncludedSupplements = () => {
    if (includedSupplements.length === 0) return null;

    return (
      <View className="mt-4 bg-gray-100 p-4 rounded-3xl">
        <Text className="text-lg font-sofia-light text-black/50">
          Ce qui est inclus
        </Text>
        {includedSupplements.map((supp, index) => (
          <View key={index} className="mt-2">
            <Text className="text-lg font-sofia-light text-black/70">
              {supp.required ? "1 x " : ""}
              {supp.type}
            </Text>
            {supp.items && supp.items.map((item, idx) => (
              <Text
                key={idx}
                className="ml-4 text-sm font-sofia-light text-black/50"
              >
                • {item.name}
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  };

  // Rendu de la section de personnalisation (suppléments payants)
  const renderCustomizationSection = () => {
    if (paidSupplements.length === 0) return null;
    
    return (
      <View className="mt-4 bg-gray-100 p-4 mb-44 rounded-3xl">
        <TouchableOpacity
          className="flex-row justify-between items-center"
          onPress={onToggleCustomizations}
        >
          <Text className="text-lg font-sofia-light text-black/70">
            Personnaliser
          </Text>
          <Image
            source={
              showCustomizations
                ? require("../../assets/icons/close.png")
                : require("../../assets/icons/arrow-right-2.png")
            }
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
        </TouchableOpacity>
        
        {showCustomizations && (
          <View className="mt-4">{renderPaidSupplements()}</View>
        )}
      </View>
    );
  };

  // Rendu des suppléments payants
  const renderPaidSupplements = () => {
    return paidSupplements.map((category) => (
      <View key={category.category} className="mt-4 bg-gray-100 p-4 rounded-3xl">
        <Text className="text-lg font-sofia-medium text-black/70">
          {category.type}
          {category.isIncluded && (
            <Text className="text-sm font-sofia-light text-green-600">
              {" "}
              (Inclus)
            </Text>
          )}
        </Text>
        
        {category.items.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center justify-between py-1 border-b border-gray-100"
          >
            <View className="flex-1">
              <Text className="font-urbanist-medium">
                {item.name} {!category.isIncluded && (
                  <Text className="text-gray-700 font-urbanist-bold">- {item.price} FCFA</Text>
                )}
              </Text>
            </View>
            <CustomCheckbox
              isChecked={isSupplementSelected(category.category, item.name)}
              onPress={() =>
                onSupplementSelect(category.category, {
                  ...item,
                  isIncluded: category.isIncluded || false,
                })
              }
            />
          </View>
        ))}
      </View>
    ));
  };

  return (
    <>
      {renderIncludedSupplements()}
      {renderCustomizationSection()}
    </>
  );
};

export default ProductSupplements;
