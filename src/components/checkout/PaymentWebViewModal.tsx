import React from 'react';
import { Modal, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import usePaymentStore from '@/store/paymentStore';

interface PaymentWebViewModalProps {
  visible: boolean;
  onClose: () => void;
  paymentUrl: string;
}

const PaymentWebViewModal: React.FC<PaymentWebViewModalProps> = ({
  visible,
  onClose,
  paymentUrl,
}) => {
  const { setProcessing, setPaymentSuccess, setPaymentError } = usePaymentStore();

  const handleNavigationStateChange = (navState: any) => {
    // Gérer les changements d'état de navigation
    if (navState.url.includes('payment/success')) {
      setPaymentSuccess(true);
      onClose();
    } else if (navState.url.includes('payment/cancel')) {
      setPaymentError("Paiement annulé");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <View className="w-8" />
          <Text className="text-xl font-sofia-medium text-gray-900">
            Paiement en cours
          </Text>
          <TouchableOpacity onPress={onClose} className="w-8">
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <View className="flex-1">
          <WebView
            source={{ uri: paymentUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="absolute inset-0 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#F97316" />
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default PaymentWebViewModal; 