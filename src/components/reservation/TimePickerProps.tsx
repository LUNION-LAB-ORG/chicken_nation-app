import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

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
  const handleHourChange = (increment: number) => {
    let newHour = (parseInt(selectedHour) + increment + 24) % 24;
    onHourChange(newHour.toString().padStart(2, "0"));
  };

  const handleMinuteChange = (increment: number) => {
    let newMinute = (parseInt(selectedMinute) + increment + 60) % 60;
    onMinuteChange(newMinute.toString().padStart(2, "0"));
  };

  return (
    <View
      className="border-slate-200 border-[1px] rounded-3xl bg-[#FAFAFA]"
      style={styles.container}
    >
      <View style={styles.timeBlock}>
        <TouchableOpacity
          onPress={() => handleHourChange(1)}
          style={styles.button}
        >
          <AntDesign name="up" size={16} color="gray" />
        </TouchableOpacity>

        <Text className="font-urbanist-medium" style={styles.timeText}>
          {selectedHour}
        </Text>

        <TouchableOpacity
          onPress={() => handleHourChange(-1)}
          style={styles.button}
        >
          <AntDesign name="down" size={16} color="gray" />
        </TouchableOpacity>
      </View>

      <Text style={styles.separator}>:</Text>

      <View style={styles.timeBlock}>
        <TouchableOpacity
          onPress={() => handleMinuteChange(1)}
          style={styles.button}
        >
          <AntDesign name="up" size={16} color="#C4C4C4" />
        </TouchableOpacity>

        <Text
          className="font-urbanist-medium text-[#595959]"
          style={styles.timeText}
        >
          {selectedMinute}
        </Text>

        <TouchableOpacity
          onPress={() => handleMinuteChange(-1)}
          style={styles.button}
        >
          <AntDesign name="down" size={16} color="#C4C4C4" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 20,
  },
  timeBlock: {
    alignItems: "center",
    borderRadius: 15,
    padding: 4,
    width: "60%",
  },
  button: {
    padding: 8,
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  separator: {
    fontSize: 14,
    fontFamily: "Urbanist-Bold",
    color: "gray",
    marginHorizontal: 16,
  },
});

export default TimePicker;
