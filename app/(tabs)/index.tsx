import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedButton } from '@/components/ui-custom/ThemedButton';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { useStory } from '@/contexts/StoryContext';
import { LlmAdapter } from '@/services/LlmAdapter';
import Logger from '@/utils/Logger';

export default function Index() {
  const [prompt, setPrompt] = useState('');
  const { state, dispatch } = useStory();
  const [editableContent, setEditableContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerateStory() {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
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
          </>
        )}
      </ThemedView>
    </SafeAreaScrollView>
  );
}
