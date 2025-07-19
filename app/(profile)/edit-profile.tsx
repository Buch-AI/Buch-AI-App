import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getCurrentUser } from '@/services/AuthAdapter';
import Logger from '@/utils/Logger';

interface User {
  username: string;
  email?: string | null;
  full_name?: string | null;
  disabled?: boolean | null;
}

export default function EditProfileScreen() {
  const { jsonWebToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const textColor = useThemeColor({}, 'text');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!jsonWebToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser(jsonWebToken);
        setUser(userData);
        setFullName(userData.full_name || '');
        setEmail(userData.email || '');
      } catch (error) {
        Logger.error(`Failed to fetch user data: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [jsonWebToken]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement profile update API call
      Logger.info('Profile update not implemented yet');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.back();
    } catch (error) {
      Logger.error(`Failed to update profile: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        {/* Header with cross button */}
        <View className="my-2 flex-row items-center justify-between">
          <ThemedButton
            iconOnly
            icon={<Ionicons name="close" size={16} color={textColor} />}
            onPress={() => router.back()}
            variant="icon"
          />
          <ThemedText type="title" className="flex-1 text-end">
            Edit Profile
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <SafeAreaScrollView>
          {loading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ThemedText className="text-center opacity-70">Loading profile...</ThemedText>
            </View>
          ) : (
            <View className="px-4">
              <ThemedText className="mb-6 opacity-70">
                Update your profile information
              </ThemedText>

              <ThemedTextInput
                label="Username"
                value={user?.username || ''}
                className="mb-4"
                editable={false}
              />

              <ThemedTextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                className="mb-4"
              />

              <ThemedTextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                className="mb-4"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <ThemedButton
                title="Save Changes"
                onPress={handleSave}
                loading={saving}
                disabled={loading}
                className="mt-2"
              />

              <ThemedButton
                title="Cancel"
                onPress={() => router.back()}
                variant="text"
                className="mt-2"
              />
            </View>
          )}
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
