import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedModal } from '@/components/ui-custom/ThemedModal';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { StorageKeys } from '@/constants/Storage';
import { MeAdapter } from '@/services/MeAdapter';
import Logger from '@/utils/Logger';

interface Creation {
  creation_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);

  // Delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const creationProfiles = await meAdapter.getUserCreations();
      setCreations(creationProfiles.map((profile) => ({
        creation_id: profile.creation_id,
        title: profile.title,
        description: profile.description,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        status: profile.status,
      })));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to load creations: ${message}`);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePress = (creation: Creation) => {
    setSelectedCreation(creation);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCreation) return;

    try {
      setIsDeleting(true);
      Logger.info(`Proceeding with deletion of creation: ${selectedCreation.creation_id}`);
      const token = await AsyncStorage.getItem(StorageKeys.AUTH_JWT);
      if (!token) {
        throw new Error('Unauthorized');
      }

      const meAdapter = new MeAdapter(token);
      await meAdapter.deleteCreation(selectedCreation.creation_id);
      Logger.info('Creation deleted successfully');

      // Update the local state to remove the deleted creation
      setCreations((prevCreations) =>
        prevCreations.filter((creation) => creation.creation_id !== selectedCreation.creation_id),
      );
      setDeleteModalVisible(false);
      setSelectedCreation(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to delete creation: ${message}`);
      setError('Failed to delete the story. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderCreationItem = ({ item }: { item: Creation }) => (
    <ThemedView className="mb-4 rounded-lg !bg-white/80 p-4 shadow-xl">
      <View className="flex-row items-start justify-between">
        <Link href={{ pathname: '../editor', params: { id: item.creation_id } }} asChild className="flex-1">
          <View>
            <ThemedText className="mb-1 text-lg font-bold">{item.title}</ThemedText>
            {item.description && (
              <ThemedText className="text-sm">{item.description}</ThemedText>
            )}
            <ThemedText className="text-sm opacity-70">
              Created on {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
            <ThemedText className="text-sm opacity-70">
              Last updated on {new Date(item.updated_at).toLocaleDateString()} at {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
            <View className="mt-2">
              <ThemedText className="inline-block rounded-full bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">
                {item.status}
              </ThemedText>
            </View>
          </View>
        </Link>
        <TouchableOpacity
          onPress={() => handleDeletePress(item)}
          className="ml-4 size-8 items-center justify-center rounded-full"
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  return (
    <SafeAreaScrollView>
      <ThemedView className="flex-1 p-4">
        <View className="mb-6 flex-row items-center justify-between">
          <ThemedText type="title">Your Stories</ThemedText>
        </View>

        <View className="mb-6">
          <Link href={{ pathname: '../editor', params: { id: undefined } }} asChild>
            <ThemedButton title="Create a New Story" onPress={() => {}} />
          </Link>
          <TouchableOpacity
            onPress={loadCreations}
            disabled={isLoading}
            className="mt-3 flex-row items-center justify-center space-x-2 rounded-lg py-2"
          >
            {isLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={20} />
                <ThemedText>Refresh Story List</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <></>
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
            <Link href={{ pathname: '../editor', params: { id: undefined } }} asChild>
              <ThemedButton title="Create Your First Story" onPress={() => {}} />
            </Link>
          </ThemedView>
        ) : (
          <FlatList
            data={creations}
            renderItem={renderCreationItem}
            keyExtractor={(item) => item.creation_id}
            contentContainerStyle={{ padding: 20 }}
          />
        )}

        <ThemedModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          title="Delete Story"
          message={`Are you sure you want to delete "${selectedCreation?.title}"? This action cannot be undone.`}
          primaryButton={{
            title: 'Delete',
            onPress: handleDeleteConfirm,
            loading: isDeleting,
            variant: 'danger',
          }}
        />
      </ThemedView>
    </SafeAreaScrollView>
  );
}
