import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AntDesign } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

interface CalendarPickerProps {
  onDateSelect?: (date: string) => void;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1)); 
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [highlightedDate, setHighlightedDate] = useState(5);  

 
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  // Obtenir le nombre de jours dans le mois
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  // Créer un tableau de dates pour le mois
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Ajouter des espaces vides pour aligner les dates correctement
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const calendar = [...blanks, ...dates];

  // Diviser le calendrier en semaines
  const weeks = [];
  let week = [];

  calendar.forEach((day, index) => {
    week.push(day);
    if ((index + 1) % 7 === 0 || index === calendar.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  const handleDatePress = (date) => {
    if (date === selectedDate) {
      // Désélectionner la date
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    onDateSelect?.(day.dateString);
  };

  const renderDay = (day) => {
    if (day === null) return <View className="w-10 h-10" />;

    const isSelected = day === selectedDate;
    const isHighlighted = day === highlightedDate;

    return (
      <TouchableOpacity
        key={day}
        onPress={() => handleDatePress(day)}
        className={`w-10 h-10 items-center justify-center rounded-full ${
          isSelected
            ? "bg-orange-500"
            : isHighlighted
              ? "border border-orange-500"
              : ""
        }`}
      >
        <Text
          className={`text-base font-urbanist-medium ${isSelected ? "text-white" : "text-[#1D1B20]"}`}
        >
          {day}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-[#FAFAFA] p-4 rounded-3xl">
      {/* En-tête avec mois et année */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center">
          <Text className="text-lg font-sofia-light text-gray-800">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity className="ml-3 mt-1">
            <AntDesign name="caretdown" size={8} color="#49454F" />
          </TouchableOpacity>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="p-2">
            <Feather name="settings" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 ml-2">
            <Feather name="settings" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Jours de la semaine */}
      <View className="flex-row justify-between mb-2">
        {DAYS.map((day, index) => (
          <View key={index} className="w-10 items-center">
            <Text className="text-base font-medium text-gray-800">{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendrier */}
      <View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row justify-between my-2">
            {week.map((day, dayIndex) => (
              <View key={dayIndex}>{renderDay(day)}</View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export default CalendarPicker;
