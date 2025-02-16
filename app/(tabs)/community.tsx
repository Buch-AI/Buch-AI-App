import { useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useStory } from '@/contexts/StoryContext';
import { StoryCard } from '@/components/StoryCard';

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
    <ThemedView style={styles.container}>
      <ThemedText type="title">Community Stories</ThemedText>
      <FlatList
        data={state.stories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoryCard story={item} />}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    gap: 16,
  },
});
