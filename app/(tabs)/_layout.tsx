import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/ui-custom/HapticTab';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ui-custom/ThemedText';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelPosition: 'below-icon',
        tabBarBackground: () => (
          <View className={`absolute inset-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-custom-focused`} />
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 56,
          elevation: 4,
          borderRadius: 20,
          // NOTE: Add extra padding at the bottom for iOS to account for the home indicator area and to ensure content isn't too close to the bottom edge of the screen
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          backgroundColor: 'transparent',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <View className="items-center">
              <Ionicons size={24} name="home" color={color} />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <ThemedText
              type="body"
              className={`text-xs text-center ${focused ? 'opacity-100' : 'opacity-60'}`}
              style={{ color }}
            >
              Home
            </ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="editor"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => (
            <View className="items-center">
              <Ionicons size={24} name="create-outline" color={color} />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <ThemedText
              type="body" 
              className={`text-xs text-center ${focused ? 'opacity-100' : 'opacity-60'}`}
              style={{ color }}
            >
              Create
            </ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => (
            <View className="items-center">
              <Ionicons size={24} name="people" color={color} />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <ThemedText
              type="body"
              className={`text-xs text-center ${focused ? 'opacity-100' : 'opacity-60'}`}
              style={{ color }}
            >
              Community
            </ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <View className="items-center">
              <Ionicons size={24} name="person-circle" color={color} />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <ThemedText
              type="body"
              className={`text-xs text-center ${focused ? 'opacity-100' : 'opacity-60'}`}
              style={{ color }}
            >
              Profile
            </ThemedText>
          ),
        }}
      />
    </Tabs>
  );
}
