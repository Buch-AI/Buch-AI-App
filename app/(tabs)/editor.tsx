import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { WorkflowStatusBox, WorkflowState } from '@/components/ui-custom/WorkflowStatusBox';
import { StorageKeys } from '@/constants/Storage';
import { useStory } from '@/contexts/StoryContext';
import { ImageAdapter } from '@/services/ImageAdapter';
import { LlmAdapter } from '@/services/LlmAdapter';
import { MeAdapter } from '@/services/MeAdapter';
import Logger from '@/utils/Logger';

interface CreationPart {
  text: string;
  imageData?: string;
}

interface CreationWorkflowState extends WorkflowState {
  creationParts: CreationPart[];
}

// Add status messages for each step
const workflowStatusMessages: Record<WorkflowState['currentStep'], string> = {
  'idle': 'Ready to generate your story',
  'generating-story': 'Crafting your story with AI...',
  'generating-images': 'Creating beautiful illustrations for your story...',
  'completed': 'Your story has been created!',
};

const initialWorkflowState: CreationWorkflowState = {
  creationId: null,
  currentStep: 'idle',
  error: null,
  creationParts: [],
};

export default function Editor() {
  const { id: creationId } = useLocalSearchParams<{ id?: string }>();
  const [prompt, setPrompt] = useState('');
  const { dispatch } = useStory();
  const [workflowState, setWorkflowState] = useState<CreationWorkflowState>(initialWorkflowState);
  const [isLoadingCreation, setIsLoadingCreation] = useState(false);

  useEffect(() => {
    if (creationId) {
      loadExistingCreation(creationId);
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

      // Create creation parts by combining text and images
      const creationParts = storyParts.map((text, index) => ({
        text,
        imageData: images[index],
      }));

      // Update state
      setWorkflowState({
        ...initialWorkflowState,
        creationId: id,
        currentStep: 'completed',
        creationParts,
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
      currentStep: 'idle',
    });
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
  };

  async function startWorkflow() {
    const token = await AsyncStorage.getItem(StorageKeys.AUTH_JWT);
    if (!token) {
      throw new Error('Unauthorized');
    }

    if (!prompt.trim()) return;

    try {
      // Reset state
      updateWorkflowState({
        ...initialWorkflowState,
        currentStep: 'generating-story',
      });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Initialize adapters
      const meAdapter = new MeAdapter(token);
      const llmAdapter = new LlmAdapter();
      const imageAdapter = new ImageAdapter();

      // Step 1: Generate creation ID
      const newCreationId = await meAdapter.generateCreation();
      updateWorkflowState({ creationId: newCreationId });

      // Step 2: Generate story
      let generatedText = '';
      const streamGenerator = llmAdapter.generateStoryStream(prompt);
      for await (const token of streamGenerator) {
        generatedText += token;
      }

      // Step 3: Split story into parts
      const creationParts = await llmAdapter.splitStory(generatedText);
      const partsWithoutImages = creationParts.map((text) => ({ text }));
      updateWorkflowState({
        creationParts: partsWithoutImages,
        currentStep: 'generating-images',
      });

      // Save story parts to backend
      await meAdapter.setStoryParts(newCreationId, creationParts);

      // Step 4: Generate images for each part
      const updatedParts: CreationPart[] = [];
      for (const part of partsWithoutImages) {
        try {
          const imageData = await imageAdapter.generateImage(part.text);
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
      await meAdapter.setImages(newCreationId, images);

      // Update final state
      updateWorkflowState({
        creationParts: updatedParts,
        currentStep: 'completed',
      });

      // Update story context
      dispatch({
        type: 'SET_CURRENT_STORY',
        payload: {
          id: newCreationId,
          prompt,
          content: generatedText,
          authorId: 'current-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      handleError(error, workflowState.currentStep);
    }
  }

  const isGenerating = workflowState.currentStep !== 'idle' && workflowState.currentStep !== 'completed';

  return (
    <SafeAreaScrollView>
      <ThemedView className="flex-1 p-4">
        <ThemedText type="title">Create Your Story</ThemedText>

        <ThemedTextInput
          placeholder="What is your story about?"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          className="my-4 h-24 rounded-lg !bg-white/40 p-3 shadow-lg"
          editable={!isGenerating}
        />

        <ThemedButton
          onPress={startWorkflow}
          disabled={isGenerating || !prompt.trim()}
          loading={isGenerating}
          title={isGenerating ? 'Generating...' : 'Generate Story'}
        />

        <WorkflowStatusBox
          workflowState={workflowState}
          workflowStatusMessages={workflowStatusMessages}
        />

        {workflowState.error && (
          <ThemedText className="mt-2 text-red-500">{workflowState.error}</ThemedText>
        )}

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
                <ThemedText className="mb-2 text-sm opacity-70">
                  Part {index + 1}
                </ThemedText>
                <ThemedText className="mb-4">{part.text}</ThemedText>

                {workflowState.currentStep === 'generating-images' && !part.imageData ? (
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
          </>
        )}
      </ThemedView>
    </SafeAreaScrollView>
  );
}
