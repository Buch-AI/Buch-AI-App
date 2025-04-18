import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedModal } from '@/components/ui-custom/ThemedModal';
import { ThemedText } from '@/components/ui-custom/ThemedText';
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

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCreationIds, setSelectedCreationIds] = useState<Set<string>>(new Set());

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
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

      // Clear selections when loading new data
      setIsSelecting(false);
      setSelectedCreationIds(new Set());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to load creations: ${message}`);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const token = await AsyncStorage.getItem(StorageKeys.AUTH_JWT);
      if (!token) {
        throw new Error('Unauthorized');
      }

      const meAdapter = new MeAdapter(token);

      // Determine which IDs to delete
      const idsToDelete = Array.from(selectedCreationIds);

      if (idsToDelete.length === 0) return;

      // Delete all selected creations
      const deletePromises = idsToDelete.map((id) => {
        return meAdapter.deleteCreation(id);
      });

      await Promise.all(deletePromises);
      Logger.info('Deletion completed successfully');

      // Update the local state to remove the deleted creations
      setCreations((prevCreations) => {
        if (selectedCreationIds.size > 0) {
          return prevCreations.filter((creation) => !selectedCreationIds.has(creation.creation_id));
        }
        return prevCreations;
      });

      // Reset selection state
      setDeleteModalVisible(false);
      setSelectedCreationIds(new Set());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to delete creation(s): ${message}`);
      setError('Failed to delete the story/stories. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDeletePress = () => {
    if (selectedCreationIds.size === 0) return;
    setDeleteModalVisible(true);
  };

  const toggleSelectMode = () => {
    setIsSelecting(!isSelecting);
    if (isSelecting) {
      setSelectedCreationIds(new Set());
    }
  };

  const toggleSelection = (id: string) => {
    const newSelectedIds = new Set(selectedCreationIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedCreationIds(newSelectedIds);
  };

  const selectAll = () => {
    const allIds = new Set(creations.map((creation) => creation.creation_id));
    setSelectedCreationIds(allIds);
  };

  const deselectAll = () => {
    setSelectedCreationIds(new Set());
  };

  const renderCreationItem = ({ item }: { item: Creation }) => (
    <View className="mb-4 rounded-lg !bg-white/60 p-4">
      <View className="flex-row items-start justify-between">
        {isSelecting && (
          <TouchableOpacity
            onPress={() => toggleSelection(item.creation_id)}
            className="mr-3 mt-1 size-6 items-center justify-center rounded-md border border-gray-300"
            style={{ backgroundColor: selectedCreationIds.has(item.creation_id) ? '#4F46E5' : 'transparent' }}
          >
            {selectedCreationIds.has(item.creation_id) && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}

        <Link
          href={{ pathname: '../editor', params: { id: item.creation_id } }}
          asChild
          className="flex-1"
          disabled={isSelecting}
        >
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
      </View>
    </View>
  );

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        <View className="my-4">
          <ThemedText type="title">Your Stories</ThemedText>
        </View>

        <SafeAreaScrollView>
          <View className="mb-6">
            <Link href={{ pathname: '../editor', params: { id: undefined } }} asChild>
              <ThemedButton title="Create a New Story" onPress={() => {}} />
            </Link>
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <ThemedButton
              onPress={toggleSelectMode}
              title={isSelecting ? 'Cancel Selection' : 'Select Stories'}
              className="!mr-2 !flex-1 !rounded-full !bg-gray-400 dark:!bg-gray-800"
              textClassName="!text-sm"
              disabled={isLoading || creations.length === 0}
              leadingIcon={
                <Ionicons
                  name={isSelecting ? 'close-circle-outline' : 'checkbox-outline'}
                  size={20}
                  color="white"
                />
              }
            />

            <ThemedButton
              onPress={loadCreations}
              title="Refresh"
              loading={isLoading}
              disabled={isLoading}
              className="!ml-2 !flex-1 !rounded-full !bg-gray-400 dark:!bg-gray-800"
              textClassName="!text-sm"
              leadingIcon={
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color="white"
                />
              }
            />
          </View>

          {isSelecting && (
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={selectAll}
                  className="rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-800"
                >
                  <ThemedText className="text-sm">Select All</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={deselectAll}
                  className="rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-800"
                >
                  <ThemedText className="text-sm">Deselect All</ThemedText>
                </TouchableOpacity>
              </View>
              {selectedCreationIds.size > 0 && (
                <TouchableOpacity
                  onPress={handleBulkDeletePress}
                  className="rounded-full bg-red-500 px-3 py-1"
                >
                  <ThemedText className="text-sm text-white">
                      Delete Selected ({selectedCreationIds.size})
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}

          {isLoading ? (
            <></>
          ) : error ? (
            <View className="rounded-lg bg-red-100 p-4 dark:bg-red-900">
              <ThemedText className="text-red-800 dark:text-red-200">
                {error}
              </ThemedText>
              <ThemedButton
                className="mt-4"
                title="Try Again"
                onPress={loadCreations}
              />
            </View>
          ) : creations.length === 0 ? (
            <View className="items-center justify-center py-8">
              <ThemedText className="mb-4 text-center opacity-70">
              You haven't created any stories yet.
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={creations}
              renderItem={renderCreationItem}
              keyExtractor={(item) => item.creation_id}
            />
          )}

          <ThemedModal
            visible={deleteModalVisible}
            onClose={() => setDeleteModalVisible(false)}
            title={'Delete Stories'}
            message={`Are you sure you want to delete ${selectedCreationIds.size} ${selectedCreationIds.size === 1 ? 'story' : 'stories'}? This action cannot be undone.`}
            primaryButton={{
              title: 'Delete',
              onPress: handleDeleteConfirm,
              loading: isDeleting,
              variant: 'danger',
            }}
          />
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
