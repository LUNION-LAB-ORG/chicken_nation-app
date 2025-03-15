import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";

interface PriceSliderProps {
  minValue?: number;
  maxValue?: number;
  initialValue?: number;
  onValueChange?: (value: number) => void;
  containerStyle?: object;
  step?: number;
}

const PriceSlider: React.FC<PriceSliderProps> = ({
  minValue = 0,
  maxValue = 10000,
  initialValue = 0,
  onValueChange,
  step = 100,
}) => {
  // États
  const [sliderValue, setSliderValue] = useState(initialValue);
  const [width, setWidth] = useState(Dimensions.get("window").width - 32);

  // Nombre de graduations
  const tickCount = 35;

  // Gérer le changement de valeur
  const handleValueChange = (value: number[]) => {
    // Arrondir la valeur au step le plus proche
    const roundedValue = Math.round(value[0] / step) * step;
    setSliderValue(roundedValue);

    if (onValueChange) {
      onValueChange(roundedValue);
    }
  };

  // Calculer le pourcentage de progression
  const getProgressPercentage = () => {
    return ((sliderValue - minValue) / (maxValue - minValue)) * 100;
  };

  // Générer les graduations
  const renderTicks = () => {
    return Array.from({ length: tickCount }).map((_, i) => {
      const isLongTick = (i + 1) % 5 === 0;
      const progress = getProgressPercentage() / 100;
      const tickPosition = i / (tickCount - 1);
      const isActive = tickPosition <= progress;

      return (
        <View
          key={i}
          style={[
            styles.tick,
            {
              height: isLongTick ? 20 : 8,
              backgroundColor: isActive ? "#FF6530" : "#9796A1",
              width: isActive ? 2.3 : 1.3,
            },
          ]}
        />
      );
    });
  };

  // Mesurer la largeur du conteneur
  const onLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setWidth(width);
  };

  // Rendu du composant 
  const renderThumbComponent = () => {
    return <View style={styles.customThumb} />;
  };

  return (
    <View onLayout={onLayout}>
      <View className="p-8" style={styles.sliderContainer}>
        {/* Graduations */}
        <View style={styles.ticksContainer}>{renderTicks()}</View>

        {/* Slider */}
        <View style={styles.sliderWrapper}>
          <Slider
            containerStyle={styles.slider}
            minimumValue={minValue}
            maximumValue={maxValue}
            step={step}
            value={[sliderValue]}
            onValueChange={handleValueChange}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbStyle={styles.thumb}
            renderThumbComponent={renderThumbComponent}
          />
        </View>
      </View>

      {/* Étiquettes Min/Max */}
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>Moins de {minValue.toLocaleString()}</Text>
        <Text style={styles.valueLabel}>
          {sliderValue.toLocaleString()} Fcfa
        </Text>
        <Text style={styles.label}>Plus de {maxValue.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 26,
  },
  sliderContainer: {
    position: "relative",
    height: 90,
    marginBottom: 10,
    padding: 6,
  },
  bubbleContainer: {
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
  bubble: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bubbleText: {
    color: "#FF6530",
    fontWeight: "500",
    fontSize: 14,
  },
  ticksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "absolute",
    width: "100%",
    top: 40,
    zIndex: 1,
  },
  tick: {
    width: 1,
    height: 8,
    backgroundColor: "#E8E8E8",
  },
  sliderWrapper: {
    position: "absolute",
    width: "100%",
    top: 40,
    zIndex: 2,
    height: 40,
    borderBottomWidth: 3,
    borderBottomColor: "#E8E8E8",
  },
  slider: {
    height: 80,
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  label: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "300",
  },
  valueLabel: {
    fontSize: 14,
    color: "#FF6530",
    fontWeight: "500",
  },
  thumb: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
  },
  customThumb: {
    width: 25,
    height: 25,
    borderRadius: 30,
    backgroundColor: "#F17922",
  },
});

export default PriceSlider;
