import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import React, { useState } from 'react';
import CustomStatusBar from '@/components/ui/CustomStatusBar';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import GradientButton from '@/components/ui/GradientButton';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateCustomer, getCustomerDetails } from '@/services/api/customer';
import { format } from 'date-fns';
import LoadingModal from '@/components/ui/LoadingModal';
import { useAuth } from '@/app/context/AuthContext';
import { useOnboarding } from '@/app/context/OnboardingContext';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '@/services/api/api';
import * as FileSystem from 'expo-file-system';
import { api } from '@/services/api/api';
import ErrorModal from '@/components/ui/ErrorModal';
import { formatImageUrl } from '@/utils/imageHelpers';

interface UserFormData {
  lastName: string;
  firstName: string;
  birthDate: Date | null;
  email: string;
  image?: string;
}

const CreateAccount = () => {
  const router = useRouter();
  const { phone, apiPhone } = useLocalSearchParams<{ phone: string; apiPhone: string }>();
  const { accessToken, updateUserData } = useAuth();
  const { completeOnboarding } = useOnboarding();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [formData, setFormData] = useState<UserFormData>({
    lastName: '',
    firstName: '',
    birthDate: null,
    email: '',
    image: '', // URL d'image par défaut
  });

  const handleInputChange = (field: keyof UserFormData, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('birthDate', selectedDate);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la caméra');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleInputChange('image', result.assets[0].uri);
      }
      
      setShowImageModal(false);
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre une photo');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la galerie');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleInputChange('image', result.assets[0].uri);
      }
      
      setShowImageModal(false);
    } catch (error) {
      console.error('Erreur lors de la sélection d\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner une image');
    }
  };

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      
      // 1. Validation des champs obligatoires
      if (!formData.firstName || !formData.lastName || !formData.birthDate) {
        setErrorMessage('Veuillez remplir tous les champs obligatoires');
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }
      
      // 2. Vérification du token d'authentification
      const token = accessToken;
      if (!token) {
        setErrorMessage('Vous n\'êtes pas authentifié');
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }
      
      // 3. Préparation des données du formulaire (FormData)
      const formDataToSend = new FormData();
      
      // Ajouter les champs de base
      formDataToSend.append('first_name', formData.firstName);
      formDataToSend.append('last_name', formData.lastName);
      
      // Ajouter la date de naissance formatée
      if (formData.birthDate) {
        const formattedBirthDay = format(formData.birthDate, 'dd/MM/yyyy');
        formDataToSend.append('birth_day', formattedBirthDay);
      }
      
      // Ajouter l'email s'il est présent
      if (formData.email) {
        formDataToSend.append('email', formData.email);
      }
      
      // Vérifier si le FormData contient des données à envoyer
      let hasData = false;
      let hasNewImage = false;
      
      // @ts-ignore
      for (let [key, value] of formDataToSend._parts || []) {
        hasData = true;
        break;
      }
      
      // 4. Ajouter l'image si présente
      if (formData.image) {
        // Extraire le nom du fichier de l'URI
        const uriParts = formData.image.split('/');
        const fileName = uriParts[uriParts.length - 1];
        // Déterminer le type MIME
        const fileType = fileName.split('.').pop()?.toLowerCase() === 'png' 
          ? 'image/png' 
          : 'image/jpeg';
        // Ajouter l'image au FormData
        formDataToSend.append('image', {
          uri: formData.image,
          name: fileName,
          type: fileType,
        } as any);
        hasNewImage = true;
        hasData = true;
      }
      // Ajout du numéro de téléphone
      if (apiPhone && apiPhone.trim()) {
        formDataToSend.append('phone', apiPhone.trim());
        console.log('Numéro de téléphone envoyé:', apiPhone.trim());
      }
      if (!hasData) {
        setErrorMessage("Aucune modification à enregistrer");
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }
      // Log du contenu du FormData
      if ((formDataToSend as any)._parts) {
        for (let [key, value] of (formDataToSend as any)._parts) {
          console.log('FormData part:', key, value);
        }
      }
      // Envoi avec fetch natif (PAS Axios)
      const apiUrl = `${api.defaults.baseURL}/v1/customer`;
      console.log('API URL utilisée pour PATCH:', apiUrl);
      try {
        const fetchResponse = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            // PAS de Content-Type ici !
          },
          body: formDataToSend,
        });
        const data = await fetchResponse.json();
        console.log('Réponse fetch natif:', data);
        if (fetchResponse.ok) {
          setSuccessMessage('Profil créé avec succès !');
          updateUserData({
            ...formData,
            ...data,
            phone: data.phone || apiPhone,
            image: data.image ? formatImageUrl(data.image) : formData.image,
          });
          // Recharger les données utilisateur depuis l'API pour s'assurer d'avoir les données les plus récentes
          try {
            const freshUserData = await getCustomerDetails();
            if (freshUserData) {
              updateUserData(freshUserData);
              console.log('Données utilisateur rechargées depuis l\'API');
            }
          } catch (refreshError) {
            console.error('Erreur lors du rechargement des données utilisateur:', refreshError);
          }
          completeOnboarding();
          router.replace('/onboarding/welcome');
        } else {
          setErrorMessage('Erreur lors de la création du profil : ' + (data?.message || fetchResponse.status));
          setShowErrorModal(true);
        }
      } catch (fetchErr) {
        console.error('Erreur lors de la création du profil (fetch natif):', fetchErr);
        setErrorMessage('Erreur réseau (fetch natif) : ' + (fetchErr.message || ''));
        setShowErrorModal(true);
      }
      setIsLoading(false);
      return;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      console.error('Détails de l\'erreur:', error.response);
      
      // Gestion des erreurs avec des messages conviviaux
      if (error.response) {
        switch (error.response.status) {
          case 409:
            setErrorMessage('Cette adresse email est déjà utilisée par un autre compte');
            break;
          case 400:
            setErrorMessage('Les informations fournies ne sont pas valides');
            break;
          case 401:
            setErrorMessage('Votre session a expiré, veuillez vous reconnecter');
            break;
          case 413:
            setErrorMessage('L\'image est trop volumineuse, veuillez en choisir une plus légère');
            break;
          default:
            setErrorMessage('Une erreur est survenue lors de la mise à jour de votre profil');
        }
      } else if (error.request) {
        setErrorMessage('Impossible de contacter le serveur, veuillez vérifier votre connexion internet');
      } else {
        setErrorMessage('Une erreur inattendue est survenue');
      }
      
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View className='flex-1 bg-white p-6 relative'>
      <StatusBar style="dark" />  
      <View className="absolute top-0 left-0 right-0">
        <CustomStatusBar /> 
      </View>
      
      {/* Header avec bouton retour */}
      <View className="flex-row items-center mt-10 mb-6">
        <TouchableOpacity onPress={handleBack} className="pr-4">
          <Feather name="arrow-left" size={24} color="#F97316" />
        </TouchableOpacity>
        <Text className="text-center flex-1 text-xl font-urbanist-bold text-orange-500">Création du compte</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Avatar placeholder */}
        <View className="items-center justify-center mb-8">
          <View className="w-24 h-24 rounded-full items-center justify-center">
            {formData.image ? (
              <Image 
                source={{ uri: formData.image }} 
                className="w-24 h-24 rounded-full" 
              />
            ) : (
              <Image  
                source={require('@/assets/icons/people.png')} 
                className="w-24 h-24" 
                style={{ tintColor: '#FFDFC8' }}
              />
            )}
          </View>
          <TouchableOpacity 
            onPress={() => setShowImageModal(true)}
            className="absolute bottom-0 right-44 bg-orange-500 p-1.5 rounded-full"
          >
            <Feather name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Formulaire */}
        <View className="space-y-4">
          {/* Nom */}
          <View className="bg-slate-100 rounded-3xl p-4 mb-3" style={{padding: Platform.OS === "ios" ? 22 : 16}}>
            <TextInput
              placeholder="Nom"
              placeholderTextColor={"#9CA3AF"}
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              className="font-urbanist-medium"
            />
          </View>

          {/* Prénom */}
         <View className="bg-slate-100 rounded-3xl p-4 mb-3" style={{padding: Platform.OS === "ios" ? 22 : 16}}>
            <TextInput
              placeholder="Prénom"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              className="font-urbanist-medium"
              placeholderTextColor={"#9CA3AF"}
            />
          </View>

          {/* Date de naissance */}
          <TouchableOpacity 
            className="bg-slate-50 rounded-3xl p-4 flex-row justify-between items-center mb-3"
            style={{padding: Platform.OS === "ios" ? 22 : 16}}
            onPress={() => setShowDatePicker(true)}
          >
            <TextInput
              placeholder="Date de naissance"
              value={formatDate(formData.birthDate)}
              editable={false}
              className="font-urbanist-medium flex-1"
              placeholderTextColor={"#9CA3AF"}
            />
            <MaterialIcons name="date-range" size={24} color="#334155" />
            {showDatePicker && (
              <DateTimePicker
                value={formData.birthDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'default' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
      
          </TouchableOpacity>
 

          {/* Email */}
          <View className="bg-slate-50 rounded-3xl p-4 flex-row justify-between items-center mb-6"
          style={{padding: Platform.OS === "ios" ? 22 : 16}}
          >
            <TextInput
              placeholder="Email (Optionnel)"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              className="font-urbanist-medium flex-1"
              placeholderTextColor={"#9CA3AF"}
            />
            <MaterialIcons name="email" size={24} color="#334155" />
          </View>

          {/* Note sur l'email */}
          <View className="bg-orange-100 rounded-xl p-3 mb-4">
            <Text className="text-center text-gray-700 font-urbanist-medium text-sm">
              Ajoutez un mail pour recevoir les newsletters{"\n"}
              Votre mail ne sera pas diffusé
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bouton Continuer */}
      <View className="mt-4 mb-2">
        <GradientButton 
          onPress={handleContinue} 
          
          disabled={!formData.firstName || !formData.lastName || !formData.birthDate || isLoading}
        >
          {isLoading ? "Chargement..." : "Continuer"}
        </GradientButton>
      </View>

     
      {/* Modal pour la sélection d'image */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-orange-500 text-xl font-urbanist-bold mb-6 text-start ml-2">Photo de profil</Text>
            
            <TouchableOpacity 
              onPress={takePhoto}
              className="flex-row items-center py-4  ml-2 "
            >
              <Image source={require('@/assets/icons/camera.png')} className="w-6 h-6" />
              <Text className="ml-4 text-gray-700 font-urbanist-medium">Appareil photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={pickImage}
              className="flex-row items-center py-4 ml-2 "
            >
              <Image source={require('@/assets/icons/image.png')} className="w-6 h-6" />
              <Text className="ml-4 text-gray-700 font-urbanist-medium">Importez une photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowImageModal(false)}
              className="mt-6 border-2 border-orange-500 rounded-full py-4"
            >
              <Text className="text-center text-orange-500 text-lg font-urbanist-medium">Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal de chargement */}
      <LoadingModal visible={isLoading} />
      
      {/* Modal d'erreur */}
      <ErrorModal 
        visible={showErrorModal} 
        message={errorMessage} 
        onClose={() => setShowErrorModal(false)} 
      />
    </View>
  );
};

export default CreateAccount;