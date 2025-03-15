import React from "react";
import { Text, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

interface GradientTextProps {
  colors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  className?: string;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
  fontSize?: number;
  fontFamily?: string;
}

const GradientText: React.FC<GradientTextProps> = ({
  colors = ["#F17922", "#FA6345"] as const,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  className,
  children,
  fontSize = 28,
  fontFamily = "Urbanist-Bold",
}) => {
  // Style de base pour le texte
  const textStyle = {
    fontSize,
    fontFamily,
    ...(typeof style === "object" && !Array.isArray(style) ? style : {}),
  };

  return (
    <MaskedView
      maskElement={
        <Text style={textStyle} className={className}>
          {children}
        </Text>
      }
    >
      <LinearGradient colors={colors} start={start} end={end}>
        <Text style={[textStyle, { opacity: 0 }]} className={className}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
