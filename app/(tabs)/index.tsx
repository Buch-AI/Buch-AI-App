import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { useStory } from '@/contexts/StoryContext';
import { ImageAdapter } from '@/services/ImageAdapter';
import { LlmAdapter } from '@/services/LlmAdapter';
import Logger from '@/utils/Logger';

interface StoryPart {
  text: string;
  imageData?: string;
}

// TODO: Find a better way to handle this.
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Index() {
  const [prompt, setPrompt] = useState('');
  const { state, dispatch } = useStory();
  const [editableContent, setEditableContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  async function generateImagesForParts(parts: string[]) {
    setIsGeneratingImages(true);
    const imageAdapter = new ImageAdapter();
    const updatedParts: StoryPart[] = [];

    try {
      for (const text of parts) {
        try {
          await delay(5000);
          const imageData = await imageAdapter.generateImage(text);
          Logger.info('Generated image data successfully');
          updatedParts.push({ text, imageData });
        } catch (error) {
          Logger.error(`Failed to generate image for part: ${error}`);
          updatedParts.push({ text }); // Still add the part even if image generation fails
        }
      }
      Logger.info(`Story parts with images: ${updatedParts.length} parts processed`);
      setStoryParts(updatedParts);
    } catch (error) {
      Logger.error(`Failed to generate images: ${error}`);
      dispatch({ type: 'SET_ERROR', payload: `Failed to generate images: ${error}` });
    } finally {
      setIsGeneratingImages(false);
    }
  }

  async function handleGenerateStory() {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      setStoryParts([]);
      dispatch({ type: 'SET_GENERATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      let generatedText = '';
      setEditableContent('');
      Logger.info(`Story generation started with prompt: ${prompt}`);

      const llmAdapter = new LlmAdapter();
      const streamGenerator = llmAdapter.generateStoryStream(prompt);

      for await (const token of streamGenerator) {
        generatedText += token;
        Logger.info(`Story text updated, length: ${generatedText.length}`);
        setEditableContent(generatedText);
      }

      Logger.info(`Story generation completed, length: ${generatedText.length}`);

      const newStory = {
        id: Date.now().toString(),
        prompt,
        content: generatedText,
        authorId: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'SET_CURRENT_STORY', payload: newStory });

      // Split the story and generate images
      const parts = await llmAdapter.splitStory(generatedText);
      await generateImagesForParts(parts);
    } catch (error) {
      Logger.error(`Failed to generate story: ${error}`);
      dispatch({ type: 'SET_ERROR', payload: `Failed to generate story: ${error}` });
    } finally {
      setIsGenerating(false);
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }

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
        />
        <ThemedButton
          onPress={handleGenerateStory}
          disabled={state.isGenerating || !prompt.trim()}
          loading={state.isGenerating}
          title="Generate Story"
        />
        {state.error && <ThemedText className="mt-2 text-red-500">{state.error}</ThemedText>}

        {editableContent !== '' && (
          <>
            {/* TODO: Fix the colouring. Refactor. */}
            <View className="my-6 h-px bg-gray-200 dark:bg-gray-700" />
            <ThemedText type="title">Edit Your Story</ThemedText>
            <ThemedTextInput
              value={editableContent}
              onChangeText={setEditableContent}
              multiline
              className="my-4 h-72 rounded-lg !bg-white/40 p-3 shadow-lg"
              editable={!isGenerating}
            />
            <ThemedButton
              onPress={() => {
                if (state.currentStory) {
                  const updatedStory = {
                    ...state.currentStory,
                    content: editableContent,
                    updatedAt: new Date(),
                  };
                  dispatch({ type: 'UPDATE_STORY', payload: updatedStory });
                }
              }}
              title="Save Changes"
            />

            {(isGeneratingImages || storyParts.length > 0) && (
              <>
                <View className="my-6 h-px bg-gray-200 dark:bg-gray-700" />
                <ThemedText type="title">Story Illustrations</ThemedText>
                {isGeneratingImages ? (
                  <View className="my-4 h-[512px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <ThemedText>Generating images...</ThemedText>
                  </View>
                ) : (
                  storyParts.map((part, index) => (
                    <View key={index} className="my-4">
                      <ThemedText className="mb-2 text-sm opacity-70">Part {index + 1}</ThemedText>
                      <ThemedText className="mb-4">{part.text}</ThemedText>
                      {part.imageData ? (
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
                  ))
                )}
              </>
            )}
          </>
        )}
      </ThemedView>
    </SafeAreaScrollView>
  );
}
