import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

interface TimePickerProps {
  selectedHour: string;
  selectedMinute: string;
  onHourChange: (hour: string) => void;
  onMinuteChange: (minute: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
}) => {
  // Générer les heures (de 10h à 22h)
  const hours = Array.from({ length: 13 }, (_, i) => `${i + 10}`);
  
  // Générer les minutes (par tranches de 15 minutes)
  const minutes = ["00", "15", "30", "45"];

  return (
    <View className="bg-[#FAFAFA] p-4 rounded-3xl">
      <Text className="text-lg font-sofia-medium mb-4 text-center">
        Sélectionnez l'heure
      </Text>
      
      <View className="flex-row justify-center items-center">
        {/* Sélecteur d'heures */}
        <View className="w-20 h-40 mr-2">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 60 }}
          >
            {hours.map((hour) => (
              <TouchableOpacity
                key={hour}
                onPress={() => onHourChange(hour)}
                className={`h-12 justify-center items-center my-1 rounded-xl ${
                  selectedHour === hour ? "bg-orange-500" : "bg-white"
                }`}
              >
                <Text
                  className={`text-lg font-urbanist-medium ${
                    selectedHour === hour ? "text-white" : "text-gray-800"
                  }`}
                >
                  {hour}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <Text className="text-2xl font-urbanist-bold mx-2">:</Text>
        
        {/* Sélecteur de minutes */}
        <View className="w-20 h-40 ml-2">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 60 }}
          >
            {minutes.map((minute) => (
              <TouchableOpacity
                key={minute}
                onPress={() => onMinuteChange(minute)}
                className={`h-12 justify-center items-center my-1 rounded-xl ${
                  selectedMinute === minute ? "bg-orange-500" : "bg-white"
                }`}
              >
                <Text
                  className={`text-lg font-urbanist-medium ${
                    selectedMinute === minute ? "text-white" : "text-gray-800"
                  }`}
                >
                  {minute}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <View className="mt-4">
        <Text className="text-center text-lg font-urbanist-medium">
          {selectedHour}:{selectedMinute}
        </Text>
      </View>
    </View>
  );
};

export default TimePicker; 