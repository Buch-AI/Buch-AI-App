import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

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

      const huggingFaceApiAdapter = new HuggingFaceApiAdapter;
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
      <ThemedView style={styles.container}>
        <ThemedText type="title">Create Your Story</ThemedText>
        <ThemedTextInput
          placeholder="Enter your story prompt..."
          value={prompt}
          onChangeText={setPrompt}
          multiline
          style={styles.promptInput}/>
        <Button
          onPress={handleGenerateStory}
          disabled={state.isGenerating || !prompt.trim()}
          loading={state.isGenerating}>
          Generate Story
        </Button>
        {state.error && <ThemedText style={styles.error}>{state.error}</ThemedText>}

        {editableContent !== '' && (
          <>
            <ThemedText type="subtitle" style={styles.editingTitle}>Edit Your Story</ThemedText>
            <ThemedTextInput
              value={editableContent}
              onChangeText={setEditableContent}
              multiline
              style={styles.storyEditor}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  promptInput: {
    height: 100,
    marginVertical: 16,
    padding: 12,
    borderRadius: 8,
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
  editingTitle: {
    marginTop: 24,
    marginBottom: 8,
  },
  storyEditor: {
    height: 300,
    marginVertical: 16,
    padding: 12,
    borderRadius: 8,
  },
});
