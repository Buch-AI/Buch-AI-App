import { BUCHAI_SERVER_URL } from '@/constants/Config';
import Logger from '@/utils/Logger';

interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  cost_centre_id?: string;
}

interface ImageGenerationResponse {
  data: string; // base64 encoded string
  content_type: string;
}

export class ImageAdapter {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = BUCHAI_SERVER_URL;
  }

  async generateImage(prompt: string, costCentreId: string): Promise<string> {
    try {
      Logger.info(`Starting image generation with prompt: ${prompt}`);

      const url = `${this.baseUrl}/image/generate`;
      Logger.info(`Sending request to: ${url}`);

      const request: ImageGenerationRequest = {
        prompt,
        width: 512,
        height: 512,
        cost_centre_id: costCentreId,
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
          const errorText = await response.text();
          try {
            const errorBody = JSON.parse(errorText);
            errorMessage = errorBody?.detail || response.statusText;
          } catch {
            errorMessage = errorText || response.statusText;
          }
        } catch {
          errorMessage = response.statusText;
        }
        const error = `Image generation failed: ${response.status} ${errorMessage}`;
        Logger.error(error);
        throw new Error(error);
      }

      // Parse the response to get the base64 data and content type
      const responseData = await response.json() as ImageGenerationResponse;
      Logger.info(`Received image data with content type: ${responseData.content_type}`);

      // Create data URL using the base64 string directly
      const dataUrl = `data:${responseData.content_type};base64,${responseData.data}`;

      Logger.info('Image generation completed successfully');
      return dataUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      Logger.error(`Image generation error: ${errorMessage}`);
      throw error;
    }
  }
}
