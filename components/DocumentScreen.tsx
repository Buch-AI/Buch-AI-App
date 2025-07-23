import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { useMarkdownDocument, createMarkdownStyles } from '@/hooks/useMarkdownDocument';
import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * Props for the DocumentScreen component
 */
interface DocumentScreenProps {
  /** The filename of the markdown document to fetch from the GitHub docs folder */
  filename: string;
  /** The title to display in the header of the screen */
  title: string;
}

/**
 * A reusable screen component for displaying markdown documents.
 *
 * This component provides a consistent UI for displaying legal documents, policies,
 * and other markdown content fetched from the GitHub repository. It includes:
 *
 * - A header with close button and title
 * - Loading states with spinner and text
 * - Error states with retry functionality
 * - Themed markdown rendering with responsive styling
 * - Safe area handling for proper display on all devices
 *
 * The component automatically fetches the specified markdown file from the
 * GitHub repository's docs folder and renders it with consistent theming
 * that adapts to light/dark mode.
 *
 * @param filename - The name of the markdown file to fetch (e.g., "PRIVACY_POLICY.md")
 * @param title - The display title for the document (e.g., "Privacy Policy")
 *
 * @example
 * ```tsx
 * // Display a Privacy Policy screen
 * <DocumentScreen
 *   filename="PRIVACY_POLICY.md"
 *   title="Privacy Policy"
 * />
 *
 * // Display Terms of Service
 * <DocumentScreen
 *   filename="TERMS_OF_SERVICE.md"
 *   title="Terms of Service"
 * />
 * ```
 */
export function DocumentScreen({ filename, title }: DocumentScreenProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const { content, isLoading, error, refetch } = useMarkdownDocument({ filename });
  const markdownStyles = createMarkdownStyles({ textColor, tintColor });

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        {/* Header */}
        <View className="my-2 flex-row items-center justify-between">
          <ThemedButton
            iconOnly
            icon={<Ionicons name="close" size={16} color={textColor} />}
            onPress={() => router.back()}
            variant="icon"
          />
          <ThemedText type="title" className="flex-1 text-end">
            {title}
          </ThemedText>
        </View>

        {/* Content */}
        <SafeAreaScrollView className="flex-1 px-4">
          {isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
              <ActivityIndicator size="large" color={tintColor} />
              <ThemedText className="mt-4 text-center text-gray-600 dark:text-gray-400">
                Loading {title}...
              </ThemedText>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="warning-outline" size={48} color="#ff6b6b" />
              <ThemedText className="mt-4 text-center text-red-600 dark:text-red-400">
                Failed to load {title}
              </ThemedText>
              <ThemedText className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                {error}
              </ThemedText>
              <ThemedButton
                title="Retry"
                onPress={refetch}
                className="mt-4"
                variant="text"
              />
            </View>
          ) : (
            <>
              <Markdown style={markdownStyles}>
                {content}
              </Markdown>
              <View className="h-20" />
            </>
          )}
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
