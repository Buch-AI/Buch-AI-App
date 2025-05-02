import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { useAuth } from '@/contexts/AuthContext';
import { useStory } from '@/contexts/StoryContext';
import { ImageAdapter } from '@/services/ImageAdapter';
import { LlmAdapter } from '@/services/LlmAdapter';
import { MeAdapter } from '@/services/MeAdapter';
import Logger from '@/utils/Logger';

interface CreationPart {
  textJoined: string;
  textParts: string[];
  imagePrompt?: string;
  imageData?: string;
}

interface CreationWorkflowState extends WorkflowState {
  storySummary?: string;
  creationParts: CreationPart[];
  creationVideoUrl?: string;
}

// Add status messages for each step
const workflowStatusMessages: Record<WorkflowState['currStep'], string> = {
  'idle': 'Ready to generate your story.',
  'generating-story': 'Drafting your story with AI...',
  'summarizing-story': 'Summarizing your story...',
  'generating-image-prompts': 'Creating image prompts...',
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
  storySummary: undefined,
};

export default function Editor() {
  const { id: urlCreationId } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const { dispatch } = useStory();
  const { jsonWebToken } = useAuth();
  const [workflowState, setWorkflowState] = useState<CreationWorkflowState>(initialWorkflowState);
  const [isLoadingCreation, setIsLoadingCreation] = useState(false);
  const [isGenningCreation, setIsGenningCreation] = useState(false);

  // Cleanup Blob URL on unmount or when video URL changes
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && workflowState.creationVideoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(workflowState.creationVideoUrl);
      }
    };
  }, [workflowState.creationVideoUrl]);

  useEffect(() => {
    if (isGenningCreation)
      return;

    if (urlCreationId) {
      startLoadCreationWorkflow(urlCreationId);
    } else {
      // Clear state when there's no creation ID
      setPrompt('');
      setWorkflowState(initialWorkflowState);
      dispatch({ type: 'SET_CURRENT_STORY', payload: null });
    }
  }, [urlCreationId]);

  const updateWorkflowState = (updates: Partial<CreationWorkflowState>) => {
    setWorkflowState((current) => ({ ...current, ...updates }));

    // If creationId is being updated and it's different from the URL parameter,
    // update the URL to include the new creationId
    if (updates.creationId && updates.creationId !== urlCreationId) {
      router.setParams({ id: updates.creationId });
    }
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

  const startLoadCreationWorkflow = async (id: string) => {
    try {
      setIsLoadingCreation(true);

      updateWorkflowState({
        ...initialWorkflowState,
        creationId: id,
        currStep: 'generating-story',
      });

      if (!jsonWebToken) {
        throw new Error('Unauthorized');
      }

      const meAdapter = new MeAdapter(jsonWebToken);

      // Get story parts
      const storyParts = await meAdapter.getStoryParts(id);
      const images = await meAdapter.getImages(id);
      const video = await meAdapter.getVideo(id);

      // Create creation parts by combining text and images
      const creationParts = storyParts.map((part, index) => ({
        textJoined: part.join(' '), // Join all sub-parts as the main text
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

      // Update story context
      dispatch({
        type: 'SET_CURRENT_STORY',
        payload: {
          id,
          prompt: '',
          content: creationParts.map(part => part.textJoined).join('\n\n'),
          authorId: 'current-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      handleError(error, 'loading-existing-creation');
    } finally {
      setIsLoadingCreation(false);
    }
  };

  const startGenerateCreationWorkflow = async () => {
    if (!prompt.trim()) return;

    try {
      setIsGenningCreation(true);

      // Reset state but preserve creationId if it exists
      updateWorkflowState({
        ...initialWorkflowState,
        creationId: urlCreationId || null,
        currStep: 'generating-story',
      });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (!jsonWebToken) {
        throw new Error('Unauthorized');
      }

      // Initialize adapters
      const meAdapter = new MeAdapter(jsonWebToken);
      const llmAdapter = new LlmAdapter();
      const imageAdapter = new ImageAdapter();

      // Step 1: Use existing creation ID or generate a new one
      const activeCreationId = urlCreationId || await meAdapter.generateCreation();
      updateWorkflowState({ creationId: activeCreationId });

      // Step 2: Generate story
      let generatedText = '';
      const streamGenerator = llmAdapter.generateStoryStream(prompt);
      for await (const token of streamGenerator) {
        generatedText += token;
      }

      // Split story into parts as part of the story generation step
      const textParts = await llmAdapter.splitStory(generatedText);
      const textPartsWithoutImages = textParts.map((part) => ({
        textJoined: part.join(' '), // Join all sub-parts as the main text
        textParts: part, // Keep the original sub-parts array
      }));

      // Save story parts to backend
      await meAdapter.setStoryParts(activeCreationId, textParts);

      // Step 3: Summarize story
      updateWorkflowState({ currStep: 'summarizing-story' });
      const storySummary = await llmAdapter.summariseStory(generatedText);
      updateWorkflowState({ storySummary: storySummary });

      // Step 4: Generate image prompts
      updateWorkflowState({
        creationParts: textPartsWithoutImages,
        currStep: 'generating-image-prompts',
      });

      // Create array of joined text parts for image prompt generation
      const imagePrompts = await llmAdapter.generateImagePrompts(storySummary, textPartsWithoutImages.map((part) => part.textJoined));

      // Add image prompts to creation parts
      const partsWithPrompts = textPartsWithoutImages.map((part, index) => ({
        ...part,
        imagePrompt: imagePrompts[index],
      }));

      updateWorkflowState({
        creationParts: partsWithPrompts,
        currStep: 'generating-images',
      });

      // Step 5: Generate images for each part
      const updatedParts: CreationPart[] = [];
      for (const part of partsWithPrompts) {
        try {
          // Use the generated image prompt if available, fallback to text
          const promptText = part.imagePrompt || part.textJoined;
          const imageData = await imageAdapter.generateImage(promptText);
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

      // Step 6: Generate video
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
    } finally {
      setIsGenningCreation(false);
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
          className="z-10"
        />

        {workflowState.error && (
          <View className={`mt-2 rounded-lg bg-red-200/40 p-4 dark:bg-red-800/40 shadow-custom z-10`}>
            <ThemedText type="body">{workflowState.error}</ThemedText>
          </View>
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
            onPress={startGenerateCreationWorkflow}
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
                  <ThemedText type="book" className="mb-4">
                    {part.textJoined}
                  </ThemedText>

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
