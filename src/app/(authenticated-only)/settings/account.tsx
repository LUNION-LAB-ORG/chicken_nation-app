import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Dimensions, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Eye, EyeOff} from "lucide-react-native";
import { getCustomerDetails } from "@/services/api/customer";
import { useAuth } from "@/app/context/AuthContext";
import ErrorModal from "@/components/ui/ErrorModal";
import { format } from "date-fns";
import { api, setAuthToken } from "@/services/api/api"; 
import { formatImageUrl } from '@/utils/imageHelpers';

const { width } = Dimensions.get('window');
const PROFILE_IMAGE_SIZE = width * 0.85;

const AccountSettings = () => {
  const router = useRouter();
  const { user, accessToken, updateUserData } = useAuth();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date(1995, 11, 27));
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("jeanmarck@mail.com");
  const [tempEmail, setTempEmail] = useState("");
  const [phone, setPhone] = useState("+225 07 07 07 07 07");
  const [tempPhone, setTempPhone] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Charger les données utilisateur depuis le backend au chargement du composant
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingProfile(true);
        
        // Récupérer les données utilisateur depuis l'API
        const userData = await getCustomerDetails();
        
        if (userData) {
          
          // Mettre à jour les états locaux avec les données de l'API
          setFirstName(userData.first_name || "");
          setLastName(userData.last_name || "");
          setEmail(userData.email || "");
          setPhone(userData.phone || "");
          
          // Mettre à jour la date de naissance si disponible
          if (userData.birth_day) {
            const [day, month, year] = userData.birth_day.split('/');
            if (day && month && year) {
              setBirthDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
            } else {
              setBirthDate(new Date(userData.birth_day));
            }
          }
          
          // Mettre à jour l'image de profil si disponible
          if (userData.image) {
            setProfileImage(userData.image);
          }
          
          // Mettre à jour le contexte d'authentification avec les données fraîches
          updateUserData(userData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        setErrorMessage("Impossible de charger vos données. Veuillez réessayer.");
        setShowErrorModal(true);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchUserData();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Désolé, nous avons besoin des permissions pour accéder à vos photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setShowPhotoModal(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Désolé, nous avons besoin des permissions pour accéder à votre caméra!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setShowPhotoModal(false);
    }
  };

  const deletePhoto = () => {
    setProfileImage(null);
    setShowPhotoModal(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
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

  const handleEmailChange = () => {
    if (tempEmail) {
      setEmail(tempEmail);
    }
    setShowEmailModal(false);
  };

  const handlePhoneChange = () => {
    if (tempPhone) {
      setPhone(tempPhone);
    }
    setShowPhoneModal(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
   
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const PhotoUploadModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPhotoModal}
      onRequestClose={() => setShowPhotoModal(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-sofia-medium text-gray-900">
              Photo de profil
            </Text>
            <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
              <Image
                source={require("@/assets/icons/close.png")}
                className="w-6 h-6"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            className="flex-row items-center py-4"
            onPress={pickImage}
          >
            <Image
              source={require("@/assets/icons/upload.png")}
              className="w-6 h-6"
            />
            <Text className="ml-4 text-base font-sofia-medium text-gray-900">
              Importer une photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-4"
            onPress={takePhoto}
          >
            <Image
              source={require("@/assets/icons/camera.png")}
              className="w-6 h-6"
            />
            <Text className="ml-4 text-base font-sofia-medium text-gray-900">
              Capturer une photo
            </Text>
          </TouchableOpacity>

          {profileImage && (
            <TouchableOpacity 
              className="flex-row items-center py-4"
              onPress={deletePhoto}
            >
              <Image
                source={require("@/assets/icons/notifications/trash.png")}
                className="w-6 h-6"
              />
              <Text className="ml-4 text-base font-sofia-medium text-gray-900">
                Supprimer la photo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  const EmailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showEmailModal}
      onRequestClose={() => setShowEmailModal(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-sofia-medium text-gray-900">
              Modifier l'email
            </Text>
            <TouchableOpacity onPress={() => setShowEmailModal(false)}>
              <Image
                source={require("@/assets/icons/close.png")}
                className="w-6 h-6"
              />
            </TouchableOpacity>
          </View>

          <TextInput
            className="bg-gray-50 rounded-2xl p-4 mb-6"
            value={tempEmail}
            onChangeText={setTempEmail}
            placeholder="Nouvel email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity 
            className="bg-orange-500 rounded-2xl p-4"
            onPress={handleEmailChange}
          >
            <Text className="text-white text-center font-sofia-medium">
              Confirmer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const PhoneModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPhoneModal}
      onRequestClose={() => setShowPhoneModal(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-sofia-medium text-gray-900">
              Modifier le numéro
            </Text>
            <TouchableOpacity onPress={() => setShowPhoneModal(false)}>
              <Image
                source={require("@/assets/icons/close.png")}
                className="w-6 h-6"
              />
            </TouchableOpacity>
          </View>

          <TextInput
            className="bg-gray-50 rounded-2xl p-4 mb-6"
            value={tempPhone}
            onChangeText={setTempPhone}
            placeholder="Nouveau numéro"
            keyboardType="phone-pad"
            maxLength={16}
          />

          <TouchableOpacity 
            className="bg-orange-500 rounded-2xl p-4"
            onPress={handlePhoneChange}
          >
            <Text className="text-white text-center font-sofia-medium">
              Confirmer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const PasswordModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPasswordModal}
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-sofia-medium text-gray-900">
              Modifier le mot de passe
            </Text>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Image
                source={require("@/assets/icons/close.png")}
                className="w-6 h-6"
              />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <View className="relative">
              <TextInput
                className="bg-gray-50 rounded-2xl p-4 pr-12"
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData(prev => ({...prev, currentPassword: text}))}
                placeholder="Mot de passe actuel"
                secureTextEntry={!showPassword.current}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(prev => ({...prev, current: !prev.current}))}
              >
                {showPassword.current ? (
                  <Eye size={24} color="#1C274C" />
                ) : (
                  <EyeOff size={24} color="#1C274C" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <View className="relative">
              <TextInput
                className="bg-gray-50 rounded-2xl p-4 pr-12"
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData(prev => ({...prev, newPassword: text}))}
                placeholder="Nouveau mot de passe"
                secureTextEntry={!showPassword.new}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(prev => ({...prev, new: !prev.new}))}
              >
                {showPassword.new ? (
                  <Eye size={24} color="#1C274C" />
                ) : (
                  <EyeOff size={24} color="#1C274C" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <View className="relative">
              <TextInput
                className="bg-gray-50 rounded-2xl p-4 pr-12"
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData(prev => ({...prev, confirmPassword: text}))}
                placeholder="Confirmer le mot de passe"
                secureTextEntry={!showPassword.confirm}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(prev => ({...prev, confirm: !prev.confirm}))}
              >
                {showPassword.confirm ? (
                  <Eye size={24} color="#1C274C" />
                ) : (
                  <EyeOff size={24} color="#1C274C" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-orange-500 rounded-2xl p-4"
            onPress={handlePasswordChange}
          >
            <Text className="text-white text-center font-sofia-medium">
              Confirmer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      setSuccessMessage("");
      setErrorMessage("");

      // Vérification du token d'authentification
      if (!accessToken) {
        setErrorMessage("Vous n'êtes pas authentifié");
        setShowErrorModal(true);
        setUpdating(false);
        return;
      }

      // Création du FormData pour l'envoi des données
      const formData = new FormData();
      
      // Ajout des champs texte uniquement s'ils ont une valeur
      if (firstName.trim()) {
        formData.append('first_name', firstName.trim());
      }
      
      if (lastName.trim()) {
        formData.append('last_name', lastName.trim());
      }
      
      // Ajout de la date de naissance si disponible
      if (birthDate) {
        formData.append('birth_day', format(birthDate, 'dd/MM/yyyy'));
      }
      
      // Ajout de l'email uniquement s'il a une valeur
      if (email.trim()) {
        formData.append('email', email.trim());
      }
      
      // Ajout de l'image si disponible et si c'est une nouvelle image
      let hasNewImage = false;
      if (profileImage && profileImage.startsWith('file:')) {
        hasNewImage = true;
        const uriParts = profileImage.split('/');
        const fileName = uriParts[uriParts.length - 1];
        const fileType = fileName.split('.').pop()?.toLowerCase() === 'png' 
          ? 'image/png' 
          : 'image/jpeg';
        
        formData.append('image', {
          uri: profileImage,
          name: fileName,
          type: fileType,
        } as any);
      }
      
      // Vérifier si le FormData contient des données à envoyer
      let hasData = false;
      // @ts-ignore
      for (let [key, value] of formData._parts || []) {
        hasData = true;
        break;
      }
      
      if (!hasData) {
        setErrorMessage("Aucune modification à enregistrer");
        setUpdating(false);
        return;
      }

      // S'assurer que le token est bien configuré pour la requête
      setAuthToken(accessToken);
      
      const response = await api.patch('/v1/customer', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      // Déterminer l'URL de l'image à utiliser
      let imageUrl = null;
      
      if (response.data && response.data.image) {
        imageUrl = formatImageUrl(response.data.image);
      } else if (hasNewImage && profileImage) {
        imageUrl = profileImage;
      } else if (user?.image) {
        imageUrl = formatImageUrl(user.image);
      }
      
      // Mise à jour des données utilisateur dans le contexte
      const updatedUserData = {
        ...user,
        first_name: firstName,
        last_name: lastName,
        birth_day: birthDate ? format(birthDate, 'dd/MM/yyyy') : null,
        email: email || null,
        phone: phone,
        image: imageUrl,
      };
      
      // Mettre à jour le contexte avec les nouvelles données
      updateUserData(updatedUserData, true);
      
      setSuccessMessage("Profil mis à jour avec succès !");
      
      // Recharger les données fraîches depuis l'API
      try {
        const freshUserData = await getCustomerDetails();
        if (freshUserData) {
          updateUserData(freshUserData, true);
          console.log('Données utilisateur rechargées depuis l\'API');
        }
      } catch (refreshError) {
        console.error('Erreur lors du rechargement des données utilisateur:', refreshError);
      }
    } catch (e: any) {
      console.error('Erreur lors de la mise à jour du profil:', e);
      if (e.response) {
        const errorMessage = e.response.data?.message || e.message || "Erreur lors de la mise à jour du profil";
        setErrorMessage(errorMessage);
      } else {
        setErrorMessage(e.message || "Erreur lors de la mise à jour du profil");
      }
      setShowErrorModal(true);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      {/* Header */}
      <View className="flex-row items-center justify-between px-3 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("@/assets/icons/arrow-back.png")}
            className="w-10 h-10"
          />
        </TouchableOpacity>
        <Text className="text-xl font-sofia-medium text-gray-900">
          Compte
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Photo de profil */}
        <View className="items-center justify-center py-8">
          <View className="relative items-center justify-center">
            {profileImage ? (
              <View className="relative items-center">
                <Image
                  source={{ uri: profileImage }}
                  style={{
                    width: PROFILE_IMAGE_SIZE/1.5,
                    height: PROFILE_IMAGE_SIZE/1.5,
                    borderRadius: PROFILE_IMAGE_SIZE/3,
                    marginBottom: 20
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPhotoModal(true)}
                  className="absolute bottom-0 bg-[#FBD2B5] rounded-3xl px-4 py-2 flex-row items-center"
                >
                  <Image
                    source={require("@/assets/icons/edit.png")}
                    className="w-4 h-4 mr-2"
                  />
                  <Text className="text-gray-900 text-sm font-sofia-medium">
                    Modifier
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="relative items-center">
                <Image
                  source={require("@/assets/icons/people.png")}
                  style={{
                    width: PROFILE_IMAGE_SIZE/2.5,
                    height: PROFILE_IMAGE_SIZE/2.5,
                    marginBottom: 20
                  }}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  onPress={() => setShowPhotoModal(true)}
                  className="absolute bottom-0 bg-[#FBD2B5] rounded-3xl px-4 py-2 flex-row items-center"
                >
                  <Image
                    source={require("@/assets/icons/edit.png")}
                    className="w-4 h-4 mr-2"
                  />
                  <Text className="text-gray-900 text-sm font-sofia-medium">
                    Modifier
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Informations utilisateur */}
        <View className="px-8 space-y-6 mt-10">
          {/* Nom */}
          <TextInput
            className="bg-gray-50 rounded-2xl p-4 mb-3 text-base font-sofia-medium text-gray-900"
            placeholder="Nom"
            value={lastName}
            onChangeText={setLastName}
            editable={!loadingProfile}
          />
          {/* Prénom */}
          <TextInput
            className="bg-gray-50 rounded-2xl p-4 mb-3 text-base font-sofia-medium text-gray-900"
            placeholder="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            editable={!loadingProfile}
          />
          {/* Date de naissance */}
          <TouchableOpacity
            className="bg-gray-50 rounded-2xl p-4 flex-row justify-between items-center mb-5"
            onPress={() => setShowDatePicker(true)}
            disabled={loadingProfile}
          >
            <Text className="text-base font-sofia-medium text-gray-900">
              {formatDate(birthDate)}
            </Text>
            <Image
              source={require("@/assets/icons/smallcalendar.png")}
              className="w-6 h-6"
            />
          </TouchableOpacity>
          {/* Email */}
          <TextInput
            className="bg-gray-50 rounded-2xl p-4 mb-3 text-base font-sofia-medium text-gray-900"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loadingProfile}
          />
          {/* Téléphone */}
          <TextInput
            className="bg-gray-50 rounded-2xl p-4 mb-3 text-base font-sofia-medium text-gray-900"
            placeholder="Téléphone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={16}
            editable={!loadingProfile}
          />
        </View>
        <View className="h-8" />
        {/* BOUTON METTRE À JOUR */}
        <TouchableOpacity
          className="bg-orange-500 rounded-2xl mx-8 py-4 items-center mb-8"
          onPress={handleUpdateProfile}
          disabled={updating || loadingProfile}
        >
          <Text className="text-white text-lg font-sofia-bold">
            {updating ? "Mise à jour..." : "Mettre à jour"}
          </Text>
        </TouchableOpacity>
        {successMessage ? (
          <View className="mx-8 mb-4 bg-green-100 rounded-xl p-3 items-center">
            <Text className="text-green-700 font-sofia-medium">{successMessage}</Text>
          </View>
        ) : null}
      </ScrollView>

      <PhotoUploadModal />
      <EmailModal />
      <PhoneModal />
      <PasswordModal />

      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </View>
  );
};

export default AccountSettings;