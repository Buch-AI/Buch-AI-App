import { Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Logger from '@/utils/Logger';

interface VideoPlayerProps {
  /**
   * Base64 encoded video data URL (e.g., data:video/mp4;base64,...)
   */
  base64DataUrl: string;
}

export function VideoPlayer({ base64DataUrl }: VideoPlayerProps) {
  const [videoUri, setVideoUri] = useState<string>();

  useEffect(() => {
    async function prepareVideoUri() {
      try {
        if (Platform.OS === 'web') {
          // Convert base64 to Blob URL for web
          const base64Data = base64DataUrl.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'video/mp4' });
          const uri = URL.createObjectURL(blob);
          setVideoUri(uri);
        } else {
          // Save to file system for native platforms
          const base64Data = base64DataUrl.split(',')[1];
          const tempVideoPath = `${FileSystem.cacheDirectory}temp_video_${Date.now()}.mp4`;
          await FileSystem.writeAsStringAsync(tempVideoPath, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setVideoUri(tempVideoPath);
        }
      } catch (error) {
        Logger.error(`Failed to prepare video URI: ${error}`);
      }
    }

    prepareVideoUri();

    // Cleanup
    return () => {
      if (Platform.OS === 'web' && videoUri?.startsWith('blob:')) {
        URL.revokeObjectURL(videoUri);
      }
    };
  }, [base64DataUrl]);

  if (!videoUri) {
    return null;
  }

  if (Platform.OS === 'web') {
    return (
      <video
        src={videoUri}
        controls
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: 'transparent',
        }}
      />
    );
  }

  return (
    <Video
      source={{ uri: videoUri }}
      className="size-full"
      resizeMode={ResizeMode.CONTAIN}
      useNativeControls
      isLooping={false}
    />
  );
}
