import React from "react";
import { TouchableOpacity, Text, TextStyle, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientButtonProps {
  colors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  className?: string;
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
  className,
  textStyle,
  onPress,
  children,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={className}
      style={style}
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        className="w-full rounded-3xl py-5 px-6"
        style={{ borderRadius: 20 }}
      >
        <Text
          className="text-white text-center font-urbanist-medium text-base"
          style={textStyle}
        >
          {children}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientButton;
