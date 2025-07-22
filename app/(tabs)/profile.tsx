import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { TabBarSpacerView } from '@/components/ui-custom/TabBarSpacerView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
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

interface ProfileItem {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export default function ProfileScreen() {
  const { signOut, jsonWebToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!jsonWebToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser(jsonWebToken);
        setUser(userData);
      } catch (error) {
        Logger.error(`Failed to fetch user data: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [jsonWebToken]);

  const profileItems: ProfileItem[] = [
    {
      title: 'Edit Profile',
      subtitle: 'Update your profile information',
      icon: 'person-outline',
      onPress: () => router.push('/(profile)/edit-profile'),
    },
    {
      title: 'Upgrade Your Plan',
      subtitle: 'Purchase bonus credits or subscribe to a plan',
      icon: 'card-outline',
      onPress: () => router.push('/payments/checkout'),
    },
    {
      title: 'Legal',
      subtitle: 'Privacy Policy, Terms of Service',
      icon: 'document-text-outline',
      onPress: () => router.push('/legal'),
    },
    {
      title: 'Settings',
      subtitle: 'App preferences and configuration',
      icon: 'settings-outline',
      onPress: () => {
        Logger.info('Settings button pressed - not implemented yet');
      },
      disabled: true,
    },
    {
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      icon: 'exit-outline',
      onPress: signOut,
      destructive: true,
    },
  ];

  const renderProfileItem = (item: ProfileItem, index: number) => (
    <Pressable
      key={index}
      onPress={item.onPress}
      disabled={item.disabled}
      className={`mb-3 rounded-lg p-4 ${
        item.disabled ?
          'bg-gray-200/60 dark:bg-gray-700/60' :
          'bg-white/60 active:bg-white/80 dark:bg-gray-800/60 dark:active:bg-gray-800/80'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <Ionicons
            name={item.icon}
            size={24}
            color={item.destructive ? '#ef4444' : item.disabled ? textColor : tintColor}
            style={{ opacity: item.disabled ? 0.5 : 1 }}
          />
          <View className="ml-4 flex-1">
            <ThemedText
              className={`text-base font-semibold ${item.disabled ? 'opacity-40' : ''}`}
              style={item.destructive ? { color: '#ef4444' } : {}}
            >
              {item.title}
            </ThemedText>
            {item.subtitle && (
              <ThemedText className={`text-xs opacity-60 ${item.disabled ? 'opacity-20' : ''}`}>
                {item.subtitle}
              </ThemedText>
            )}
          </View>
        </View>
        {!item.disabled && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={textColor}
            style={{ opacity: 0.5 }}
          />
        )}
      </View>
    </Pressable>
  );

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        <View className="my-2">
          <ThemedText type="title">Profile</ThemedText>
        </View>

        <SafeAreaScrollView>
          {/* User Information Section */}
          <View className="mb-8">
            {loading ? (
              <View className="rounded-lg bg-white/60 p-4 dark:bg-gray-800/60">
                <ThemedText className="text-center opacity-70">Loading your profile...</ThemedText>
              </View>
            ) : user ? (
              <View className="rounded-lg bg-white/60 p-4 dark:bg-gray-800/60">
                <View className="flex-row items-center">
                  <View className="mr-4 size-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <Ionicons name="person" size={32} color={tintColor} />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="mb-1">
                      {user.full_name || user.username}
                    </ThemedText>
                    {user.email && (
                      <ThemedText className="mb-2 opacity-60">{user.email}</ThemedText>
                    )}
                    <ThemedText className="text-xs opacity-60">
                      Member since: Loading... {/* TODO: Fetch join date */}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ) : (
              <View className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
                <ThemedText className="text-center opacity-70">Failed to load your profile information</ThemedText>
              </View>
            )}
          </View>

          {/* Profile Options List */}
          <View className="mb-4">
            <ThemedText className="mb-4 text-base font-semibold opacity-60">
              Options
            </ThemedText>
            {profileItems.map(renderProfileItem)}
          </View>
        </SafeAreaScrollView>

        <TabBarSpacerView />
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
