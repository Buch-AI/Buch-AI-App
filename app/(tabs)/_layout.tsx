import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/ui-custom/HapticTab';
import { Ionicons } from '@expo/vector-icons';
import TabBarBackground from '@/components/ui-default/TabBarBackground';
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
        tabBarBackground: () => (
          <View className={`absolute inset-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-custom-focused`} />
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          elevation: 4,
          borderRadius: 20,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          backgroundColor: 'transparent',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
          tabBarLabel: ({ focused, color }) => (
            <ThemedText
              type="body"
              className={`text-xs mx-2 ${focused ? 'opacity-100' : 'opacity-70'}`}
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
          tabBarIcon: ({ color }) => <Ionicons size={28} name="create-outline" color={color} />,
          tabBarLabel: ({ focused, color }) => (
            <ThemedText
              type="body" 
              className={`text-xs mx-2 ${focused ? 'opacity-100' : 'opacity-70'}`}
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
          tabBarIcon: ({ color }) => <Ionicons size={28} name="people" color={color} />,
          tabBarLabel: ({ focused, color }) => (
            <ThemedText
              type="body"
              className={`text-xs mx-2 ${focused ? 'opacity-100' : 'opacity-70'}`}
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
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-circle" color={color} />,
          tabBarLabel: ({ focused, color }) => (
            <ThemedText
              type="body"
              className={`text-xs mx-2 ${focused ? 'opacity-100' : 'opacity-70'}`}
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
