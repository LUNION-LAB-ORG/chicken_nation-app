import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Dimensions, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Calendar, Mail, Phone, Lock, Eye, EyeOff, Edit, User, X, Camera, Trash2 } from "lucide-react-native";

const { width } = Dimensions.get('window');
const PROFILE_IMAGE_SIZE = width * 0.85;

const AccountSettings = () => {
  const router = useRouter();
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

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
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
          {/* Nom complet */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-5">
            <Text className="text-base font-sofia-medium text-gray-900  ">
              Jean-Marc CISSE
            </Text>
          </View>

          {/* Date de naissance */}
          <TouchableOpacity
            className="bg-gray-50 rounded-2xl p-4 flex-row justify-between items-center mb-5"
            onPress={() => setShowDatePicker(true)}
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
          <TouchableOpacity
            className="bg-gray-50 rounded-2xl p-4 flex-row justify-between items-center mb-5"
            onPress={() => {
              setTempEmail(email);
              setShowEmailModal(true);
            }}
          >
            <Text className="text-base font-sofia-medium text-gray-900">
              {email}
            </Text>
            <Image
              source={require("@/assets/icons/message.png")}
              className="w-6 h-6"
            />
          </TouchableOpacity>

          {/* Téléphone */}
          <TouchableOpacity
            className="bg-gray-50 rounded-2xl p-4 flex-row justify-between items-center mb-5"
            onPress={() => {
              setTempPhone(phone);
              setShowPhoneModal(true);
            }}
          >
            <Text className="text-base font-sofia-medium text-gray-900">
              {phone}
            </Text>
            <Image
              source={require("@/assets/icons/phone.png")}
              className="w-6 h-6"
            />
          </TouchableOpacity>

          {/* Mot de passe */}
          <TouchableOpacity
            className="bg-gray-50 rounded-2xl p-4 flex-row justify-between items-center"
            onPress={() => setShowPasswordModal(true)}
          >
            <Text className="text-base font-sofia-medium text-gray-900">
              Modifier le mot de passe
            </Text>
            <Lock size={24} color="#1C274C" />
          </TouchableOpacity>
        </View>
        <View className="h-8" />
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
    </View>
  );
};

export default AccountSettings;