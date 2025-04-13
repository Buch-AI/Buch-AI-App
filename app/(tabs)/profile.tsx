import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/app/_layout';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { StorageKeys } from '@/constants/Storage';

export default function ProfileScreen() {
  const { setAuthenticated } = useAuth();

  const handleSignOut = async () => {
    await AsyncStorage.removeItem(StorageKeys.AUTH_JWT);
    setAuthenticated(false);
    router.replace('/login');
  };

  return (
    <ThemedContainerView className="flex-1 p-4">
      <View className="flex-1 items-center justify-center">
        <ThemedButton
          title="Sign Out"
          onPress={handleSignOut}
          className="!bg-red-500"
        />
      </View>
    </ThemedContainerView>
  );
}
