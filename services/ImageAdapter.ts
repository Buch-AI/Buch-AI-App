import { BUCHAI_SERVER_URL } from '@/constants/Config';
import Logger from '@/utils/Logger';

interface ImageGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
}

interface ImageGenerationResponse {
  image_url: string;
}

export class ImageAdapter {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = BUCHAI_SERVER_URL;
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      Logger.info(`Starting image generation with prompt: ${prompt}`);

      const url = `${this.baseUrl}/image/generate`;
      Logger.info(`Sending request to: ${url}`);

      const request: ImageGenerationRequest = {
        prompt,
        width: 512,
        height: 512,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      };

      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });
      } catch (networkError) {
        // TODO: Clean up error handling.
        const errorMessage = networkError instanceof Error ?
          `Network error - ${networkError.message}. Please check your internet connection and try again.` :
          'Network error occurred. Please check your internet connection and try again.';
        Logger.error(`Failed to connect to image generation service: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        let errorMessage;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody?.detail || response.statusText;
        } catch {
          errorMessage = response.statusText;
        }
        const error = `Image generation failed: ${response.status} ${errorMessage}`;
        Logger.error(error);
        throw new Error(error);
      }

      const data = await response.json() as ImageGenerationResponse;
      Logger.info(`Image generation completed. Response data: ${JSON.stringify(data)}`);

      if (!data.image_url) {
        throw new Error('No image URL in response');
      }

      // Ensure the URL is absolute
      const imageUrl = data.image_url.startsWith('http') ?
        data.image_url :
        `${this.baseUrl}${data.image_url}`;

      Logger.info(`Final image URL: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      Logger.error(`Image generation error: ${errorMessage}`);
      throw error;
    }
  }
}
