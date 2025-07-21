import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentResultScreen() {
  const { isAuthenticated } = useAuth();
  const { status } = useLocalSearchParams();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }
  }, [isAuthenticated]);

  // Check multiple ways the status might be communicated
  // Handle malformed URLs with multiple ? marks by parsing manually
  const getStatusFromUrl = () => {
    if (typeof window === 'undefined') return null;

    const url = window.location.href;

    // Handle malformed URLs like "?status=success?session_id=..."
    const statusMatch = url.match(/[?&]status=([^?&]+)/);
    if (statusMatch) {
      return statusMatch[1];
    }

    // Fallback to standard URL parsing
    try {
      return new URLSearchParams(window.location.search).get('status');
    } catch {
      return null;
    }
  };

  const urlStatus = getStatusFromUrl();
  const isSuccess = status === 'success' || urlStatus === 'success';
  const isCancelled = status === 'cancelled' || urlStatus === 'cancelled';

  // Additional check for Stripe success indicators
  const hasStripeSuccess = typeof window !== 'undefined' && (
    window.location.search.includes('payment_intent') ||
    window.location.search.includes('payment_intent_client_secret') ||
    window.location.search.includes('redirect_status=succeeded')
  );

  // Combined success check
  const finalIsSuccess = isSuccess || hasStripeSuccess;

  // Debug logging to see what we're getting
  useEffect(() => {
    console.log('Payment Result - Status value:', status);
    console.log('Payment Result - Status type:', typeof status);
    console.log('Payment Result - URL status:', urlStatus);

    // Also check window URL if we're on web
    if (typeof window !== 'undefined') {
      console.log('Payment Result - Current URL:', window.location.href);
      console.log('Payment Result - URL search params:', window.location.search);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        console.log('Payment Result - All URL params:', Object.fromEntries(urlParams.entries()));
      } catch (error) {
        console.log('Payment Result - URL params parsing error:', error);
      }
      console.log('Payment Result - Has Stripe success indicators:', hasStripeSuccess);
      console.log('Payment Result - Final success state:', finalIsSuccess);
    }
  }, [status, urlStatus, hasStripeSuccess, finalIsSuccess]);

  const getIconName = () => {
    if (finalIsSuccess) return 'checkmark-circle';
    if (isCancelled) return 'close-circle';
    return 'alert-circle';
  };

  const getIconColor = () => {
    if (finalIsSuccess) return '#10B981'; // green-500
    if (isCancelled) return '#F59E0B'; // yellow-500
    return '#EF4444'; // red-500
  };

  const getTitle = () => {
    if (finalIsSuccess) return 'Payment Successful!';
    if (isCancelled) return 'Payment Cancelled';
    return 'Payment Failed';
  };

  const getMessage = () => {
    if (finalIsSuccess) {
      return 'Your purchase has been completed successfully. Your credits and features have been added to your account.';
    }
    if (isCancelled) {
      return 'Your payment was cancelled. No charges were made to your account.';
    }
    return 'There was an issue processing your payment. Please try again or contact support if the problem persists.';
  };

  const getBackgroundColor = () => {
    if (finalIsSuccess) return 'bg-green-100 dark:bg-green-900/20';
    if (isCancelled) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getTextColor = () => {
    if (finalIsSuccess) return 'text-green-600 dark:text-green-400';
    if (isCancelled) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleReturnHome = () => {
    router.replace('/(tabs)');
  };

  const handleTryAgain = () => {
    router.back();
  };

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        <SafeAreaScrollView>
          <View className="flex-1 items-center justify-center py-12">
            {/* Icon */}
            <View className="mb-8 items-center">
              <Ionicons
                name={getIconName()}
                size={120}
                color={getIconColor()}
              />
            </View>

            {/* Title */}
            <ThemedText type="title" className="mb-4 text-center text-2xl">
              {getTitle()}
            </ThemedText>

            {/* Message */}
            <ThemedText type="body" className="mb-8 text-center leading-6 text-gray-600 dark:text-gray-400">
              {getMessage()}
            </ThemedText>

            {/* Status Card */}
            <View className={`mb-8 w-full rounded-xl p-6 ${getBackgroundColor()}`}>
              <View className="items-center">
                <ThemedText type="body" className={`text-center text-sm ${getTextColor()}`}>
                  {finalIsSuccess && '✅ Transaction completed successfully'}
                  {isCancelled && '⚠️ No charges were made'}
                  {!finalIsSuccess && !isCancelled && '❌ Payment processing failed'}
                </ThemedText>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="w-full space-y-4">
              <ThemedButton
                title="Return to Home"
                onPress={handleReturnHome}
                className="w-full"
              />

              {!finalIsSuccess && (
                <ThemedButton
                  title={isCancelled ? 'Try Again' : 'Retry Payment'}
                  onPress={handleTryAgain}
                  variant="secondary"
                  className="w-full"
                />
              )}
            </View>

            {/* Additional Info for Success */}
            {finalIsSuccess && (
              <View className="mt-8 w-full rounded-xl bg-blue-100 p-4 dark:bg-blue-900/20">
                <ThemedText type="body" className="text-center text-sm text-blue-600 dark:text-blue-400">
                   💡 You can view your updated credits and features in your profile
                </ThemedText>
              </View>
            )}

            {/* Support Info for Failed Payments */}
            {!finalIsSuccess && !isCancelled && (
              <View className="mt-8 w-full rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                <ThemedText type="body" className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Need help? Contact our support team for assistance with your payment.
                </ThemedText>
              </View>
            )}
          </View>
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
