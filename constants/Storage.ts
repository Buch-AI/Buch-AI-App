export const StorageKeys = {
  AUTH_JWT: 'buchai_auth_jwt',
} as const;

// Type for the storage keys
export type StorageKey = keyof typeof StorageKeys;

// Type for the storage values
export interface StorageValues {
  [StorageKeys.AUTH_JWT]: string;
}
