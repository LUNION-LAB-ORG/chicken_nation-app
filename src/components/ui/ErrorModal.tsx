import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { AlertTriangle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ErrorModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const { width } = Dimensions.get("window");

const ErrorModal: React.FC<ErrorModalProps> = ({ visible, message, onClose }) => {
  // Animation
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) })
      );
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = 0.3;
      opacity.value = 0;
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#F17922", "#FA6345"]}
              style={styles.iconBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AlertTriangle color="#fff" size={40} />
            </LinearGradient>
          </View>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Fermer</Text>
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
  message: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    fontFamily: "Urbanist-Medium",
    marginBottom: 24,
    lineHeight: 26,
  },
  closeButton: {
    borderRadius: 15,
    backgroundColor: "#F17922",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  closeText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Urbanist-Bold",
  },
});

export default ErrorModal;
