import { Link } from 'expo-router';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';

export default function NotFoundScreen() {
  return (
    <ThemedContainerView className="flex-1 items-center justify-center p-5">
      <ThemedText type="title">This screen doesn't exist.</ThemedText>
      <Link href="/" className="mt-4 py-4">
        <ThemedText type="link">Go to home screen!</ThemedText>
      </Link>
    </ThemedContainerView>
  );
}
