import { Link } from 'expo-router';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedView } from '@/components/ui-custom/ThemedView';

export default function NotFoundScreen() {
  return (
      <ThemedView className="flex-1 items-center justify-center p-5">
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        <Link href="/" className="mt-4 py-4">
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
  );
}
