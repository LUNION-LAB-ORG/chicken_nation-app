import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const SimpleGradientButton = ({ title, onPress, isSelected }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.buttonContainer}>
      {isSelected ? (
        <LinearGradient
          colors={["#FFA500", "#FF4500"]}
          start={{ x: 0, y: 9 }}
          end={{ x: 4, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.button, styles.unselectedButton]}>
          <Text style={[styles.buttonText, styles.unselectedButtonText]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    margin: 5,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  unselectedButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FFA500",
  },
  unselectedButtonText: {
    color: "#FFA500",
  },
});

export default SimpleGradientButton;
