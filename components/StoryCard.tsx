import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import type { Story } from '@/contexts/StoryContext';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link href={`/story/${story.id}`} asChild>
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">{story.prompt}</ThemedText>
        <ThemedText numberOfLines={3}>{story.content}</ThemedText>
        <ThemedText style={styles.date}>
          {new Date(story.createdAt).toLocaleDateString()}
        </ThemedText>
      </ThemedView>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
  },
});
