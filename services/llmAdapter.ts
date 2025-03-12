import axios from 'axios';
import { BUCHAI_SERVER_URL } from '@/constants/Config';
import logger from '@/utils/logger';

export interface LlmAdaptable {
  generateStoryString(prompt: string): Promise<string>;
  generateStoryStream(prompt: string): void;
}

export class LlmAdapter implements LlmAdaptable {
  constructor() {}

  async generateStoryString(prompt: string): Promise<string> {
    logger.info(`Sending request to: ${BUCHAI_SERVER_URL}/llm/generate_story_string`);

    try {
      const response = await axios.post(`${BUCHAI_SERVER_URL}/llm/generate_story_string`, {
        prompt: prompt,
      });

      return response.data.story;
    } catch (error) {
      logger.error('Failed to generate story string', { error });
      throw error;
    }
  }

  async* generateStoryStream(prompt: string) {
    logger.info(`Sending request to: ${BUCHAI_SERVER_URL}/llm/generate_story_stream`);

    try {
      const response = await fetch(`${BUCHAI_SERVER_URL}/llm/generate_story_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`generateStoryStream HTTP error! status: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorBody)}`);
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
        logger.debug('Token received:', { tokenLength: text.length });
        yield text;
      }
    } catch (error) {
      logger.error('Failed to generate story stream', { error });
      throw error;
    }
  }
}
