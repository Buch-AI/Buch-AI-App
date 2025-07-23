import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  children: string;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ onPress, children, disabled, loading }: ButtonProps) {
  return (
    <TouchableOpacity
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#0a7ea4',
        padding: 12,
        opacity: disabled ? 0.5 : 1,
      }}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-lg font-semibold text-white">{children}</Text>
      )}
    </TouchableOpacity>
  );
}
