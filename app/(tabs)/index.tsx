import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';

import { SafeAreaScrollView } from '@/components/ui-custom/SafeAreaScrollView';
import { ThemedText } from '@/components/ui-custom/ThemedText';
import { ThemedTextInput } from '@/components/ui-custom/ThemedTextInput';
import { ThemedView } from '@/components/ui-custom/ThemedView';
import { Button } from '@/components/ui-default/Button';
import { useStory } from '@/contexts/StoryContext';
import { LlmAdapter } from '@/services/LlmAdapter';
import logger from '@/utils/Logger';
import CommunityScreen from './community';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={CreateStoryScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
    </Tab.Navigator>
  );
}

export default TabNavigator;

function CreateStoryScreen() {
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

      const llmAdapter = new LlmAdapter();
      const streamGenerator = llmAdapter.generateStoryStream(prompt);

      for await (const token of streamGenerator) {
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
          placeholder="Enter your story prompt..."
          value={prompt}
          onChangeText={setPrompt}
          multiline
          className="my-4 h-24 rounded-lg p-3"
        />
        <Button
          onPress={handleGenerateStory}
          disabled={state.isGenerating || !prompt.trim()}
          loading={state.isGenerating}>
          Generate Story
        </Button>
        {state.error && <ThemedText className="mt-2 text-red-500">{state.error}</ThemedText>}

        {editableContent !== '' && (
          <>
            <ThemedText type="title" className="mb-2 mt-6">Edit Your Story</ThemedText>
            <ThemedTextInput
              value={editableContent}
              onChangeText={setEditableContent}
              multiline
              className="my-4 h-72 rounded-lg p-3"
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
