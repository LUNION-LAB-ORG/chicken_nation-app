import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Props du composant CustomCheckbox
 */
interface CustomCheckboxProps {
  /** État du checkbox (coché ou non) */
  isChecked?: boolean;
  /** Fonction appelée lorsque l'état change */
  onPress: () => void;
  /** Texte à afficher à côté du checkbox (optionnel) */
  label?: string;
}
 
const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  isChecked = false,
  onPress,
  label,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center"
  >
    {label && <Text className="text-lg font-sofia-light text-black/70 mr-2">{label}</Text>}
    {isChecked ? (
      <LinearGradient
        colors={["#F17922", "#FA6345"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 6 }}
        className="w-8 h-8 items-center justify-center"
      >
        <FontAwesome name="check" size={16} color="white" />
      </LinearGradient>
    ) : (
      <View
        className="w-8 h-8 border rounded-md border-gray-400 bg-white items-center justify-center"
      />
    )}
  </TouchableOpacity>
);

export default CustomCheckbox;
