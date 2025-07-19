import axios from './AxiosInterceptor';
import { BUCHAI_SERVER_URL } from '@/constants/Config';
import Logger from '@/utils/Logger';
import { CreationProfile } from './CreationAdapter';
interface CreationsResponse {
  data: CreationProfile[];
}

export class MeAdapter {
  private readonly baseUrl: string;
  private readonly headers: { Authorization: string };

  constructor(token: string) {
    this.baseUrl = BUCHAI_SERVER_URL;
    this.headers = { Authorization: `Bearer ${token}` };
  }

  async getUserCreations(): Promise<CreationProfile[]> {
    try {
      Logger.info('Fetching user creations');
      const response = await axios.get<CreationsResponse>(`${this.baseUrl}/me/creations`, {
        headers: this.headers,
      });
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to fetch user creations: ${error}`);
      throw error;
    }
  }
}
