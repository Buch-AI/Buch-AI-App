import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { Spinner } from '@/components/ui-custom/Spinner';
import { ThemedBackgroundView } from '@/components/ui-custom/ThemedBackgroundView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedContainerView } from '@/components/ui-custom/ThemedContainerView';
import { ThemedHorizontalRule } from '@/components/ui-custom/ThemedHorizontalRule';
import { ThemedImage } from '@/components/ui-custom/ThemedImage';
import { ThemedModal } from '@/components/ui-custom/ThemedModal';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { VideoPlayer } from '@/components/ui-custom/VideoPlayer';
import { WorkflowStatusBox, WorkflowState } from '@/components/ui-custom/WorkflowStatusBox';
import { useAuth } from '@/contexts/AuthContext';
import { useStory } from '@/contexts/StoryContext';
import { CreationAdapter } from '@/services/CreationAdapter';
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

  // MeAdapter CreationProfileUpdate fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [unsavedTitle, setUnsavedTitle] = useState(false);
  const [unsavedDescription, setUnsavedDescription] = useState(false);

  // MeAdapter CreationProfileUpdate loading state
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Modal state for leave confirmation
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Clean up Blob URL on unmount or when video URL changes
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && workflowState.creationVideoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(workflowState.creationVideoUrl);
      }
    };
  }, [workflowState.creationVideoUrl]);

  useEffect(() => {
    if (isGenningCreation) {
      return;
    }

    if (urlCreationId) {
      startLoadCreationWorkflow(urlCreationId);
      loadCreationProfile(urlCreationId);
    } else {
      // Clear state when there's no creation ID
      setPrompt('');
      setWorkflowState(initialWorkflowState);
      dispatch({ type: 'SET_CURRENT_STORY', payload: null });

      // Reset editable fields when there's no creation ID
      setTitle('');
      setDescription('');
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
    creationAdapter: CreationAdapter,
    activeCreationId: string,
    maxAttempts = 60, // 10 minutes with 10-second intervals
    interval = 10,
  ): Promise<string> => {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await creationAdapter.generateVideoStatus(activeCreationId);

        if (status.status === 'completed') {
          // Video is ready, get the URL
          return await creationAdapter.getVideo(activeCreationId);
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

      const creationAdapter = new CreationAdapter(jsonWebToken);

      // Get story parts
      const storyParts = await creationAdapter.getStoryParts(id);
      const images = await creationAdapter.getImages(id);
      const video = await creationAdapter.getVideo(id);

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
          content: creationParts.map((part) => part.textJoined).join('\n\n'),
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
      const creationAdapter = new CreationAdapter(jsonWebToken);
      const llmAdapter = new LlmAdapter();
      const imageAdapter = new ImageAdapter();

      // Step 1: Use existing creation ID or generate a new one
      const activeCreationId = urlCreationId || await creationAdapter.generateCreation();
      updateWorkflowState({ creationId: activeCreationId });

      // Generate a cost centre ID for tracking costs
      const costCentreId = await creationAdapter.generateCostCentre(activeCreationId);
      Logger.info(`Generated cost centre ID ${costCentreId} for creation ID ${activeCreationId}`);

      // If this is a new creation, set a default title based on the prompt
      if (!urlCreationId) {
        const defaultTitle = activeCreationId;
        setTitle(defaultTitle);

        // Save the default title
        await creationAdapter.updateCreation(activeCreationId, { title: defaultTitle });
      }

      // Step 2: Generate story
      let generatedText = '';
      const streamGenerator = llmAdapter.generateStoryStream(prompt, costCentreId);
      for await (const token of streamGenerator) {
        generatedText += token;
      }

      // Split story into parts as part of the story generation step
      const textParts = await llmAdapter.splitStory(generatedText, costCentreId);
      const textPartsWithoutImages = textParts.map((part) => ({
        textJoined: part.join(' '), // Join all sub-parts as the main text
        textParts: part, // Keep the original sub-parts array
      }));

      // Save story parts to backend
      await creationAdapter.setStoryParts(activeCreationId, textParts);

      // Step 3: Summarize story
      updateWorkflowState({ currStep: 'summarizing-story' });
      const storySummary = await llmAdapter.summariseStory(generatedText, costCentreId);
      updateWorkflowState({ storySummary: storySummary });

      // Step 4: Generate image prompts
      updateWorkflowState({
        creationParts: textPartsWithoutImages,
        currStep: 'generating-image-prompts',
      });

      // Create array of joined text parts for image prompt generation
      const imagePrompts = await llmAdapter.generateImagePrompts(
        generatedText,
        textPartsWithoutImages.map((part) => part.textJoined),
        costCentreId,
      );

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
          const imageData = await imageAdapter.generateImage(promptText, costCentreId);
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
      await creationAdapter.setImages(activeCreationId, images);

      // Step 6: Generate video
      updateWorkflowState({
        creationParts: updatedParts,
        currStep: 'generating-video',
      });

      // Start video generation
      const videoGeneration = await creationAdapter.generateVideo(activeCreationId, costCentreId);
      if (videoGeneration.status === 'failed') {
        throw new Error(videoGeneration.message || 'Failed to start video generation');
      }

      // Poll for video completion
      const videoUrl = await pollGenerateVideoStatus(creationAdapter, activeCreationId);
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
      handleError(error, 'generating-creation');
    } finally {
      setIsGenningCreation(false);
    }
  };

  const loadCreationProfile = async (creationId: string) => {
    try {
      setIsLoadingProfile(true);
      // This method could stay with MeAdapter or move to a more specialized adapter
      // For simplicity, we'll assume it should continue to get the data from the MeAdapter
      // since it's about user-specific operations

      if (!jsonWebToken) {
        throw new Error('Unauthorized');
      }

      const meAdapter = new MeAdapter(jsonWebToken);
      const creations = await meAdapter.getUserCreations();
      const creation = creations.find((c) => c.creation_id === creationId);

      if (creation) {
        setTitle(creation.title);
        setDescription(creation.description || '');
      }
    } catch (error) {
      Logger.error(`Failed to load creation profile: ${error}`);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const updateCreationTitle = async () => {
    try {
      if (!workflowState.creationId || !jsonWebToken) {
        throw new Error('No creation or unauthorized');
      }

      setIsSavingTitle(true);
      const creationAdapter = new CreationAdapter(jsonWebToken);
      await creationAdapter.updateCreation(workflowState.creationId, { title });
      setUnsavedTitle(false);

      // Show success message or update UI as needed
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to update title: ${message}`);
      // Show error message
    } finally {
      setIsSavingTitle(false);
    }
  };

  const updateCreationDescription = async () => {
    try {
      if (!workflowState.creationId || !jsonWebToken) {
        throw new Error('No creation or unauthorized');
      }

      setIsSavingDescription(true);
      const creationAdapter = new CreationAdapter(jsonWebToken);
      await creationAdapter.updateCreation(workflowState.creationId, { description });
      setUnsavedDescription(false);

      // Show success message or update UI as needed
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to update description: ${message}`);
      // Show error message
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setUnsavedTitle(true);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setUnsavedDescription(true);
  };

  const hasActiveCreationId = !!workflowState.creationId;

  const handleClosePress = () => {
    if (isGenningCreation) {
      setShowLeaveModal(true);
    } else {
      router.back();
    }
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    router.back();
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  return (
    <ThemedBackgroundView>
      <ThemedContainerView className="flex-1">
        <ThemedModal
          visible={showLeaveModal}
          onClose={handleCancelLeave}
          title="Leave while generating?"
          message="Your story is still being generated. If you leave now, you won't be able to track the generation progress in real time. Are you sure you want to leave?"
          primaryButton={{
            title: 'Leave',
            onPress: handleConfirmLeave,
            variant: 'danger',
          }}
        />

        <View className="my-2 flex-row items-center justify-between">
          <ThemedButton
            iconOnly
            icon={<Ionicons name="close" size={16} />}
            onPress={() => router.back()}
            variant="icon"
          />
          <ThemedText type="title" className="flex-1 text-end">
            Create Your Story
          </ThemedText>
        </View>

        <WorkflowStatusBox
          workflowState={workflowState}
          workflowStatusMessages={workflowStatusMessages}
          className="z-10"
        />

        {workflowState.error && (
          <View className={`z-10 mt-2 rounded-lg bg-red-200/40 p-4 shadow-custom dark:bg-red-800/40`}>
            <ThemedText type="body">{workflowState.error}</ThemedText>
          </View>
        )}

        <SafeAreaScrollView>
          <View>
            {isLoadingProfile ? (
              <View className="items-center justify-center py-2">
                <Spinner size="small" />
                <ThemedText className="mt-2">Loading creation profile...</ThemedText>
              </View>
            ) : !(hasActiveCreationId && !isGenningCreation) ? (
              <></>
            ) : (
              <>
                <View className="mb-4">
                  <View className="flex-row">
                    <View className="mr-2 flex-1">
                      <ThemedTextInput
                        label="Title"
                        value={title}
                        onChangeText={handleTitleChange}
                        className="rounded-lg"
                        editable={hasActiveCreationId && !isGenningCreation && !isSavingTitle}
                      />
                    </View>
                    <View className="justify-center">
                      <ThemedButton
                        iconOnly
                        icon={<Ionicons name="save-outline" size={20} color={unsavedTitle ? '#fff' : '#888'} />}
                        onPress={updateCreationTitle}
                        variant={unsavedTitle ? 'primary' : 'secondary'}
                        disabled={!unsavedTitle || isSavingTitle || isGenningCreation}
                        loading={isSavingTitle}
                        size="xs"
                      />
                    </View>
                  </View>
                </View>

                <View className="mb-4">
                  <View className="flex-row">
                    <View className="mr-2 flex-1">
                      <ThemedTextInput
                        label="Description"
                        value={description}
                        onChangeText={handleDescriptionChange}
                        className="rounded-lg"
                        editable={hasActiveCreationId && !isGenningCreation && !isSavingDescription}
                      />
                    </View>
                    <View className="justify-center">
                      <ThemedButton
                        iconOnly
                        icon={<Ionicons name="save-outline" size={20} color={unsavedDescription ? '#fff' : '#888'} />}
                        onPress={updateCreationDescription}
                        variant={unsavedDescription ? 'primary' : 'secondary'}
                        disabled={!unsavedDescription || isSavingDescription || isGenningCreation}
                        loading={isSavingDescription}
                        size="xs"
                      />
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>

          <ThemedTextInput
            label="What is your story about?"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            className="mb-4 rounded-lg"
            editable={!isGenningCreation}
            maxLength={1000}
          />

          <ThemedButton
            onPress={startGenerateCreationWorkflow}
            disabled={isGenningCreation || !prompt.trim()}
            loading={isGenningCreation}
            title={isGenningCreation ? 'Generating...' : 'Generate Story'}
          />

          {isGenningCreation && (
            <ThemedText className="my-1 text-center text-xs">
              End-to-end story creation takes around 5 minutes.
            </ThemedText>
          )}

          {isLoadingCreation ? (
            <View className="my-6 items-center justify-center py-8">
              <Spinner size="small" />
              <ThemedText className="mt-2">Loading creation assets...</ThemedText>
            </View>
          ) : workflowState.creationParts.length > 0 && (
            <>
              <ThemedHorizontalRule />

              {workflowState.creationVideoUrl && (
                <>
                  <View className="mx-auto mb-6 h-[480px] w-[320px] overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800">
                    {/* TODO: This needs refining. */}
                    <VideoPlayer base64DataUrl={workflowState.creationVideoUrl} />
                  </View>

                  <ThemedHorizontalRule />
                </>
              )}

              {workflowState.creationParts.map((part, index) => (
                <View key={index} className="mb-8 lg:mb-6">
                  <ThemedText type="book" className="mb-2 text-xl font-bold opacity-50">
                    Chapter {index + 1}
                  </ThemedText>

                  {/* Responsive container: vertical on mobile, horizontal on wide screens */}
                  <View className="flex flex-col items-start justify-start space-y-4 lg:flex-row lg:gap-6 lg:space-y-0">
                    {/* Text content container */}
                    <View className="w-full lg:flex-1">
                      <ThemedText type="book" className="text-base leading-relaxed">
                        {part.textJoined}
                      </ThemedText>
                    </View>

                    {/* Image container */}
                    <View className="w-full lg:h-auto lg:flex-1">
                      {workflowState.currStep === 'generating-images' && !part.imageData ? (
                        <View className="h-64 w-full items-center justify-center rounded-lg bg-gray-200 lg:h-full dark:bg-gray-800">
                          <ThemedText>Generating image...</ThemedText>
                        </View>
                      ) : part.imageData ? (
                        <View className="w-full items-center justify-center lg:h-full">
                          <ThemedImage
                            source={{ uri: part.imageData }}
                            className="size-full rounded-lg"
                          />
                        </View>
                      ) : (
                        <View className="h-64 w-full items-center justify-center rounded-lg bg-gray-200 lg:h-full dark:bg-gray-800">
                          <ThemedText>Failed to generate image</ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </SafeAreaScrollView>
      </ThemedContainerView>
    </ThemedBackgroundView>
  );
}
