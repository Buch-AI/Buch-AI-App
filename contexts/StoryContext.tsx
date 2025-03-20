import React, { createContext, useContext, useReducer } from 'react';
import logger from '@/utils/Logger';

export interface Story {
  id: string;
  prompt: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StoryState {
  stories: Story[];
  currentStory: Story | null;
  isGenerating: boolean;
  error: string | null;
}

type StoryAction =
  | { type: 'SET_STORIES'; payload: Story[] }
  | { type: 'ADD_STORY'; payload: Story }
  | { type: 'UPDATE_STORY'; payload: Story }
  | { type: 'SET_CURRENT_STORY'; payload: Story | null }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const StoryContext = createContext<{
  state: StoryState;
  dispatch: React.Dispatch<StoryAction>;
} | null>(null);

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storyReducer, {
    stories: [],
    currentStory: null,
    isGenerating: false,
    error: null,
  });

  logger.debug('Story context state updated', {
    isGenerating: state.isGenerating,
    hasError: !!state.error,
    hasStory: !!state.currentStory,
  });

  return <StoryContext.Provider value={{ state, dispatch }}>{children}</StoryContext.Provider>;
}

export function useStory() {
  const context = useContext(StoryContext);
  if (!context) throw new Error('useStory must be used within a StoryProvider');
  return context;
}

function storyReducer(state: StoryState, action: StoryAction): StoryState {
  logger.debug('Story reducer action', { type: action.type });

  switch (action.type) {
  case 'SET_GENERATING':
    return { ...state, isGenerating: action.payload };
  case 'SET_ERROR':
    return { ...state, error: action.payload };
  case 'SET_CURRENT_STORY':
    logger.info('Setting current story', { storyId: action.payload?.id });
    return { ...state, currentStory: action.payload };
  case 'UPDATE_STORY':
    logger.info('Updating story', { storyId: action.payload.id });
    return { ...state, currentStory: action.payload };
  default:
    return state;
  }
}
