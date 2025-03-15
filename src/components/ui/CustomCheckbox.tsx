import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

/**
 * Props du composant CustomCheckbox
 */
interface CustomCheckboxProps {
  /** État du checkbox (coché ou non) */
  value: boolean;
  /** Fonction appelée lorsque l'état change */
  onValueChange: () => void;
  /** Texte à afficher à côté du checkbox */
  label: string;
}
 
const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  value,
  onValueChange,
  label,
}) => (
  <TouchableOpacity
    onPress={onValueChange}
    className="flex-row items-center justify-between mt-2"
  >
    <Text className="text-lg font-sofia-light text-black/70">{label}</Text>
    <View
      className={`w-6 h-6 border rounded mr-2 items-center justify-center ${value ? "bg-orange-500 border-orange-500" : "border-gray-400 bg-white"}`}
    >
      {value && <FontAwesome name="check" size={14} color="white" />}
    </View>
  </TouchableOpacity>
);

export default CustomCheckbox;
