# Tab Bar Spacing Utilities

This directory contains several utilities to help manage content spacing with the floating tab bar in the application.

## Components and Hooks

### 1. `useTabBarPadding` Hook

A simple hook that calculates the appropriate bottom padding needed to ensure content is not obscured by the floating tab bar.

```tsx
import { useTabBarPadding } from '@/components/ui-custom/useTabBarPadding';

function MyComponent() {
  const tabBarPadding = useTabBarPadding();
  // Or with extra padding:
  // const tabBarPadding = useTabBarPadding(20); // adds 20px extra

  return (
    <ScrollView
      contentContainerStyle={{ 
        paddingBottom: tabBarPadding 
      }}
      scrollIndicatorInsets={{ bottom: tabBarPadding }}
    >
      {/* Your content */}
    </ScrollView>
  );
}
```

### 2. `TabBarSpacerView` Component

A simple spacer component to add at the bottom of your content to provide the appropriate padding for the tab bar. This is the preferred approach for adding tab bar spacing.

```tsx
import { TabBarSpacerView } from '@/components/ui-custom/TabBarSpacerView';

function MyComponent() {
  return (
    <View>
      {/* Your content */}
      <TabBarSpacerView />
      {/* Or with extra padding */}
      {/* <TabBarSpacerView extraPadding={20} /> */}
    </View>
  );
}
```

## Usage Examples

### For ScrollView:

```tsx
import { ScrollView } from 'react-native';
import { TabBarSpacerView } from '@/components/ui-custom/TabBarSpacerView';

function MyScreen() {
  return (
    <ScrollView>
      {/* Your content */}
      <TabBarSpacerView />
    </ScrollView>
  );
}
```

### For FlatList:

```tsx
import { FlatList } from 'react-native';
import { TabBarSpacerView } from '@/components/ui-custom/TabBarSpacerView';

function MyScreen() {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={myData}
        renderItem={({ item }) => <MyItem item={item} />}
        ListFooterComponent={<TabBarSpacerView />}
      />
    </View>
  );
}
```

### For Manual Padding (Advanced Use Cases):

```tsx
import { ScrollView } from 'react-native';
import { useTabBarPadding } from '@/components/ui-custom/useTabBarPadding';

function MyScreen() {
  const tabBarPadding = useTabBarPadding();
  
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: tabBarPadding }}
      scrollIndicatorInsets={{ bottom: tabBarPadding }}
    >
      {/* Your content */}
    </ScrollView>
  );
}
``` 