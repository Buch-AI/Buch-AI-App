import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  children: string;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ onPress, children, disabled, loading }: ButtonProps) {
  return (
    <TouchableOpacity
      className={`items-center rounded-lg bg-[#0a7ea4] p-3 ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 24,
            minHeight: 24,
          }}
        >
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <Text className="text-lg font-semibold text-white">{children}</Text>
      )}
    </TouchableOpacity>
  );
}
