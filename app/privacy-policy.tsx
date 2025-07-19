import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useThemeColor } from '@/hooks/useThemeColor';
import Logger from '@/utils/Logger';

export default function PrivacyPolicyScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // State for privacy policy content
  const [privacyPolicyContent, setPrivacyPolicyContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch privacy policy from GitHub
  const fetchPrivacyPolicy = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('https://raw.githubusercontent.com/Buch-AI/Buch-AI-App/refs/heads/main/docs/PRIVACY_POLICY.md');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch privacy policy: ${response.status} ${response.statusText}`);
      }
      
      const content = await response.text();
      setPrivacyPolicyContent(content);
      Logger.info('Privacy policy loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load privacy policy';
      Logger.error(`Privacy policy fetch error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const markdownStyles = {
    body: {
      color: textColor,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: textColor,
      fontSize: 28,
      fontWeight: 'bold' as const,
      marginBottom: 16,
      marginTop: 24,
    },
    heading2: {
      color: textColor,
      fontSize: 24,
      fontWeight: 'bold' as const,
      marginBottom: 12,
      marginTop: 20,
    },
    heading3: {
      color: textColor,
      fontSize: 20,
      fontWeight: '600' as const,
      marginBottom: 8,
      marginTop: 16,
    },
    paragraph: {
      color: textColor,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 12,
    },
    listItem: {
      color: textColor,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 4,
    },
    strong: {
      color: textColor,
      fontWeight: 'bold' as const,
    },
    em: {
      color: textColor,
      fontStyle: 'italic' as const,
    },
    code_inline: {
      backgroundColor: '#f5f5f5',
      color: '#333',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
    },
    hr: {
      backgroundColor: tintColor,
      height: 1,
      marginVertical: 16,
    },
  };

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between my-2">
          <ThemedButton
            iconOnly
            icon={<Ionicons name="close" size={16} color={textColor} />}
            onPress={() => router.back()}
            variant="icon"
          />
          <ThemedText type="title" className="flex-1 text-end">
            Privacy Policy
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <SafeAreaScrollView className="flex-1 px-4">
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color={tintColor} />
              <ThemedText className="mt-4 text-center text-gray-600 dark:text-gray-400">
                Loading Privacy Policy...
              </ThemedText>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="warning-outline" size={48} color="#ff6b6b" />
              <ThemedText className="mt-4 text-center text-red-600 dark:text-red-400">
                Failed to load Privacy Policy
              </ThemedText>
              <ThemedText className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                {error}
              </ThemedText>
              <ThemedButton
                title="Retry"
                onPress={fetchPrivacyPolicy}
                className="mt-4"
                variant="text"
              />
            </View>
          ) : (
            <>
              <Markdown style={markdownStyles}>
                {privacyPolicyContent}
              </Markdown>
              <View className="h-20" />
            </>
          )}
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
} 