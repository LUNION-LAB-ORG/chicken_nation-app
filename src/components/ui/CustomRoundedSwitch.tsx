import React from 'react';
import { TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';

// Props du composant
interface CustomRoundedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

// Dimensions de base du switch
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCALE = SCREEN_WIDTH < 380 ? 0.9 : 1; 

const CustomRoundedSwitch: React.FC<CustomRoundedSwitchProps> = ({ value, onValueChange }) => {
  // Animation du curseur
  const translateX = React.useRef(new Animated.Value(value ? 20 : 0)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 20 : 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }, [value]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[
        styles.container,
        { backgroundColor: value ? '#F97316' : '#E5E7EB' }
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};
 
const styles = StyleSheet.create({
  container: {
    width: 44 * SCALE,
    height: 24 * SCALE,
    borderRadius: 12 * SCALE,
    padding: 2 * SCALE,
    justifyContent: 'center',
  },
  thumb: {
    width: 20 * SCALE,
    height: 20 * SCALE,
    borderRadius: 10 * SCALE,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CustomRoundedSwitch; 