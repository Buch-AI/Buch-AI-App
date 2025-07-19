import { BUCHAI_SERVER_URL } from '@/constants/Config';
import Logger from '@/utils/Logger';
import axios from './AxiosInterceptor';

export interface LlmAdaptable {
  generateStoryString(prompt: string, costCentreId?: string): Promise<string>;
  generateStoryStream(prompt: string, costCentreId?: string): void;
  splitStory(prompt: string, costCentreId?: string): Promise<string[][]>;
  summariseStory(story: string, costCentreId?: string): Promise<string>;
  generateImagePrompts(story: string, storyParts: string[], costCentreId?: string): Promise<string[]>;
}

export class LlmAdapter implements LlmAdaptable {
  constructor() {}

  async generateStoryString(prompt: string, costCentreId?: string): Promise<string> {
    try {
      Logger.info(`Sending request to: ${BUCHAI_SERVER_URL}/llm/generate_story_string`);
      const response = await axios.post(`${BUCHAI_SERVER_URL}/llm/generate_story_string`, {
        prompt: prompt,
        model_type: 'lite',
        cost_centre_id: costCentreId,
      });

      return response.data.story;
    } catch (error) {
      Logger.error(`Failed to generate story string: ${error}`);
      throw error;
    }
  }

  async* generateStoryStream(prompt: string, costCentreId?: string) {
    try {
      Logger.info(`Sending request to: ${BUCHAI_SERVER_URL}/llm/generate_story_stream`);
      // Using fetch because axios doesn't support streaming
      const response = await fetch(`${BUCHAI_SERVER_URL}/llm/generate_story_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          prompt: prompt,
          model_type: 'lite',
          cost_centre_id: costCentreId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`generateStoryStream HTTP error! Status: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorBody)}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader from response body.');
      }
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        Logger.info(`Token received. Text length: ${text.length}`);
        yield text;
      }
    } catch (error) {
      Logger.error(`Failed to generate story stream: ${error}`);
      throw error;
    }
  }

  async splitStory(prompt: string, costCentreId?: string): Promise<string[][]> {
    try {
      Logger.info(`Sending request to: ${BUCHAI_SERVER_URL}/llm/split_story`);
      const response = await axios.post(`${BUCHAI_SERVER_URL}/llm/split_story`, {
        prompt: prompt,
        model_type: 'lite',
        cost_centre_id: costCentreId,
      });

      return response.data;
    } catch (error) {
      // TODO: Clean up error handling.
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.detail || error.response.statusText;
        Logger.error(`Failed to split story: ${errorMessage}`);
        throw new Error(`Story splitting failed: ${error.response.status} ${errorMessage}`);
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Logger.error(`Failed to split story: ${errorMessage}`);
      throw new Error(`Story splitting failed: ${errorMessage}`);
    }
  }

  async summariseStory(story: string, costCentreId?: string): Promise<string> {
    try {
      Logger.info(`Sending request to: ${BUCHAI_SERVER_URL}/llm/summarise_story`);
      const response = await axios.post(`${BUCHAI_SERVER_URL}/llm/summarise_story`, {
        story: story,
        model_type: 'lite',
        cost_centre_id: costCentreId,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.detail || error.response.statusText;
        Logger.error(`Failed to summarize story: ${errorMessage}`);
        throw new Error(`Story summarization failed: ${error.response.status} ${errorMessage}`);
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Logger.error(`Failed to summarize story: ${errorMessage}`);
      throw new Error(`Story summarization failed: ${errorMessage}`);
    }
  }

  async generateImagePrompts(story: string, storyParts: string[], costCentreId?: string): Promise<string[]> {
    try {
      Logger.info(`Sending request to: ${BUCHAI_SERVER_URL}/llm/generate_image_prompts`);
      const response = await axios.post(`${BUCHAI_SERVER_URL}/llm/generate_image_prompts`, {
        story: story,
        story_parts: storyParts,
        model_type: 'lite',
        cost_centre_id: costCentreId,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.detail || error.response.statusText;
        Logger.error(`Failed to generate image prompts: ${errorMessage}`);
        throw new Error(`Image prompt generation failed: ${error.response.status} ${errorMessage}`);
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Logger.error(`Failed to generate image prompts: ${errorMessage}`);
      throw new Error(`Image prompt generation failed: ${errorMessage}`);
    }
  }
}
