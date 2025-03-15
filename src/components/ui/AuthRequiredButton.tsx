import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';

interface AuthRequiredButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
}

const AuthRequiredButton: React.FC<AuthRequiredButtonProps> = ({
  onPress,
  children,
  className = "",
  textClassName = "",
  disabled = false,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const handlePress = () => {
    if (!user) {
      Alert.alert(
        "Authentification requise",
        "Vous devez être connecté pour accéder à cette fonctionnalité.",
        [
          {
            text: "Annuler",
            style: "cancel"
          },
          {
            text: "Se connecter",
            onPress: () => router.push("/onboarding/guestAuth")
          }
        ]
      );
      return;
    }

    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`${className} ${!user ? 'opacity-50' : ''}`}
      disabled={disabled}
    >
      {typeof children === 'string' ? (
        <Text className={textClassName}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default AuthRequiredButton; 