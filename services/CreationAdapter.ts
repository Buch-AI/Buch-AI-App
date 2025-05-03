import axios from 'axios';
import { BUCHAI_SERVER_URL } from '@/constants/Config';
import Logger from '@/utils/Logger';

interface ImageDataRequest {
  data: string; // base64 encoded string
}

export interface CreationProfile {
  creation_id: string;
  title: string;
  description?: string;
  creator_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  visibility: string;
  tags: string[];
  metadata?: any;
  is_active: boolean;
}

interface CreationProfileUpdate {
  title?: string;
  description?: string;
  status?: string;
  visibility?: string;
  tags?: string[];
}

interface StoryPartsResponse {
  data: string[][];
}

interface ImagesResponse {
  data: string[]; // base64 encoded strings
}

interface VideoResponse {
  data: string; // URL
}

interface TaskStatusResponse {
  status: 'pending' | 'completed' | 'failed';
  message?: string;
}

interface CreationResponse {
  data: string;
}

interface CostCentreResponse {
  data: string;
}

export class CreationAdapter {
  private readonly baseUrl: string;
  private readonly headers: { Authorization: string };

  constructor(token: string) {
    this.baseUrl = BUCHAI_SERVER_URL;
    this.headers = { Authorization: `Bearer ${token}` };
  }

  async setStoryParts(creationId: string, storyParts: string[][]): Promise<string[][]> {
    try {
      Logger.info(`Setting story parts for creation: ${creationId}`);
      const response = await axios.post<StoryPartsResponse>(
        `${this.baseUrl}/creation/${creationId}/set_story_parts`,
        storyParts,
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to set story parts: ${error}`);
      throw error;
    }
  }

  async getStoryParts(creationId: string): Promise<string[][]> {
    try {
      Logger.info(`Getting story parts for creation: ${creationId}`);
      const response = await axios.get<StoryPartsResponse>(
        `${this.baseUrl}/creation/${creationId}/get_story_parts`,
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to get story parts: ${error}`);
      throw error;
    }
  }

  async setImages(creationId: string, images: string[]): Promise<string[]> {
    try {
      Logger.info(`Setting images for creation: ${creationId}`);
      const imageDataArray = images.map((base64Data) => ({ data: base64Data }));
      const response = await axios.post<ImagesResponse>(
        `${this.baseUrl}/creation/${creationId}/set_images`,
        imageDataArray,
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to set images: ${error}`);
      throw error;
    }
  }

  async getImages(creationId: string): Promise<string[]> {
    try {
      Logger.info(`Getting images for creation: ${creationId}`);
      const response = await axios.get<ImagesResponse>(
        `${this.baseUrl}/creation/${creationId}/get_images`,
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to get images: ${error}`);
      throw error;
    }
  }

  async getVideo(creationId: string): Promise<string> {
    try {
      Logger.info(`Getting video for creation: ${creationId}`);
      const response = await axios.get<VideoResponse>(
        `${this.baseUrl}/creation/${creationId}/get_video`,
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to get video: ${error}`);
      throw error;
    }
  }

  async generateVideo(creationId: string): Promise<TaskStatusResponse> {
    try {
      Logger.info(`Generating video for creation: ${creationId}`);
      const response = await axios.get<TaskStatusResponse>(
        `${this.baseUrl}/creation/${creationId}/generate_video`,
        { headers: this.headers },
      );
      return response.data;
    } catch (error) {
      Logger.error(`Failed to generate video: ${error}`);
      throw error;
    }
  }

  async generateVideoStatus(creationId: string): Promise<TaskStatusResponse> {
    try {
      Logger.info(`Getting video generation status for creation: ${creationId}`);
      const response = await axios.get<TaskStatusResponse>(
        `${this.baseUrl}/creation/${creationId}/generate_video_status`,
        { headers: this.headers },
      );
      return response.data;
    } catch (error) {
      Logger.error(`Failed to get video generation status: ${error}`);
      throw error;
    }
  }

  async generateCreation(): Promise<string> {
    try {
      Logger.info('Generating new creation');
      const response = await axios.post<CreationResponse>(
        `${this.baseUrl}/creation/generate`,
        {}, // Empty body for POST request
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to generate creation: ${error}`);
      throw error;
    }
  }

  async generateCostCentre(creationId: string): Promise<string> {
    try {
      Logger.info(`Generating cost centre for creation: ${creationId}`);
      const response = await axios.post<CostCentreResponse>(
        `${this.baseUrl}/creation/${creationId}/cost_centre/generate`,
        {}, // Empty body for POST request
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to generate cost centre: ${error}`);
      throw error;
    }
  }

  async deleteCreation(creationId: string): Promise<string> {
    try {
      Logger.info(`Deleting creation: ${creationId}`);
      const response = await axios.delete<CreationResponse>(
        `${this.baseUrl}/creation/${creationId}/delete`,
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to delete creation: ${error}`);
      throw error;
    }
  }

  async updateCreation(creationId: string, updateData: CreationProfileUpdate): Promise<string> {
    try {
      Logger.info(`Updating creation: ${creationId}`);
      const response = await axios.patch<CreationResponse>(
        `${this.baseUrl}/creation/${creationId}/update`,
        updateData,
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to update creation: ${error}`);
      throw error;
    }
  }
} 