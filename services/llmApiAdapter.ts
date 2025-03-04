import { HF_API_KEY } from '../constants/Config';
import { HfInference } from '@huggingface/inference';
import logger from '../utils/logger';

export interface LlmApiAdapter {
  generateStoryString(prompt: string): Promise<string>;
  generateStoryStream(prompt: string): void;
}

export class HuggingFaceApiAdapter implements LlmApiAdapter {
  hfModelId: string;
  hfInference: HfInference;

  constructor() {
    this.hfModelId = 'TinyLlama/TinyLlama-1.1B-Chat-v1.0';
    this.hfInference = new HfInference(HF_API_KEY);
  }

  async generateStoryString(prompt: string): Promise<string> {
    try {
      const instructPrompt = [
        `<|system|>You are a creative story writer.`,
        `<|user|>Write a story about: ${prompt}`,
        `<|assistant|>`
      ].join("\n");
  
      const response = await this.hfInference.textGeneration({
        model: this.hfModelId,
        inputs: instructPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.8,
          top_p: 0.9,
          repetition_penalty: 1.1,
          do_sample: true,
          return_full_text: false,
        },
      });
  
      return response.generated_text;
    } catch (error) {
      logger.error('Failed to generate story:', { error });
      throw error;
    }
  }
  
  async * generateStoryStream(prompt: string) {
    try {
      const instructPrompt = [
        `<|system|>You are a creative story writer.`,
        `<|user|>Write a story about: ${prompt}`,
        `<|assistant|>`
      ].join("\n");
  
      const stream = await this.hfInference.textGenerationStream({
        model: this.hfModelId,
        inputs: instructPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.8,
          top_p: 0.9,
          repetition_penalty: 1.1,
          do_sample: true,
          return_full_text: false,
        },
      });
  
      for await (const response of stream) {
        logger.debug('Token received:', { tokenLength: response.token.text.length });
        yield response.token.text;
      }
    } catch (error) {
      logger.error('Failed to generate story stream:', { error });
      throw error;
    }
  }  
}