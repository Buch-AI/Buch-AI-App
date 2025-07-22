import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { TabBarSpacerView } from '@/components/ui-custom/TabBarSpacerView';
import { ThemedActivityOverlay } from '@/components/ui-custom/ThemedActivityOverlay';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { PaymentAdapter, ProductInfo } from '@/services/PaymentAdapter';
import Logger from '@/utils/Logger';

interface ProductCardProps {
  product: ProductInfo;
  onPress: () => void;
  isSelected: boolean;
}

function ProductCard({ product, onPress, isSelected }: ProductCardProps) {
  const isDark = useColorScheme() === 'dark';
  const cardBg = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity
      onPress={onPress}
      delayPressIn={70} // 70 ms delay to allow scroll gestures to start before touch is captured
      activeOpacity={0.8} // Visual feedback when pressed - reduces opacity to 80%
      className={`mb-4 rounded-xl border-2 p-4 ${
        isSelected ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
      }`}
      style={{
        backgroundColor: cardBg,
        borderColor: isSelected ? borderColor : undefined,
      }}
    >
      <View className="mb-2 flex-row items-start justify-between">
        <ThemedText type="title" className="mr-2 flex-1 text-lg">
          {product.name}
        </ThemedText>
        <ThemedText type="title" className="text-lg text-green-600 dark:text-green-400">
          {PaymentAdapter.formatPrice(product.price)}
        </ThemedText>
      </View>
      <ThemedText type="body" className="mb-2 text-gray-600 dark:text-gray-400">
        {product.description}
      </ThemedText>
      <View className="flex-row items-center">
        <View
          className={`rounded-full px-2 py-1 ${
            product.type === 'subscription' ?
              isDark ? 'bg-blue-800/40' : 'bg-blue-200' : // Blue theme for subscriptions
              isDark ? 'bg-green-800/40' : 'bg-green-200' // Green theme for bonus credits
          }`}
        >
          <ThemedText
            type="body"
            className={`text-sm ${
              product.type === 'subscription' ?
                isDark ? 'text-blue-400' : 'text-blue-600' : // Blue text for subscriptions
                isDark ? 'text-green-400' : 'text-green-600' // Green text for bonus credits
            }`}
          >
            {PaymentAdapter.getTypeDisplayText(product.type)}
          </ThemedText>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={borderColor}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

interface ProductSectionProps {
  title: string;
  products: ProductInfo[];
  selectedProduct: ProductInfo | null;
  onSelectProduct: (product: ProductInfo) => void;
}

function ProductSection({ title, products, selectedProduct, onSelectProduct }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <View className="mb-6">
      <ThemedText type="title" className="mb-3 text-base">
        {title}
      </ThemedText>
      <View>
        {products.map((item) => (
          <ProductCard
            key={item.product_id}
            product={item}
            onPress={() => onSelectProduct(item)}
            isSelected={selectedProduct?.product_id === item.product_id}
          />
        ))}
      </View>
    </View>
  );
}

function MobileNotSupportedView() {
  const textColor = useThemeColor({}, 'text');

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        {/* Header with cross button */}
        <View className="my-2 flex-row items-center justify-between">
          <ThemedButton
            iconOnly
            icon={<Ionicons name="close" size={16} color={textColor} />}
            onPress={() => router.back()}
            variant="icon"
          />
          <ThemedText type="title" className="flex-1 text-end">
            Upgrade Your Plan
          </ThemedText>
        </View>
        <SafeAreaScrollView>
          <ThemedContainerView>

            {/* Mobile Not Supported Message */}
            <View className="flex-1 items-center justify-center py-12">
              <View className="mb-8 items-center">
                <Ionicons name="desktop-outline" size={80} color="#6B7280" />
              </View>

              <ThemedText type="title" className="mb-4 text-center">
                Web-Only Feature
              </ThemedText>

              <ThemedText type="body" className="mb-6 text-center leading-6 text-gray-600 dark:text-gray-400">
                Payments are currently only available on the web version of our app.
                Please visit our website to purchase credits and premium features.
              </ThemedText>

              <View className="mb-6 w-full rounded-xl bg-blue-100 p-4 dark:bg-blue-900/20">
                <ThemedText type="body" className="text-center text-sm text-blue-600 dark:text-blue-400">
                💡 You can access the web version at the same URL in your browser.
                </ThemedText>
              </View>

              <ThemedButton
                title="Got it!"
                onPress={() => router.back()}
                className="w-full"
              />
            </View>
          </ThemedContainerView>
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}

