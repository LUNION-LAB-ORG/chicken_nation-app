import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { LogOut } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ConfirmLogoutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const { width } = Dimensions.get("window");

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({
  visible,
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
              <LogOut color="#fff" size={40} />
            </LinearGradient>
          </View>
          <Text style={styles.message}>
            Voulez-vous vraiment vous déconnecter ?
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
                <Text style={styles.confirmText}>Se déconnecter</Text>
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
  buttonsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: Platform.OS === "ios" ? 6 : 15,
    paddingHorizontal: Platform.OS === "ios" ? 4 : 1,
  },
  cancelText: {
    color: "#333",
    fontFamily: "Urbanist-Bold",
    fontSize: Platform.OS === "ios" ? 14 : 18,
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
   
    fontFamily: "Urbanist-Bold",
    fontSize: Platform.OS === "ios" ? 14 : 18,
  },
});

export default ConfirmLogoutModal;
