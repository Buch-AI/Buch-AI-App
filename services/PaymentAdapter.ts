import { Platform } from 'react-native';
import { BUCHAI_SERVER_URL } from '@/constants/Config';
import Logger from '@/utils/Logger';
import axios from './AxiosInterceptor';

export interface ProductInfo {
  product_id: string;
  name: string;
  description: string;
  price: number; // Price in cents
  currency: string;
  type: 'one_time' | 'credit_purchase' | 'feature_unlock';
}

export interface CreateCheckoutSessionRequest {
  product_id: string;
  quantity: number;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export interface PaymentRecord {
  payment_id: string;
  user_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_type: 'one_time' | 'credit_purchase' | 'feature_unlock';
  product_id: string;
  quantity: number;
  description?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface ProductsResponse {
  data: ProductInfo[];
}

interface PaymentHistoryResponse {
  payments: PaymentRecord[];
  total_count: number;
}

export class PaymentAdapter {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = BUCHAI_SERVER_URL;
  }

  async getProducts(): Promise<ProductInfo[]> {
    try {
      Logger.info('Fetching available products');
      const response = await axios.get<ProductsResponse>(`${this.baseUrl}/payment/products`);
      return response.data.data;
    } catch (error) {
      Logger.error(`Failed to fetch products: ${error}`);
      throw error;
    }
  }

  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    try {
      Logger.info(`Creating checkout session for product: ${request.product_id}`);
      const response = await axios.post<CheckoutSessionResponse>(
        `${this.baseUrl}/payment/create-checkout-session`,
        request,
      );
      return response.data;
    } catch (error) {
      Logger.error(`Failed to create checkout session: ${error}`);
      throw error;
    }
  }

  async getPaymentHistory(limit: number = 50, offset: number = 0): Promise<PaymentHistoryResponse> {
    try {
      Logger.info('Fetching payment history');
      const response = await axios.get<PaymentHistoryResponse>(
        `${this.baseUrl}/payment/history?limit=${limit}&offset=${offset}`,
      );
      return response.data;
    } catch (error) {
      Logger.error(`Failed to fetch payment history: ${error}`);
      throw error;
    }
  }

  /**
   * Check if the current platform supports payments (web only for now)
   */
  static isPaymentSupported(): boolean {
    return Platform.OS === 'web';
  }

  /**
   * Format price from cents to display format
   */
  static formatPrice(priceInCents: number, currency: string = 'USD'): string {
    const price = priceInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price);
  }

  /**
   * Get user-friendly payment status
   */
  static getStatusDisplayText(status: PaymentRecord['status']): string {
    switch (status) {
    case 'pending':
      return 'Pending';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
    }
  }

  /**
   * Get user-friendly payment type
   */
  static getTypeDisplayText(type: PaymentRecord['payment_type']): string {
    switch (type) {
    case 'one_time':
      return 'One-time Purchase';
    case 'credit_purchase':
      return 'Credits';
    case 'feature_unlock':
      return 'Premium Feature';
    default:
      return 'Purchase';
    }
  }
}
