import { View, Image } from "react-native";
import React from "react";

const CustomStatusBar = () => {
  return (
    <View>
      <Image
        source={require("../../assets/images/statusbar.png")}
        style={{
          width: "100%",
          height: 70,
          resizeMode: "contain",
          marginTop: -10,
        }}
      />
    </View>
  );
};

export default CustomStatusBar;
