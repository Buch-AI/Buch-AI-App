import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { TabBarSpacerView } from '@/components/ui-custom/TabBarSpacerView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedCheckbox } from '@/components/ui-custom/ThemedCheckbox';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedModal } from '@/components/ui-custom/ThemedModal';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CreationAdapter } from '@/services/CreationAdapter';
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
  const { jsonWebToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCreationIds, setSelectedCreationIds] = useState<Set<string>>(new Set());
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadCreations();
  }, []);

  const loadCreations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!jsonWebToken) {
        throw new Error('Unauthorized');
      }

      const meAdapter = new MeAdapter(jsonWebToken);
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

      if (!jsonWebToken) {
        throw new Error('Unauthorized');
      }

      const creationAdapter = new CreationAdapter(jsonWebToken);

      // Determine which IDs to delete
      const idsToDelete = Array.from(selectedCreationIds);

      if (idsToDelete.length === 0) return;

      // Delete all selected creations
      const deletePromises = idsToDelete.map((id) => {
        return creationAdapter.deleteCreation(id);
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
    <View className="mb-4 rounded-lg border border-gray-600 !bg-white/40 p-4 shadow-custom">
      <View className="flex-row items-start justify-between">
        {isSelecting && (
          <ThemedCheckbox
            checked={selectedCreationIds.has(item.creation_id)}
            onPress={() => toggleSelection(item.creation_id)}
            className="mr-3 mt-1"
          />
        )}

        <Link
          href={{ pathname: '/editor', params: { id: item.creation_id } }}
          asChild
          className="flex-1"
          disabled={isSelecting}
        >
          <View>
            <View className="mb-1 flex-row items-center">
              <ThemedText className="mr-2 flex-1 text-base font-bold">
                {item.title}
              </ThemedText>
              <View className="rounded-full bg-gray-200 px-2 py-1 dark:bg-gray-800">
                <ThemedText className="text-xs">
                  {item.status}
                </ThemedText>
              </View>
            </View>
            {item.description && (
              <ThemedText className="text-xs">{item.description}</ThemedText>
            )}
            <ThemedText className="text-xs opacity-60">
              Created on {new Date(item.created_at).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
            <ThemedText className="text-xs opacity-60">
              Last updated on {new Date(item.updated_at).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          </View>
        </Link>
      </View>
    </View>
  );

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
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

        <View className="my-2">
          <ThemedText type="title">Your Stories</ThemedText>
        </View>

        <View className="mb-4">
          <Link href={{ pathname: '/editor', params: { id: undefined } }} asChild>
            <ThemedButton title="Create a New Story" onPress={() => {}} />
          </Link>
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <ThemedButton
            onPress={toggleSelectMode}
            title={isSelecting ? 'Cancel Selection' : 'Select Stories'}
            variant="secondary"
            size="sm"
            pill
            className="mr-2 flex-1"
            disabled={isLoading || creations.length === 0}
            icon={
              <Ionicons
                name={isSelecting ? 'close-circle-outline' : 'checkbox-outline'}
                size={20}
                color={isDark ? 'white' : '#374151'}
              />
            }
          />

          <ThemedButton
            onPress={loadCreations}
            title="Refresh"
            loading={isLoading}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            pill
            className="ml-2 flex-1"
            icon={
              <Ionicons
                name="refresh-outline"
                size={20}
                color={isDark ? 'white' : '#374151'}
              />
            }
          />
        </View>

        {isSelecting && (
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row space-x-2">
              <ThemedButton
                title="Select All"
                onPress={selectAll}
                variant="secondary"
                size="xs"
                pill
              />
              <ThemedButton
                title="Deselect All"
                onPress={deselectAll}
                variant="secondary"
                size="xs"
                pill
              />
            </View>
            {selectedCreationIds.size > 0 && (
              <ThemedButton
                title={`Delete Selected (${selectedCreationIds.size})`}
                onPress={handleBulkDeletePress}
                variant="danger"
                size="xs"
                pill
              />
            )}
          </View>
        )}

        <SafeAreaScrollView>
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
            <View>
              {creations.map((item) => (
                <React.Fragment key={item.creation_id}>
                  {renderCreationItem({ item })}
                </React.Fragment>
              ))}
            </View>
          )}

          <TabBarSpacerView />
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
