import { HF_API_KEY } from '../constants/Config';
import { HfInference } from '@huggingface/inference';
import logger from '../utils/logger';

const MODEL_ID = 'TinyLlama/TinyLlama-1.1B-Chat-v1.0';

const hf = new HfInference(HF_API_KEY);

export async function generateStory(prompt: string): Promise<string> {
  try {
    const instructPrompt = `<|system|>You are a creative story writer.
<|user|>Write a story about: ${prompt}
<|assistant|>`;

    const response = await hf.textGeneration({
      model: MODEL_ID,
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

export async function* generateStoryStream(prompt: string) {
  try {
    const instructPrompt = `<|system|>You are a creative story writer.
<|user|>Write a story about: ${prompt}
<|assistant|>`;

    const stream = await hf.textGenerationStream({
      model: MODEL_ID,
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
