import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

interface SuccessModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const { width } = Dimensions.get("window");

/**
 * Modal de succès personnalisé avec animation
 */
const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  message,
  onClose,
}) => {
  // Valeurs d'animation
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const checkmarkOpacity = useSharedValue(0);

  // Lancer les animations quand le modal devient visible
  useEffect(() => {
    if (visible) {
      // Animation d'entrée du modal
      scale.value = withSequence(
        withTiming(1.1, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) }),
      );
      opacity.value = withTiming(1, { duration: 300 });

      // Animation du checkmark avec délai
      checkmarkScale.value = withDelay(
        400,
        withSequence(
          withTiming(1.2, { duration: 200, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 100 }),
        ),
      );
      checkmarkOpacity.value = withDelay(400, withTiming(1, { duration: 200 }));
    } else {
      // Réinitialiser les valeurs quand le modal n'est pas visible
      scale.value = 0.3;
      opacity.value = 0;
      checkmarkScale.value = 0;
      checkmarkOpacity.value = 0;
    }
  }, [visible]);

  // Styles animés
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.container, containerStyle]}>
          {/* Cercle avec checkmark */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#F17922", "#FA6345"]}
              style={styles.iconBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View style={checkmarkStyle}>
                <Image
                  source={require("../../assets/icons/check.png")}
                  style={styles.checkmark}
                />
              </Animated.View>
            </LinearGradient>
          </View>

          {/* Message de succès */}
          <Text style={styles.message}>{message}</Text>

          {/* Bouton OK */}
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <LinearGradient
              colors={["#F17922", "#FA6345"]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>OK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.82,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 24,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    marginTop: 10,
    marginBottom: 24,
    alignItems: "center",
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    tintColor: "white",
  },
  message: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    fontFamily: "Urbanist-Medium",
    marginBottom: 24,
    lineHeight: 26,
  },
  button: {
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 8,
  },
  gradient: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Urbanist-Bold",
  },
});

export default SuccessModal;
