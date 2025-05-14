import { Tabs } from "expo-router";
import { Image, View, Text, TouchableOpacity, Platform } from "react-native";

 
export default function TabsLayout(): JSX.Element {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarStyle: {
          height: 60,
          backgroundColor: "white",
          elevation: 0,
          borderTopWidth: 0,
          shadowOpacity: 0,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 8,
          paddingHorizontal: 16,

        },
        headerShown: false,
        tabBarLabel: ({ focused, children }) => {
          if (focused) {
            // Style pour la tab active
            return (
              <View style={{ overflow: "hidden" }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    marginTop: 2,
                    marginBottom: 4,
                    color: "#F17922",
                  }}
                >
                  {children}
                </Text>
              </View>
            );
          }

          // Style de texte pour les tabs inactives
          return (
            <Text
              style={{
                color: "#9ca3af",
                fontSize: 12,
                marginTop: 2,
                marginBottom: 4,
              }}
            >
              {children}
            </Text>
          );
        },
        tabBarIcon: ({ focused }) => {
          // Sélection de l'icône en fonction de l'onglet et de l'état actif
          let iconSource;

          switch (route.name) {
            case "index":
              iconSource = focused
                ? require("../../assets/icons/home-filled.png")
                : require("../../assets/icons/home.png");
              break;
            case "menu":
              iconSource = require("../../assets/icons/menu.png");
              break;
            case "special-offers":
              iconSource = require("../../assets/icons/special-offer.png");
              break;
            case "fidelity":
              iconSource = require("../../assets/icons/fidelity.png");
              break;
            default:
              iconSource = require("../../assets/icons/home.png");
          }

          return (
            <Image
              source={iconSource}
              style={{
                width: 24,
                height: 24,
                resizeMode: "contain",
                tintColor: focused ? "#F17922" : "#9E9E9E", 
              }}
            />
          );
        },
        tabBarButton: (props) => {
          const { children, onPress } = props;

       
          return (
            <TouchableOpacity
              onPress={onPress}
              className="flex-1 flex-row items-center justify-center mx-2 py-1 rounded-xl"
              style={{
                minHeight: 30,
              }}
            >
              <View className="items-center">{children}</View>
            </TouchableOpacity>
          );
        },
      })}
    >
      {/* Écrans de navigation pour les utilisateurs connectés */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
        }}
      />
      <Tabs.Screen
        name="special-offers"
        options={{
          title: Platform.OS === "ios" ? "Offres" : "Offres Spéciales",
        }}
      />
      <Tabs.Screen
        name="fidelity"
        options={{
          title: "Fidélité",
        }}
      />
    </Tabs>
  );
}
