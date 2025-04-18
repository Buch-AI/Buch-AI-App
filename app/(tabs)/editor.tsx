import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { VideoPlayer } from '@/components/ui-custom/VideoPlayer';
import { WorkflowStatusBox, WorkflowState } from '@/components/ui-custom/WorkflowStatusBox';
import { StorageKeys } from '@/constants/Storage';
import { useStory } from '@/contexts/StoryContext';
import { ImageAdapter } from '@/services/ImageAdapter';
import { LlmAdapter } from '@/services/LlmAdapter';
import { MeAdapter } from '@/services/MeAdapter';
import Logger from '@/utils/Logger';

interface CreationPart {
  textJoined: string;
  textParts: string[];
  imageData?: string;
}

interface CreationWorkflowState extends WorkflowState {
  creationParts: CreationPart[];
  creationVideoUrl?: string;
}

// Add status messages for each step
const workflowStatusMessages: Record<WorkflowState['currStep'], string> = {
  'idle': 'Ready to generate your story.',
  'generating-story': 'Drafting your story with AI...',
  'generating-images': 'Generating illustrations...',
  'generating-video': 'Generating the video...',
  'completed': 'Your story has been created!',
};

const initialWorkflowState: CreationWorkflowState = {
  creationId: null,
  currStep: 'idle',
  error: null,
  creationParts: [],
  creationVideoUrl: undefined,
};

