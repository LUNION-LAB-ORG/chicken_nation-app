import React from "react";
import { TouchableOpacity, Text, TextStyle, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientButtonProps {
  colors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  colors = ["#F17922", "#FA6345"] as const,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  textStyle,
  onPress,
  children,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[{ width: "100%" }, style]}
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={{
          width: "100%",
          paddingVertical: 18,
          paddingHorizontal: 24,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={[
            {
              color: "#fff",
              fontSize: 16,
              textAlign: "center",
              fontFamily: "Urbanist-Medium",
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientButton;
