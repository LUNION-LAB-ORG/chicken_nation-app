import React from "react";
import { View, Text, Image, ImageSourcePropType } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Notification } from "@/types";

type NotificationItemProps = Omit<Notification, 'userId' | 'notifBanner' | 'notifTitle' | 'data'>;

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  icon,
  iconBgColor,
  title,
  date,
  time,
  message,
  showChevron,
  isRead = false,
}) => {
  return (
    <View
      className="flex-row items-start p-4 pl-0"
      accessibilityRole="button"
      accessibilityLabel={`Notification: ${title}`}
      accessibilityHint="Appuyez pour voir les détails"
    >
      <View
        style={{ backgroundColor: iconBgColor }}
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
      >
        <Image
          source={icon}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
          accessibilityLabel={`Icône de ${title}`}
        />
      </View>

      <View className="flex-1 pr-4">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className={`text-base ${
              isRead
                ? "font-sofia-regular text-gray-900"
                : "font-sofia-bold text-orange-500"
            }`}
          >
            {title}
          </Text>
        </View>

        <View className="flex flex-row items-center">
          <Text className="text-xs font-sofia-light text-gray-500">{date}</Text>
          {/* Divider vertical entre date et heure */}
          <View className="h-3 w-[1px] bg-gray-300 mx-2" />
          <Text className="text-xs font-sofia-light text-gray-500">{time}</Text>
        </View>

        <Text
          className={`text-sm ${
            isRead
              ? "font-sofia-light text-gray-700"
              : "font-sofia-medium text-gray-900"
          } mb-1`}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>

      {showChevron && <ChevronRight size={20} color="#9E9E9E" />}
    </View>
  );
};

export default NotificationItem;
