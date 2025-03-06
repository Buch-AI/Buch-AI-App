import { Link } from 'expo-router';

import type { Story } from '@/contexts/StoryContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link href={`/story/${story.id}`} asChild>
      <ThemedView className="gap-2 rounded-lg p-4">
        <ThemedText type="subtitle">{story.prompt}</ThemedText>
        <ThemedText numberOfLines={3}>{story.content}</ThemedText>
        <ThemedText className="text-xs opacity-70">
          {new Date(story.createdAt).toLocaleDateString()}
        </ThemedText>
      </ThemedView>
    </Link>
  );
}
