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
      className={`items-center rounded-lg bg-[#0a7ea4] p-3 ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-lg font-semibold text-white">{children}</Text>
      )}
    </TouchableOpacity>
  );
}
