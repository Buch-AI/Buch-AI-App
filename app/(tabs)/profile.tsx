import { View } from 'react-native';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { signOut } = useAuth();

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        <View className="my-4">
          <ThemedText type="title">Profile</ThemedText>
        </View>

        <View className="flex-1 items-center justify-center">
          <ThemedButton
            title="Sign Out"
            onPress={signOut}
            className="!bg-red-500"
          />
        </View>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