export default function PaymentScreen() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const paymentAdapter = new PaymentAdapter();
  const isPaymentSupported = PaymentAdapter.isPaymentSupported();
  const textColor = useThemeColor({}, 'text');

  // Separate and sort products by type
  const { subscriptionProducts, bonusProducts } = useMemo(() => {
    const subscriptions = products
      .filter((product) => product.type === 'subscription')
      .sort((a, b) => a.price - b.price);

    const bonus = products
      .filter((product) => product.type === 'bonus')
      .sort((a, b) => a.price - b.price);

    return {
      subscriptionProducts: subscriptions,
      bonusProducts: bonus,
    };
  }, [products]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    // Only load products if payment is supported
    if (isPaymentSupported) {
      loadProducts();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, isPaymentSupported]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const productsData = await paymentAdapter.getProducts();
      setProducts(productsData);

      // Auto-select the first product (lowest price subscription, then lowest price bonus)
      if (productsData.length > 0) {
        const sortedProducts = [...productsData].sort((a, b) => {
          // Prioritize subscriptions, then sort by price
          if (a.type === 'subscription' && b.type !== 'subscription') return -1;
          if (a.type !== 'subscription' && b.type === 'subscription') return 1;
          return a.price - b.price;
        });
        setSelectedProduct(sortedProducts[0]);
      }
    } catch (error) {
      Logger.error(`Failed to load products: ${error}`);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a product first.');
      return;
    }

    try {
      setIsProcessingPayment(true);

      // Get current URL for success/cancel URLs
      const baseUrl = window.location.origin + window.location.pathname.replace('/payments/checkout', '/payments/response');

      // Create URLs that will properly handle Stripe's additional parameters
      // Stripe will append ?session_id=... so we need to ensure our parameters come first
      const successUrl = `${baseUrl}?status=success&redirect_type=stripe_success`;
      const cancelUrl = `${baseUrl}?status=cancelled&redirect_type=stripe_cancel`;

      // Debug logging
      console.log('Payment Checkout - Base URL:', baseUrl);
      console.log('Payment Checkout - Success URL:', successUrl);
      console.log('Payment Checkout - Cancel URL:', cancelUrl);

      // Create checkout session
      const checkoutSession = await paymentAdapter.createCheckoutSession({
        product_id: selectedProduct.product_id,
        quantity: 1,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      // Redirect to Stripe Checkout
      window.location.href = checkoutSession.checkout_url;
    } catch (error) {
      Logger.error(`Checkout error: ${error}`);
      Alert.alert('Error', 'Failed to start checkout. Please try again.');
      setIsProcessingPayment(false);
    }
  };


  // Show mobile not supported view if on mobile
  if (!isPaymentSupported) {
    return <MobileNotSupportedView />;
  }

  return (
    <ThemedBackgroundView>
      <ThemedActivityOverlay
        visible={isLoading}
        text="Loading products..."
      />

      <ThemedContainerView className="flex-1">
        {/* Header with cross button */}
        <View className="my-2 flex-row items-center justify-between">
          <ThemedButton
            iconOnly
            icon={<Ionicons name="close" size={16} color={textColor} />}
            onPress={() => router.back()}
            variant="icon"
          />
          <ThemedText type="title" className="flex-1 text-end">
            Upgrade Your Plan
          </ThemedText>
        </View>

        <SafeAreaScrollView>
          {/* TODO: Testing Info */}
          <View className="mb-4 rounded-xl bg-red-100 p-3 dark:bg-red-900/20">
            <ThemedText type="body" className="text-center text-sm text-red-600 dark:text-red-400">
              🚨 This is a testing page. Do not use your real credit card information. You will not be charged.
            </ThemedText>
          </View>

          {/* Web Payment Info */}
          <View className="mb-4 rounded-xl bg-blue-100 p-3 dark:bg-blue-900/20">
            <ThemedText type="body" className="text-center text-sm text-blue-600 dark:text-blue-400">
              🌐 You'll be redirected to Stripe's secure checkout page.
            </ThemedText>
          </View>

          {/* Products List - Separated by Type */}
          <View className="mb-6">
            <ThemedText type="title" className="mb-4 text-lg">
              Available Products
            </ThemedText>

            {/* Subscription Products */}
            <ProductSection
              title="📅 Monthly Subscriptions"
              products={subscriptionProducts}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
            />

            {/* Bonus Credit Products */}
            <ProductSection
              title="💰 Bonus Credits"
              products={bonusProducts}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
            />

            {/* No Products Message */}
            {products.length === 0 && !isLoading && (
              <View className="items-center py-8">
                <ThemedText type="body" className="text-center text-gray-500 dark:text-gray-400">
                  No products available at the moment.
                </ThemedText>
              </View>
            )}
          </View>

          {/* Payment Section */}
          {selectedProduct && (
            <View className="mb-6">
              <ThemedText type="title" className="mb-4 text-lg">
                Payment Summary
              </ThemedText>

              <View className="mb-4 rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                <View className="mb-2 flex-row items-center justify-between">
                  <ThemedText type="body">Selected Product:</ThemedText>
                  <ThemedText type="body" className="font-medium">
                    {selectedProduct.name}
                  </ThemedText>
                </View>
                <View className="mb-2 flex-row items-center justify-between">
                  <ThemedText type="body">Type:</ThemedText>
                  <ThemedText type="body" className="font-medium">
                    {PaymentAdapter.getTypeDisplayText(selectedProduct.type)}
                  </ThemedText>
                </View>
                <View className="flex-row items-center justify-between">
                  <ThemedText type="body">Total:</ThemedText>
                  <ThemedText type="title" className="text-lg text-green-600 dark:text-green-400">
                    {PaymentAdapter.formatPrice(selectedProduct.price)}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Checkout Button */}
          <ThemedButton
            title={
              isProcessingPayment ?
                'Redirecting to Checkout...' :
                `Continue to Checkout ${selectedProduct ? PaymentAdapter.formatPrice(selectedProduct.price) : ''}`
            }
            onPress={handleCheckout}
            disabled={!selectedProduct || isProcessingPayment}
            className="mb-4"
          />

          {/* Security Info */}
          <View className="my-4 rounded-xl bg-blue-100 p-4 dark:bg-blue-900/20">
            <ThemedText type="body" className="text-center text-sm text-blue-600 dark:text-blue-400">
              💳 Your payment is secured by Stripe. We never store your card details.
            </ThemedText>
          </View>

          <TabBarSpacerView />
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