export default function Editor() {
  const { id: creationId } = useLocalSearchParams<{ id?: string }>();
  const [prompt, setPrompt] = useState('');
  const { dispatch } = useStory();
  const [workflowState, setWorkflowState] = useState<CreationWorkflowState>(initialWorkflowState);
  const [isLoadingCreation, setIsLoadingCreation] = useState(false);

  // Cleanup Blob URL on unmount or when video URL changes
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && workflowState.creationVideoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(workflowState.creationVideoUrl);
      }
    };
  }, [workflowState.creationVideoUrl]);

  useEffect(() => {
    if (creationId) {
      loadExistingCreation(creationId);
    } else {
      // Clear state when there's no creation ID
      setPrompt('');
      setWorkflowState(initialWorkflowState);
      dispatch({ type: 'SET_CURRENT_STORY', payload: null });
    }
  }, [creationId]);

  const loadExistingCreation = async (id: string) => {
    try {
      setIsLoadingCreation(true);

      const token = await AsyncStorage.getItem(StorageKeys.AUTH_JWT);
      if (!token) {
        throw new Error('Unauthorized');
      }

      const meAdapter = new MeAdapter(token);

      // Get story parts
      const storyParts = await meAdapter.getStoryParts(id);
      const images = await meAdapter.getImages(id);
      const video = await meAdapter.getVideo(id);

      // Create creation parts by combining text and images
      const creationParts = storyParts.map((part, index) => ({
        textJoined: part.join('\n\n'), // Join all sub-parts as the main text
        textParts: part, // Keep the original sub-parts array
        imageData: images[index],
      }));

      // Update state
      setWorkflowState({
        ...initialWorkflowState,
        creationId: id,
        currStep: 'completed',
        creationParts,
        creationVideoUrl: video,
      });
    } catch (error) {
      handleError(error, 'loading-existing-creation');
    } finally {
      setIsLoadingCreation(false);
    }
  };

  const updateWorkflowState = (updates: Partial<CreationWorkflowState>) => {
    setWorkflowState((current) => ({ ...current, ...updates }));
  };

  const handleError = (error: unknown, step: string) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(`Error in ${step}: ${errorMessage}`);
    updateWorkflowState({
      error: `Failed during ${step}: ${errorMessage}`,
      currStep: 'idle',
    });
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
  };

  const pollGenerateVideoStatus = async (
    meAdapter: MeAdapter,
    activeCreationId: string,
    maxAttempts = 60, // 10 minutes with 10-second intervals
    interval = 10,
  ): Promise<string> => {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await meAdapter.generateVideoStatus(activeCreationId);

        if (status.status === 'completed') {
          // Video is ready, get the URL
          return await meAdapter.getVideo(activeCreationId);
        } else if (status.status === 'failed') {
          throw new Error(status.message || 'Video generation failed');
        }

        // Still pending, wait and try again
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
        attempts++;
      } catch (error) {
        throw error;
      }
    }

    throw new Error('Video generation timed out');
  };

  async function startWorkflow() {
    const token = await AsyncStorage.getItem(StorageKeys.AUTH_JWT);
    if (!token) {
      throw new Error('Unauthorized');
    }

    if (!prompt.trim()) return;

    try {
      // Reset state but preserve creationId if it exists
      updateWorkflowState({
        ...initialWorkflowState,
        creationId: creationId || null,
        currStep: 'generating-story',
      });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Initialize adapters
      const meAdapter = new MeAdapter(token);
      const llmAdapter = new LlmAdapter();
      const imageAdapter = new ImageAdapter();

      // Step 1: Use existing creation ID or generate a new one
      const activeCreationId = creationId || await meAdapter.generateCreation();
      updateWorkflowState({ creationId: activeCreationId });

      // Step 2: Generate story
      let generatedText = '';
      const streamGenerator = llmAdapter.generateStoryStream(prompt);
      for await (const token of streamGenerator) {
        generatedText += token;
      }

      // Step 3: Split story into parts
      const textParts = await llmAdapter.splitStory(generatedText);
      const textPartsWithoutImages = textParts.map((part) => ({
        textJoined: part.join('\n\n'), // Join all sub-parts as the main text
        textParts: part, // Keep the original sub-parts array
      }));
      updateWorkflowState({
        creationParts: textPartsWithoutImages,
        currStep: 'generating-images',
      });

      // Save story parts to backend
      await meAdapter.setStoryParts(activeCreationId, textParts);

      // Step 4: Generate images for each part
      const updatedParts: CreationPart[] = [];
      for (const part of textPartsWithoutImages) {
        try {
          const imageData = await imageAdapter.generateImage(part.textJoined);
          updatedParts.push({ ...part, imageData });
        } catch (error) {
          Logger.error(`Failed to generate image: ${error}`);
          updatedParts.push(part); // Keep the part even if image generation fails
        }
      }

      // Save images to backend
      const images = updatedParts
        .map((part) => part.imageData)
        .filter((img): img is string => Boolean(img));
      await meAdapter.setImages(activeCreationId, images);

      // Step 5: Generate video
      updateWorkflowState({
        creationParts: updatedParts,
        currStep: 'generating-video',
      });

      // Start video generation
      const videoGeneration = await meAdapter.generateVideo(activeCreationId);
      if (videoGeneration.status === 'failed') {
        throw new Error(videoGeneration.message || 'Failed to start video generation');
      }

      // Poll for video completion
      const videoUrl = await pollGenerateVideoStatus(meAdapter, activeCreationId);
      Logger.info(`Received video URL: ${videoUrl}`);

      updateWorkflowState({
        creationParts: updatedParts,
        creationVideoUrl: videoUrl,
        currStep: 'completed',
      });

      // Update story context
      dispatch({
        type: 'SET_CURRENT_STORY',
        payload: {
          id: activeCreationId,
          prompt,
          content: generatedText,
          authorId: 'current-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      handleError(error, workflowState.currStep);
    }
  }

  const isGenerating = workflowState.currStep !== 'idle' && workflowState.currStep !== 'completed';

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        <View className="my-4">
          <ThemedText type="title">Create Your Story</ThemedText>
        </View>

        <WorkflowStatusBox
          workflowState={workflowState}
          workflowStatusMessages={workflowStatusMessages}
        />

        {workflowState.error && (
          <ThemedText className="mt-2 text-red-500">{workflowState.error}</ThemedText>
        )}

        <SafeAreaScrollView>
          <ThemedTextInput
            label="What is your story about?"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            className="mt-2 h-24 rounded-lg"
            editable={!isGenerating}
            maxLength={1000}
          />

          <ThemedButton
            onPress={startWorkflow}
            disabled={isGenerating || !prompt.trim()}
            loading={isGenerating}
            title={isGenerating ? 'Generating...' : 'Generate Story'}
          />

          {isLoadingCreation ? (
            <View className="my-6 items-center justify-center py-8">
              <ActivityIndicator size="large" />
              <ThemedText className="mt-4">Loading creation...</ThemedText>
            </View>
          ) : workflowState.creationParts.length > 0 && (
            <>
              <View className="my-6 h-px bg-gray-200 dark:bg-gray-700" />
              <ThemedText type="title">Creation Parts</ThemedText>

              {workflowState.creationParts.map((part, index) => (
                <View key={index} className="my-4">
                  <ThemedText type="book" className="mb-2 text-xl font-bold opacity-50">
                    Chapter {index + 1}
                  </ThemedText>
                  <ThemedText type="book" className="mb-4">{part.textJoined}</ThemedText>

                  {part.textParts && part.textParts.length > 0 && (
                    <View className="mb-4">
                      {part.textParts.map((subPart, subIndex) => (
                        <ThemedText key={subIndex} type="book" className="mb-2">
                          {subPart}
                        </ThemedText>
                      ))}
                    </View>
                  )}

                  {workflowState.currStep === 'generating-images' && !part.imageData ? (
                    <View className="h-[512px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <ThemedText>Generating image...</ThemedText>
                    </View>
                  ) : part.imageData ? (
                    <View className="h-[512px] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Image
                        source={{ uri: part.imageData }}
                        className="size-full"
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                      />
                    </View>
                  ) : (
                    <View className="h-[512px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <ThemedText>Failed to generate image</ThemedText>
                    </View>
                  )}
                </View>
              ))}

              {workflowState.creationVideoUrl && (
                <>
                  <View className="my-6 h-px bg-gray-200 dark:bg-gray-700" />
                  <ThemedText type="title" className="mb-4">Story Video</ThemedText>
                  <View className="h-[512px] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    <VideoPlayer base64DataUrl={workflowState.creationVideoUrl} />
                  </View>
                </>
              )}
            </>
          )}
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
