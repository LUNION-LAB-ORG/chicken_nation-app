import { View, Image, StyleSheet } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import HomeHeader from "../home/HomeHeader";

const CustomStatusBarWithHeader = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.headerContainer}>
        <Image
          source={require("../../assets/images/statusbar.png")}
          style={styles.image}
        />
        <View className="px-6 mt-2 mb-6">
          <HomeHeader />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    elevation: 1000,
    zIndex: 1000,
  },
  headerContainer: {
    position: "relative",
    width: "100%",
  },
  image: {
    width: "100%",
    height: 70,
    resizeMode: "contain",
    marginTop: -10,
  },
});

export default CustomStatusBarWithHeader;
