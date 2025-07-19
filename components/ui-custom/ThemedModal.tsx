import React from 'react';
import { Modal, View } from 'react-native';
import { ThemedButton, ButtonVariant } from './ThemedButton';
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
    variant?: ButtonVariant;
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
        <View className="m-5 w-[90%] max-w-md rounded-2xl bg-white p-8 shadow-custom dark:bg-gray-800">
          <ThemedText className="mb-4 text-xl font-bold">{title}</ThemedText>
          <ThemedText className="mb-6">{message}</ThemedText>
          <View className="flex-row justify-end space-x-4">
            <ThemedButton
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              size="sm"
              disabled={primaryButton?.loading}
            />
            {primaryButton && (
              <ThemedButton
                title={primaryButton.title}
                onPress={primaryButton.onPress}
                variant={primaryButton.variant || 'primary'}
                size="sm"
                loading={primaryButton.loading}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
