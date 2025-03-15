import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SimpleBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

const SimpleBottomSheet: React.FC<SimpleBottomSheetProps> = ({
  isVisible,
  onClose,
}) => {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <Animated.View 
            style={[
              styles.container,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.content}>
                <View style={styles.header}>
                  <View style={styles.handle} />
                  <Text style={styles.title}>Menu</Text>
                </View>
                
                <View style={styles.body}>
                  <Text style={styles.text}>
                    Test du bottom sheet
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C274C',
    fontFamily: 'sofia-medium',
  },
  body: {
    paddingVertical: 20,
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'sofia-regular',
  },
});

export default SimpleBottomSheet; 