import React from 'react';
import { View } from 'react-native';

interface ThemedHorizontalRuleProps {
  className?: string;
}

export function ThemedHorizontalRule({ className = '' }: ThemedHorizontalRuleProps) {
  return (
    <View className={`my-6 h-px bg-gray-200 dark:bg-gray-800 ${className}`} />
  );
}
