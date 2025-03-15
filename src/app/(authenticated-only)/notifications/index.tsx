import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import NotificationItem from "@/components/notifications/notification-item";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { notifications as notificationsData } from "@/data/MockedData";
import { Notification } from "@/types";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import CustomStatusBar from "@/components/ui/CustomStatusBar";

const Notifications: React.FC = () => {
  const router = useRouter();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
  const slideOffset = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideOffset.value }],
  }));

  const toggleSelectionMode = (notification: Notification) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedNotifications([notification.id]);
      slideOffset.value = withSpring(15);
    }
  };

  const toggleNotificationSelection = (notification: Notification) => {
    setSelectedNotifications((prev) => {
      if (prev.includes(notification.id)) {
        const newSelection = prev.filter((id) => id !== notification.id);
        if (newSelection.length === 0) {
          setIsSelectionMode(false);
          slideOffset.value = withSpring(0);
        }
        return newSelection;
      }
      return [...prev, notification.id];
    });
  };

  const handleNotificationPress = (notification: Notification) => {
    if (isSelectionMode) {
      toggleNotificationSelection(notification);
    } else {
      const encodedNotification = encodeURIComponent(
        JSON.stringify(notification),
      );
      router.push({
        pathname: `/(authenticated-only)/notifications/${notification.id}`,
        params: { notification: encodedNotification },
      });
    }
  };

  const handleDeleteSelected = () => {
    // Filtrer les notifications pour ne garder que celles qui ne sont pas sélectionnées
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => !selectedNotifications.includes(notification.id),
      ),
    );

    // Réinitialiser le mode sélection
    setSelectedNotifications([]);
    setIsSelectionMode(false);
    slideOffset.value = withSpring(0);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      {/* Header */}
      <View className="flex-row items-center justify-between px-3 pb-4">
        <TouchableOpacity
          onPress={() => {
            if (isSelectionMode) {
              setIsSelectionMode(false);
              setSelectedNotifications([]);
              slideOffset.value = withSpring(0);
            } else {
              router.back();
            }
          }}
        >
          <Image
            source={require("@/assets/icons/arrow-back.png")}
            className="w-10 h-10"
          />
        </TouchableOpacity>
        <Text className="text-base font-sofia-medium text-gray-900">
          {isSelectionMode
            ? `${selectedNotifications.length} sélectionné${selectedNotifications.length > 1 ? "s" : ""}`
            : "Notifications"}
        </Text>
        <TouchableOpacity
          onPress={isSelectionMode ? handleDeleteSelected : undefined}
          className={!isSelectionMode ? "opacity-50" : ""}
        >
          <Image
            source={
              isSelectionMode
                ? require("@/assets/icons/notifications/trash-orange.png")
                : require("@/assets/icons/notifications/trash.png")
            }
            className="w-8 h-8"
          />
        </TouchableOpacity>
      </View>

      {/* Liste des notifications */}
      <ScrollView className="flex-1">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <TouchableOpacity
              key={notification.id}
              onLongPress={() => toggleSelectionMode(notification)}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
              delayLongPress={300}
              className="active:bg-gray-50"
            >
              <View className="flex-row items-center px-2">
                {isSelectionMode ? (
                  <View className="pl-4 -pr-8">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleNotificationSelection(notification)}
                      className="p-1"
                    >
                      <View
                        className={`w-6 h-6 mb-8 rounded-full border-2 items-center justify-center ${
                          selectedNotifications.includes(notification.id)
                            ? "border-orange-500 bg-white"
                            : "border-orange-500 bg-white"
                        }`}
                      >
                        {selectedNotifications.includes(notification.id) && (
                          <View className="w-4 h-4 rounded-full bg-orange-500" />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="w-[20px]" />
                )}

                <Animated.View style={[animatedStyle, { flex: 1 }]}>
                  <NotificationItem {...notification} />
                </Animated.View>
              </View>
              {index < notifications.length - 1 && (
                <View className="h-[1px] bg-gray-100 mx-6" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center mt-20">
            <Image
              source={require("@/assets/icons/chicken.png")}
              className="w-32 h-32 mb-4"
              resizeMode="contain"
            />
            <Text className="text-lg font-sofia-medium text-gray-900 mb-2">
              Aucune notification
            </Text>
            <Text className="text-sm font-sofia-regular text-gray-500 text-center px-8">
              Vous n'avez pas encore reçu de notifications. Revenez plus tard !
            </Text>
          </View>
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default Notifications;
