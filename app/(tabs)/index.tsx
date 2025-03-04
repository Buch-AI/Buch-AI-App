import React, { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { Button } from '@/components/ui/Button';
import { useStory } from '@/contexts/StoryContext';
import { HuggingFaceApiAdapter } from '@/services/llmApiAdapter';
import { SafeAreaScrollView } from '@/components/SafeAreaScrollView';
import logger from '@/utils/logger';

export default function CreateStoryScreen() {
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
      logger.info('Story generation started', { prompt });

      const huggingFaceApiAdapter = new HuggingFaceApiAdapter();
      const generator = huggingFaceApiAdapter.generateStoryStream(prompt);

      for await (const token of generator) {
        generatedText += token;
        logger.debug('Story text updated', { length: generatedText.length });
        setEditableContent(generatedText);
      }

      logger.info('Story generation completed', { length: generatedText.length });

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
      logger.error('Failed to generate story', { error });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate story' });
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
          placeholder="Enter your story prompt..."
          value={prompt}
          onChangeText={setPrompt}
          multiline
          className="h-24 my-4 p-3 rounded-lg"
        />
        <Button
          onPress={handleGenerateStory}
          disabled={state.isGenerating || !prompt.trim()}
          loading={state.isGenerating}>
          Generate Story
        </Button>
        {state.error && <ThemedText className="text-red-500 mt-2">{state.error}</ThemedText>}

        {editableContent !== '' && (
          <>
            <ThemedText type="subtitle" className="mt-6 mb-2">Edit Your Story</ThemedText>
            <ThemedTextInput
              value={editableContent}
              onChangeText={setEditableContent}
              multiline
              className="h-72 my-4 p-3 rounded-lg"
              editable={!isGenerating}
            />
            <Button
              onPress={() => {
                if (state.currentStory) {
                  const updatedStory = {
                    ...state.currentStory,
                    content: editableContent,
                    updatedAt: new Date(),
                  };
                  dispatch({ type: 'UPDATE_STORY', payload: updatedStory });
                }
              }}>
              Save Changes
            </Button>
          </>
        )}
      </ThemedView>
    </SafeAreaScrollView>
  );
}
