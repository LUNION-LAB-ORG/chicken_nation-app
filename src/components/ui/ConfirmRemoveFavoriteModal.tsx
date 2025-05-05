import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence, 
  Easing,
} from "react-native-reanimated"; 
import { LinearGradient } from "expo-linear-gradient";

interface ConfirmRemoveFavoriteModalProps {
  visible: boolean;
  dishName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const { width } = Dimensions.get("window");

const ConfirmRemoveFavoriteModal: React.FC<ConfirmRemoveFavoriteModalProps> = ({
  visible,
  dishName,
  onConfirm,
  onCancel,
}) => {
  // Animation
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
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
      onRequestClose={onCancel}
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
              <Image source={require("../../assets/icons/triste.png")} style={{ width: 80, height: 80, resizeMode: "contain" }} />
            </LinearGradient>
          </View>
          <Text style={styles.message}>
            Voulez-vous vraiment retirer {dishName} de vos favoris ?
          </Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
              <LinearGradient
                colors={["#F17922", "#FA6345"]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.confirmText}>Retirer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    width: width * 0.85,
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
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
    fontFamily: "Urbanist-Medium",
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 15,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 15,
  },
  confirmText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
  },
});

export default ConfirmRemoveFavoriteModal;
