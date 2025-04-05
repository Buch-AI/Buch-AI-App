import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { StorageKeys } from '@/constants/Storage';
import { MeAdapter } from '@/services/MeAdapter';
import Logger from '@/utils/Logger';

interface Creation {
  id: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);

  useEffect(() => {
    loadCreations();
  }, []);

  const loadCreations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem(StorageKeys.AUTH_JWT);
      if (!token) {
        throw new Error('Unauthorized');
      }

      const meAdapter = new MeAdapter(token);
      const creationIds = await meAdapter.getUserCreations();
      setCreations(creationIds.map((id) => ({ id })));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to load creations: ${message}`);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCreationItem = ({ item }: { item: Creation }) => (
    <Link href={{ pathname: '../editor', params: { id: item.id } }} asChild>
      <ThemedView className="mb-4 rounded-lg bg-white/10 p-4">
        <ThemedText className="text-lg">Creation ID: {item.id}</ThemedText>
      </ThemedView>
    </Link>
  );

  return (
    <SafeAreaScrollView>
      <ThemedView className="flex-1 p-4">
        <View className="mb-6 flex-row items-center justify-between">
          <ThemedText type="title">Your Stories</ThemedText>
          <Link href="../editor" asChild>
            <ThemedButton title="Create New" onPress={() => {}} />
          </Link>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" />
          </View>
        ) : error ? (
          <ThemedView className="rounded-lg bg-red-100 p-4 dark:bg-red-900">
            <ThemedText className="text-red-800 dark:text-red-200">
              {error}
            </ThemedText>
            <ThemedButton
              className="mt-4"
              title="Try Again"
              onPress={loadCreations}
            />
          </ThemedView>
        ) : creations.length === 0 ? (
          <ThemedView className="items-center justify-center py-8">
            <ThemedText className="mb-4 text-center opacity-70">
              You haven't created any stories yet.
            </ThemedText>
            <Link href="../editor" asChild>
              <ThemedButton title="Create Your First Story" onPress={() => {}} />
            </Link>
          </ThemedView>
        ) : (
          <FlatList
            data={creations}
            renderItem={renderCreationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </ThemedView>
    </SafeAreaScrollView>
  );
}
