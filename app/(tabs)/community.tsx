import { useEffect } from 'react';
import { FlatList } from 'react-native';

import { StoryCard } from '@/components/StoryCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useStory } from '@/contexts/StoryContext';

export default function CommunityScreen() {
  const { state, dispatch } = useStory();

  // In a real app, you'd fetch stories from an API
  useEffect(() => {
    // Simulated API call
    dispatch({
      type: 'SET_STORIES',
      payload: [
        // Your story data
      ],
    });
  }, [dispatch]);

  return (
    <ThemedView className="flex-1 p-4">
      <ThemedText type="title">Community Stories</ThemedText>
      <FlatList
        data={state.stories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoryCard story={item} />}
        contentContainerStyle={{ gap: 16 }}
      />
    </ThemedView>
  );
}
