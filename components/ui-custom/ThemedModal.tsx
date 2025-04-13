import React from 'react';
import { Modal, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedContainerView } from './ThemedContainerView';
import { ThemedText } from './ThemedText';

interface ThemedModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  primaryButton?: {
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'danger' | 'default';
  };
}

export function ThemedModal({
  visible,
  onClose,
  title,
  message,
  primaryButton,
}: ThemedModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="m-5 w-[90%] max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <ThemedText className="mb-4 text-xl font-bold">{title}</ThemedText>
          <ThemedText className="mb-6">{message}</ThemedText>
          <View className="flex-row justify-end space-x-4">
            <TouchableOpacity
              onPress={onClose}
              className="rounded-lg bg-gray-200 px-4 py-2"
              disabled={primaryButton?.loading}
            >
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
            {primaryButton && (
              <TouchableOpacity
                onPress={primaryButton.onPress}
                className={`rounded-lg px-4 py-2 ${
                  primaryButton.variant === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                }`}
                disabled={primaryButton.loading}
              >
                <View className="flex-row items-center space-x-2">
                  <ThemedText className="text-white">
                    {primaryButton.title}
                  </ThemedText>
                  {primaryButton.loading && (
                    <ActivityIndicator size="small" color="white" />
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
